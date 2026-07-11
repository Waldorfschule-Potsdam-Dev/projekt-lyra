import { useEffect, useState, useCallback } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

interface InstallPromptState {
  canInstall: boolean;
  isIOSPrompt: boolean;
  isInstalled: boolean;
  install: () => Promise<'accepted' | 'dismissed' | 'unavailable' | 'ios-instructions'>;
  dismiss: () => void;
  dismissed: boolean;
}

const isIOS = () => {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent) || 
         (navigator.userAgent.includes('Mac') && navigator.maxTouchPoints > 1); // iPadOS
};

const DISMISS_KEY = 'escape-install-prompt-dismissed';

export function useInstallPrompt(): InstallPromptState {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(() => {
    if (typeof window === 'undefined') return false;
    return (
      window.matchMedia('(display-mode: standalone)').matches ||
      (navigator as Navigator & { standalone?: boolean }).standalone === true
    );
  });
  const [dismissed, setDismissed] = useState(() => {
    try {
      return localStorage.getItem(DISMISS_KEY) === '1';
    } catch {
      return false;
    }
  });
  const [isIOSPrompt, setIsIOSPrompt] = useState(false);

  useEffect(() => {
    if (isInstalled) return;
    if (isIOS()) {
      setIsIOSPrompt(true);
    }
  }, [isInstalled]);

  useEffect(() => {
    if (isInstalled) return;

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      if (typeof window !== 'undefined' && (window as any).umami) {
        (window as any).umami.track('pwa_installed', { platform: isIOS() ? 'ios' : 'android_desktop' });
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [isInstalled]);

  const install = useCallback(async (): Promise<'accepted' | 'dismissed' | 'unavailable' | 'ios-instructions'> => {
    if (isIOSPrompt) {
      return 'ios-instructions';
    }
    if (!deferredPrompt) return 'unavailable';
    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    if (choice.outcome === 'accepted') {
      setIsInstalled(true);
    }
    return choice.outcome;
  }, [deferredPrompt, isIOSPrompt]);

  const dismiss = useCallback(() => {
    setDismissed(true);
    try {
      localStorage.setItem(DISMISS_KEY, '1');
    } catch {
      /* noop */
    }
  }, []);

  return {
    canInstall: !!deferredPrompt && !isInstalled,
    isIOSPrompt,
    isInstalled,
    install,
    dismiss,
    dismissed
  };
}