import curses
import time
import subprocess
import yaml
import os
import threading
import sys
import re

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
CONFIG = "/var/www/escape/dashboard/teams.yaml"
BASE_DIR = "/var/www/escape"
SRC_DIR = f"{BASE_DIR}/src"

def get_teams():
    try:
        with open(CONFIG, 'r') as f:
            data = yaml.safe_load(f)
        return data.get('teams', [])
    except:
        return []

def get_all_listening_ports():
    try:
        res = subprocess.run(["sudo", "lsof", "-i", "-P", "-n", "-sTCP:LISTEN"], capture_output=True, text=True)
        ports = set()
        for line in res.stdout.split('\n'):
            match = re.search(r'TCP\s+.*?:(\d+)\s+\(LISTEN\)', line)
            if match:
                ports.add(match.group(1))
        return ports
    except:
        return set()

def kill_port(port):
    try:
        res = subprocess.run(["sudo", "lsof", "-t", "-i", f":{port}", "-sTCP:LISTEN"], capture_output=True, text=True)
        pids = res.stdout.strip().split()
        for pid in pids:
            subprocess.run(["sudo", "kill", "-9", pid])
    except:
        pass

def get_last_log_line(log_path):
    try:
        if os.path.exists(log_path):
            with open(log_path, 'rb') as f:
                f.seek(0, 2)
                size = f.tell()
                f.seek(max(size - 256, 0))
                lines = f.readlines()
                if lines:
                    last_line = lines[-1].decode('utf-8', errors='ignore').strip()
                    last_line = re.sub(r'\x1b\[[0-9;]*m', '', last_line)
                    last_line = last_line.replace('\x00', '')
                    return last_line
    except:
        pass
    return "-"

def get_folders():
    if not os.path.exists(SRC_DIR):
        return []
    return sorted([f for f in os.listdir(SRC_DIR) if os.path.isdir(os.path.join(SRC_DIR, f))])

def get_team_folders(username):
    folders = []
    try:
        for f in get_folders():
            res = subprocess.run(["sudo", "getfacl", os.path.join(SRC_DIR, f)], capture_output=True, text=True)
            has_access = False
            is_owner = False
            for line in res.stdout.split('\n'):
                if line.startswith(f"user:{username}:") and 'w' in line:
                    has_access = True
                if line.startswith(f"# owner: {username}"):
                    is_owner = True
                if is_owner and line.startswith("user::") and 'w' in line:
                    has_access = True
                    
            if has_access:
                folders.append(f)
    except:
        pass
    return folders

class AdminApp:
    def __init__(self, stdscr):
        self.stdscr = stdscr
        self.teams = get_teams()
        self.statuses = {} # (team_idx, col_idx): bool
        self.dash_status = False
        self.folders = {} # team_idx: list of folders
        
        self.current_tab = 0 # 0: Servers, 1: Teams
        self.selected_row = 0
        self.selected_col = 0 # for Servers: 0=Dev, 1=OpenCode, 2=VSCode
        self.scroll_offset = 0
        
        self.running = True
        self.message = "Welcome to Escape Admin Console"
        
        # Colors
        curses.start_color()
        curses.use_default_colors()
        curses.init_pair(1, curses.COLOR_GREEN, -1)
        curses.init_pair(2, curses.COLOR_RED, -1)
        curses.init_pair(3, curses.COLOR_BLACK, curses.COLOR_WHITE) # Highlight
        curses.init_pair(4, curses.COLOR_YELLOW, -1) # Warning/Message
        curses.init_pair(5, curses.COLOR_CYAN, -1)
        curses.curs_set(0)
        self.stdscr.nodelay(1)
        self.stdscr.timeout(100)
        
        self.refresh_thread = threading.Thread(target=self.status_loop, daemon=True)
        self.refresh_thread.start()

    def get_log_path(self, username, col):
        if col == 0:
            return f"/tmp/pnpm_dev_{username}.log"
        elif col == 1:
            return f"/tmp/opencode_{username}.log"
        else:
            return f"/tmp/vscode_{username}.log"

    def status_loop(self):
        while self.running:
            ports = get_all_listening_ports()
            self.dash_status = '3333' in ports
            for r, team in enumerate(self.teams):
                if not self.running: break
                dev_url = team.get('devserver_url', '').replace('https://', '').split('.')[0]
                oc_url = team.get('opencode_url', '').replace('https://', '').split('.')[0]
                vs_url = team.get('vscode_url', '').replace('https://', '').split('.')[0]
                
                self.statuses[(r, 0)] = dev_url in ports
                self.statuses[(r, 1)] = oc_url in ports
                self.statuses[(r, 2)] = vs_url in ports
                
                if r not in self.folders:
                    self.folders[r] = get_team_folders(team['username'])
            time.sleep(2)

    def draw(self):
        self.stdscr.erase()
        h, w = self.stdscr.getmaxyx()
        
        self.stdscr.addstr(0, 0, "=== ESCAPE ADMIN CONSOLE ===", curses.A_BOLD | curses.color_pair(5))
        
        tab_str = "[1] Servers   [2] Teams   [q] Quit"
        self.stdscr.addstr(1, 0, tab_str)
        
        if self.current_tab == 0:
            self.draw_servers()
        else:
            self.draw_teams()
            
        if self.message:
            self.stdscr.addstr(h-2, 0, f" MSG: {self.message} ".ljust(w-1)[:w-1], curses.color_pair(4))
            
        self.stdscr.refresh()

    def draw_servers(self):
        h, w = self.stdscr.getmaxyx()
        dash_color = curses.color_pair(1) if self.dash_status else curses.color_pair(2)
        dash_text = "[RUNNING]" if self.dash_status else "[STOPPED]"
        self.stdscr.addstr(3, 0, "Dashboard (3333): ")
        self.stdscr.addstr(3, 18, dash_text, dash_color)
        
        col_w = max(22, (w - 18) // 3)
        self.stdscr.addstr(5, 0, f"{'Team':<15} | {'Dev':<{col_w-3}} | {'OpenCode':<{col_w-3}} | {'VSCode':<{col_w-3}}")
        
        sep_len = min(w-1, 15 + 3 + 3*col_w)
        self.stdscr.addstr(6, 0, "-"*sep_len)
        
        rows_per_team = 3
        max_visible_teams = max(1, (h - 13) // rows_per_team)
        
        if self.selected_row < self.scroll_offset:
            self.scroll_offset = self.selected_row
        elif self.selected_row >= self.scroll_offset + max_visible_teams:
            self.scroll_offset = self.selected_row - max_visible_teams + 1

        for i in range(max_visible_teams):
            r = self.scroll_offset + i
            if r >= len(self.teams):
                break
                
            team = self.teams[r]
            y = 7 + i * rows_per_team
            username = team['username']
            
            # Line 1: Team Name
            if r == self.selected_row:
                self.stdscr.addstr(y, 0, f"{team['name']:<15} |", curses.A_BOLD)
            else:
                self.stdscr.addstr(y, 0, f"{team['name']:<15} |")
                
            self.stdscr.addstr(y+1, 0, f"{'':<15} |")
            
            for c in range(3):
                status = self.statuses.get((r, c), False)
                text = "[RUNNING]" if status else "[STOPPED]"
                color = curses.color_pair(1) if status else curses.color_pair(2)
                port = self.get_port_for_cell(r, c)
                log_path = self.get_log_path(username, c)
                log_line = get_last_log_line(log_path)
                
                max_log_len = col_w - 6
                if len(log_line) > max_log_len:
                    log_line = log_line[:max_log_len-3] + "..."
                
                x = 18 + c * col_w
                attr = curses.color_pair(3) if r == self.selected_row and c == self.selected_col else color
                
                status_str = f"{text} P:{port}"
                self.stdscr.addstr(y, x, status_str.ljust(col_w-2)[:col_w-2], attr)
                
                log_str = f"L: {log_line}"
                self.stdscr.addstr(y+1, x, log_str.ljust(col_w-2)[:col_w-2], curses.color_pair(5))
                
                if c < 2:
                    self.stdscr.addstr(y, x + col_w - 2, " | ")
                    self.stdscr.addstr(y+1, x + col_w - 2, " | ")

        self.stdscr.addstr(h-5, 0, "-"*sep_len)
        self.stdscr.addstr(h-4, 0, " [Arrows] Nav  [Enter] View Log  [s/k/r] Start/Kill/Restart Cell  [a] Start Row")
        self.stdscr.addstr(h-3, 0, " [S/K/R] Start/Kill/Restart Type  [A] Start All  [D/X] Dash")

    def draw_teams(self):
        h, w = self.stdscr.getmaxyx()
        
        col_w = max(22, (w - 18) // 3)
        self.stdscr.addstr(5, 0, f"{'Team':<15} | {'User (Pass)':<{col_w-3}} | {'Ports (Dev/OC/VS)':<{col_w-3}} | {'Folders (Write Access)':<{col_w-3}}")
        
        sep_len = min(w-1, 15 + 3 + 3*col_w)
        self.stdscr.addstr(6, 0, "-"*sep_len)
        
        rows_per_team = 3
        max_visible_teams = max(1, (h - 13) // rows_per_team)
        
        if self.selected_row < self.scroll_offset:
            self.scroll_offset = self.selected_row
        elif self.selected_row >= self.scroll_offset + max_visible_teams:
            self.scroll_offset = self.selected_row - max_visible_teams + 1

        for i in range(max_visible_teams):
            r = self.scroll_offset + i
            if r >= len(self.teams):
                break
                
            team = self.teams[r]
            y = 7 + i * rows_per_team
            username = team.get('username', '')
            password = team.get('password', '')
            user_pass = f"{username} ({password})"
            
            p_dev = self.get_port_for_cell(r, 0)
            p_oc = self.get_port_for_cell(r, 1)
            p_vs = self.get_port_for_cell(r, 2)
            ports_str = f"Dev: {p_dev}, OC: {p_oc}"
            
            folders = ", ".join(self.folders.get(r, []))
            if not folders:
                folders = "-"
            
            if r == self.selected_row:
                self.stdscr.addstr(y, 0, f"{team.get('name',''):<15} |", curses.color_pair(3) | curses.A_BOLD)
            else:
                self.stdscr.addstr(y, 0, f"{team.get('name',''):<15} |")
                
            self.stdscr.addstr(y+1, 0, f"{'':<15} |")
            
            self.stdscr.addstr(y, 18, f"{user_pass:<{col_w-2}} |")
            self.stdscr.addstr(y+1, 18, f"{'':<{col_w-2}} |")
            
            self.stdscr.addstr(y, 18 + col_w, f"{ports_str:<{col_w-2}} |")
            self.stdscr.addstr(y+1, 18 + col_w, f"{f'VSCode: {p_vs}':<{col_w-2}} |", curses.color_pair(5))
            
            f_max = col_w - 2
            if len(folders) <= f_max:
                self.stdscr.addstr(y, 18 + 2*col_w, f"{folders:<{f_max}}")
                self.stdscr.addstr(y+1, 18 + 2*col_w, f"{'':<{f_max}}")
            else:
                self.stdscr.addstr(y, 18 + 2*col_w, f"{folders[:f_max]:<{f_max}}")
                f_rest = folders[f_max:]
                if len(f_rest) > f_max:
                    f_rest = f_rest[:f_max-3] + "..."
                self.stdscr.addstr(y+1, 18 + 2*col_w, f"{f_rest:<{f_max}}", curses.color_pair(5))

        self.stdscr.addstr(h-5, 0, "-"*sep_len)
        self.stdscr.addstr(h-4, 0, " [↑/↓] Navigate   [Enter] Manage Folders   [n] Create User/ACLs   [e] Edit Config ")

    def run_cmd(self, cmd, msg=None):
        if msg:
            self.message = msg
        else:
            self.message = f"Running: {' '.join(cmd)}..."
        self.draw()
        subprocess.Popen(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        if not msg:
            self.message = "Command launched."

    def handle_input(self):
        try:
            c = self.stdscr.getch()
        except:
            return
            
        if c == -1: return
        
        if c == ord('q') or c == 3:
            self.running = False
        elif c == ord('1'):
            self.current_tab = 0
            self.selected_row = 0
            self.selected_col = 0
            self.scroll_offset = 0
        elif c == ord('2'):
            self.current_tab = 1
            self.selected_row = 0
            self.scroll_offset = 0
            
        if self.current_tab == 0:
            if c == curses.KEY_UP:
                self.selected_row = max(0, self.selected_row - 1)
            elif c == curses.KEY_DOWN:
                self.selected_row = min(len(self.teams) - 1, self.selected_row + 1)
            elif c == curses.KEY_LEFT:
                self.selected_col = max(0, self.selected_col - 1)
            elif c == curses.KEY_RIGHT:
                self.selected_col = min(2, self.selected_col + 1)
            elif c == 10 or c == 13:
                self.view_log()
            elif c == ord('k'):
                self.kill_selected()
            elif c == ord('s'):
                self.start_selected()
            elif c == ord('r'):
                self.restart_selected()
            elif c == ord('a'):
                self.start_row()
            elif c == ord('A'):
                self.start_all()
            elif c == ord('S'):
                self.start_type()
            elif c == ord('K'):
                self.kill_type()
            elif c == ord('R'):
                self.restart_type()
            elif c == ord('D'):
                self.run_cmd(["sudo", f"{SCRIPT_DIR}/run_dashboard.sh"], "Starting Dashboard...")
            elif c == ord('X'):
                self.message = "Killing Dashboard (3333)..."
                self.draw()
                kill_port("3333")
                self.dash_status = False
                self.message = "Killed Dashboard."
        elif self.current_tab == 1:
            if c == curses.KEY_UP:
                self.selected_row = max(0, self.selected_row - 1)
            elif c == curses.KEY_DOWN:
                self.selected_row = min(len(self.teams) - 1, self.selected_row + 1)
            elif c == 10 or c == 13: # Enter
                self.manage_folders()
            elif c == ord('n'):
                curses.endwin()
                subprocess.run(["sudo", f"{SCRIPT_DIR}/manage_teams.sh"])
                self.teams = get_teams()
                self.stdscr.clear()
                self.stdscr.refresh()
            elif c == ord('e'):
                curses.endwin()
                subprocess.run(["nano", CONFIG])
                self.teams = get_teams()
                self.stdscr.clear()
                self.stdscr.refresh()

    def kill_selected(self):
        port = self.get_port_for_cell(self.selected_row, self.selected_col)
        if port:
            self.message = f"Killing port {port}..."
            self.draw()
            kill_port(port)
            self.statuses[(self.selected_row, self.selected_col)] = False
            self.message = f"Killed port {port}."

    def view_log(self):
        team = self.teams[self.selected_row]
        username = team['username']
        log_path = self.get_log_path(username, self.selected_col)
        
        if not os.path.exists(log_path):
            self.message = f"Log file not found: {log_path}"
            return
            
        curses.endwin()
        subprocess.run(["less", "+G", log_path])
        self.stdscr.clear()
        self.stdscr.refresh()

    def get_port_for_cell(self, row, col):
        team = self.teams[row]
        if col == 0:
            return team.get('devserver_url', '').replace('https://', '').split('.')[0]
        elif col == 1:
            return team.get('opencode_url', '').replace('https://', '').split('.')[0]
        else:
            return team.get('vscode_url', '').replace('https://', '').split('.')[0]

    def start_selected(self):
        team = self.teams[self.selected_row]
        username = team['username']
        scripts = ["run_dev.sh", "run_opencode.sh", "run_vscode.sh"]
        script = scripts[self.selected_col]
        self.run_cmd(["sudo", f"{SCRIPT_DIR}/{script}", username], f"Starting {script} for {username}...")

    def restart_selected(self):
        self.kill_selected()
        time.sleep(0.5)
        self.start_selected()

    def start_type(self):
        scripts = ["run_dev.sh", "run_opencode.sh", "run_vscode.sh"]
        script = scripts[self.selected_col]
        self.run_cmd(["sudo", f"{SCRIPT_DIR}/{script}"], f"Starting {script} for ALL teams...")

    def kill_type(self):
        self.message = "Killing all ports for selected type..."
        self.draw()
        for r in range(len(self.teams)):
            port = self.get_port_for_cell(r, self.selected_col)
            if port:
                kill_port(port)
                self.statuses[(r, self.selected_col)] = False
        self.message = "Killed all ports for selected type."

    def restart_type(self):
        self.kill_type()
        time.sleep(1)
        self.start_type()

    def start_row(self):
        team = self.teams[self.selected_row]
        username = team['username']
        self.message = f"Starting all servers for {username}..."
        self.draw()
        subprocess.Popen(["sudo", f"{SCRIPT_DIR}/run_dev.sh", username], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        subprocess.Popen(["sudo", f"{SCRIPT_DIR}/run_opencode.sh", username], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        subprocess.Popen(["sudo", f"{SCRIPT_DIR}/run_vscode.sh", username], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

    def start_all(self):
        self.message = "Starting ALL servers for ALL teams..."
        self.draw()
        subprocess.Popen(["sudo", f"{SCRIPT_DIR}/run_dev.sh"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        subprocess.Popen(["sudo", f"{SCRIPT_DIR}/run_opencode.sh"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        subprocess.Popen(["sudo", f"{SCRIPT_DIR}/run_vscode.sh"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

    def manage_folders(self):
        team = self.teams[self.selected_row]
        username = team['username']
        all_folders = get_folders()
        if not all_folders:
            self.message = "No folders found in src/"
            return
            
        current = list(self.folders.get(self.selected_row, []))
        selected_idx = 0
        
        self.stdscr.timeout(-1)
        
        while True:
            self.stdscr.erase()
            h, w = self.stdscr.getmaxyx()
            
            self.stdscr.addstr(0, 0, f"Manage Folders for {team['name']} ({username})", curses.A_BOLD | curses.color_pair(5))
            self.stdscr.addstr(1, 0, "Space: Toggle | Enter: Save | Esc/q: Cancel")
            self.stdscr.addstr(2, 0, "-"*45)
            
            for i, f in enumerate(all_folders):
                prefix = "[x]" if f in current else "[ ]"
                attr = curses.color_pair(3) if i == selected_idx else curses.A_NORMAL
                if 4+i < h:
                    self.stdscr.addstr(4+i, 0, f"{prefix} {f}", attr)
                
            self.stdscr.refresh()
            c = self.stdscr.getch()
            
            if c == curses.KEY_UP:
                selected_idx = max(0, selected_idx - 1)
            elif c == curses.KEY_DOWN:
                selected_idx = min(len(all_folders) - 1, selected_idx + 1)
            elif c == ord(' '):
                f = all_folders[selected_idx]
                if f in current:
                    current.remove(f)
                else:
                    current.append(f)
            elif c == 10 or c == 13: # Enter
                self.apply_folders(username, current)
                break
            elif c == 27 or c == ord('q'): # Esc or q
                self.message = "Folder changes cancelled."
                break
                
        self.stdscr.timeout(100)

    def apply_folders(self, username, selected_folders):
        self.message = f"Applying folders for {username}..."
        self.draw()
        
        # Use shell commands to ensure exact identical behavior to bash
        os.system(f"sudo setfacl -R -x u:{username} {SRC_DIR} >/dev/null 2>&1")
        os.system(f"sudo setfacl -R -m u:{username}:r-X {BASE_DIR} >/dev/null 2>&1")
        
        for f in selected_folders:
            fpath = os.path.join(SRC_DIR, f)
            os.system(f"sudo setfacl -R -m u:{username}:rwx {fpath} >/dev/null 2>&1")
            os.system(f"sudo setfacl -R -d -m u:{username}:rwx {fpath} >/dev/null 2>&1")
            
        self.message = f"Saved folders for {username}."
        self.folders[self.selected_row] = selected_folders

def main(stdscr):
    app = AdminApp(stdscr)
    while app.running:
        app.draw()
        app.handle_input()
        time.sleep(0.02)

if __name__ == "__main__":
    if os.geteuid() != 0:
        print("Fehler: Dieses Script muss als root (sudo) ausgeführt werden.")
        sys.exit(1)
    curses.wrapper(main)
