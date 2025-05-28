type GDLConfig = {
  buttonId: string;
  url: string;
  waitTime?: number;
  messages?: {
    waiting: string;
    ready: string;
  };
  enableSound?: boolean;
  enableVibration?: boolean;
  theme?: 'light' | 'dark' | 'auto';
  analytics?: {
    gaTrackingId?: string;
    customTracker?: (event: string) => void;
  };
};

class GameDownloadLib {
  private static playSound() {
    const audio = new Audio('data:audio/wav;base64,/* base64 encoded short sound */');
    audio.volume = 0.3;
    audio.play().catch(e => console.warn('Sound playback failed:', e));
  }

  private static vibrate() {
    if ('vibrate' in navigator) {
      navigator.vibrate([100, 50, 100]);
    }
  }

  static initDownload(config: GDLConfig) {
    const button = document.getElementById(config.buttonId) as HTMLButtonElement;
    if (!button) return;

    const {
      waitTime = 3,
      messages = {
        waiting: 'Preparing file...',
        ready: 'Download now!'
      },
      enableSound = true,
      enableVibration = true,
      theme = 'auto'
    } = config;

    // Apply theme
    if (theme === 'dark' || (theme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      button.classList.add('gdl-dark');
    }

    button.disabled = true;
    button.textContent = messages.waiting;

    // Add file type icon
    const fileType = config.url.split('.').pop()?.toLowerCase();
    const icons: Record<string, string> = {
      apk: '📱',
      exe: '💻',
      zip: '🗜️',
      pdf: '📄'
    };
    const icon = icons[fileType || ''] || '📥';
    button.innerHTML = `${icon} ${button.textContent}`;

    let secondsLeft = waitTime;
    const countdown = setInterval(() => {
      secondsLeft--;
      button.innerHTML = `${icon} ${messages.waiting} (${secondsLeft}s...)`;
      
      if (secondsLeft <= 0) {
        clearInterval(countdown);
        button.disabled = false;
        button.innerHTML = `${icon} ${messages.ready}`;
        
        if (enableSound) this.playSound();
        if (enableVibration) this.vibrate();
        
        // Track analytics
        if (config.analytics?.gaTrackingId) {
          (window as any).gtag?.('event', 'download_ready', {
            file_url: config.url
          });
        }
        config.analytics?.customTracker?.('download_ready');
      }
    }, 1000);

    button.onclick = () => {
      window.location.href = config.url;
      
      // Track download click
      if (config.analytics?.gaTrackingId) {
        (window as any).gtag?.('event', 'download_start', {
          file_url: config.url
        });
      }
      config.analytics?.customTracker?.('download_start');
    };
  }
}

// Export for both ES modules and global namespace
export { GameDownloadLib as GDL };
export default GameDownloadLib;

// Add to window for UMD build
declare global {
  interface Window {
    GDL: typeof GameDownloadLib;
  }
}

if (typeof window !== 'undefined') {
  window.GDL = GameDownloadLib;
}
