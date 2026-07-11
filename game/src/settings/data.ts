import { Wifi, Smartphone, Bell, Key, ImageIcon, Users, Layout, Battery, Wrench, Clock, Shield } from 'lucide-react';

export const settingsGroups = [
  {
    items: [
      { id: 'datetime', icon: Clock, label: 'Datum & Uhrzeit', value: '' },
    ]
  },
  {
    items: [
      { id: 'wifi', icon: Wifi, label: 'Netzwerk & Internet', value: 'WLAN, Mobile Daten, Hotspot' },
      { id: 'bt', icon: Smartphone, label: 'Verbundene Geräte', value: 'Bluetooth, Kopplung' },
    ]
  },
  {
    items: [
      { id: 'display', icon: Smartphone, label: 'Display', value: 'Dunkles Design, Schriftgröße, Helligkeit' },
      { id: 'wallpaper', icon: ImageIcon, label: 'Hintergrund', value: 'Startbildschirm, Sperrbildschirm' },
      { id: 'sound', icon: Bell, label: 'Töne & Vibration', value: 'Lautstärke, Vibration, Nicht stören' },
      { id: 'notifications', icon: Bell, label: 'Benachrichtigungen', value: 'Verlauf, Unterhaltungen' },
    ]
  },
  {
    items: [
      { id: 'battery', icon: Battery, label: 'Akku', value: '64% - Noch ca. 8 Std.' },
      { id: 'security', icon: Key, label: 'Sicherheit', value: 'Displaysperre, Fingerabdruck' },
      { id: 'apps', icon: Layout, label: 'Apps', value: 'Berechtigungen, Standard-Apps' },
      { id: 'accounts', icon: Users, label: 'Konten', value: 'YMail, Wazaaah' },
    ]
  },
  {
    items: [
      { id: 'about', icon: Smartphone, label: 'Über das Gerät', value: 'Projekt Lyra OS' },
      { id: 'impressum', icon: Shield, label: 'Rechtliches', value: 'Impressum, Datenschutzerklärung' }
    ]
  }
];
