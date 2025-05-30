// index.ts

// Types
type GDLConfig = {
  buttonId: string;
  url?: string; // single URL or
  urls?: string[]; // multiple files support
  waitTime?: number;
  messages?: {
    waiting: string;
    ready: string;
    downloading?: string;
  };
  enableSound?: boolean;
  enableVibration?: boolean;
  theme?: 'light' | 'dark' | 'auto';
  analytics?: {
    gaTrackingId?: string;
    customTracker?: (event: string, data?: any) => void;
  };
  showProgress?: boolean;
  progressCallback?: (progress: DownloadProgress) => void;
  showFileSize?: boolean;
  showDownloadSpeed?: boolean;
};

type DownloadProgress = {
  total: number;
  loaded: number;
  percentage: number;
  speed: string; // formatted speed
};

type Plugin = {
  name: string;
  init: (gdl: GameDownloadLib) => void;
};

// Event Emitter for custom events
class EventEmitter {
  private events: Record<string, Array<(...args: any[]) => void>> = {};

  on(event: string, listener: (...args: any[]) => void) {
    if (!this.events[event]) this.events[event] = [];
    this.events[event].push(listener);
  }

  off(event: string, listener: (...args: any[]) => void) {
    if (!this.events[event]) return;
    this.events[event] = this.events[event].filter(l => l !== listener);
  }

  emit(event: string, ...args: any[]) {
    if (!this.events[event]) return;
    for (const listener of this.events[event]) {
      listener(...args);
    }
  }
}

// Main library class
class GameDownloadLib extends EventEmitter {
  private static playSound() {
    try {
      const audio = new Audio('data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=');
      audio.volume = 0.3;
      audio.play();
    } catch (e) {
      console.warn('Sound play failed', e);
    }
  }

  private static vibrate() {
    if ('vibrate' in navigator) {
      navigator.vibrate([100, 50, 100]);
    }
  }

  private static formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  }

  private static formatSpeed(bytesPerSec: number): string {
    if (bytesPerSec < 1024) return `${bytesPerSec.toFixed(0)} B/s`;
    if (bytesPerSec < 1024 * 1024) return `${(bytesPerSec / 1024).toFixed(1)} KB/s`;
    return `${(bytesPerSec / (1024 * 1024)).toFixed(1)} MB/s`;
  }

  private static async getFileSize(url: string): Promise<number> {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      return +(response.headers.get('Content-Length') || 0);
    } catch (e) {
      console.warn('Failed to get file size', e);
      return 0;
    }
  }

  private static async downloadWithProgress(
    url: string, 
    progressCallback?: (progress: DownloadProgress) => void
  ): Promise<Blob> {
    const response = await fetch(url);
    const reader = response.body?.getReader();
    const contentLength = +(response.headers.get('Content-Length') || 0);
    let receivedLength = 0;
    let lastTime = Date.now();
    let lastLoaded = 0;
    
    const chunks: Uint8Array[] = [];
    while (true) {
      const {done, value} = await reader!.read();
      if (done) break;
      
      chunks.push(value);
      receivedLength += value.length;
      
      if (progressCallback) {
        const now = Date.now();
        const timeDiff = (now - lastTime) / 1000; // in seconds
        const loadedDiff = receivedLength - lastLoaded;
        const speed = timeDiff > 0 ? loadedDiff / timeDiff : 0;
        
        progressCallback({
          total: contentLength,
          loaded: receivedLength,
          percentage: contentLength > 0 ? (receivedLength / contentLength) * 100 : 0,
          speed: GameDownloadLib.formatSpeed(speed)
        });
        
        lastTime = now;
        lastLoaded = receivedLength;
      }
    }
    
    return new Blob(chunks);
  }

  plugins: Plugin[] = [];

  registerPlugin(plugin: Plugin) {
    this.plugins.push(plugin);
    plugin.init(this);
  }

  async initDownload(config: GDLConfig) {
    const button = document.getElementById(config.buttonId) as HTMLButtonElement | null;
    if (!button) {
      console.warn(`Button with id "${config.buttonId}" not found`);
      return;
    }

    const {
      waitTime = 3,
      messages = { 
        waiting: 'Preparing file...', 
        ready: 'Download now!',
        downloading: 'Downloading...'
      },
      enableSound = true,
      enableVibration = true,
      theme = 'auto',
      analytics,
      url,
      urls = [],
      showProgress = false,
      progressCallback,
      showFileSize = true,
      showDownloadSpeed = true
    } = config;

    // Apply theme CSS class
    if (theme === 'dark' || (theme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      button.classList.add('gdl-dark');
    }

    button.disabled = true;
    button.textContent = messages.waiting;

    // Icon based on file extension (use first URL or single url)
    const fileName = urls.length > 0 ? urls[0] : url;
    const fileType = fileName?.split('.').pop()?.toLowerCase() || '';
    const icons: Record<string, string> = {
      apk: '📱',
      exe: '💻',
      zip: '🗜️',
      pdf: '📄',
      rar: '🗜️',
      mp3: '🎵',
      mp4: '🎥',
      iso: '📀',
      dmg: '🍏',
      deb: '🐧',
      default: '📥'
    };
    const icon = icons[fileType] || icons['default'];

    let secondsLeft = waitTime;

    const updateButton = (msg: string, extraInfo = '') => {
      button.innerHTML = `${icon} ${msg}${extraInfo ? `<br><small>${extraInfo}</small>` : ''}`;
    };

    // Get file size if enabled
    let fileSize = 0;
    if (showFileSize && (url || urls.length > 0)) {
      try {
        fileSize = await GameDownloadLib.getFileSize(url || urls[0]);
      } catch (e) {
        console.warn('Failed to get file size', e);
      }
    }

    const sizeInfo = fileSize > 0 ? ` (${GameDownloadLib.formatSize(fileSize)})` : '';
    updateButton(messages.waiting, sizeInfo);

    // Countdown timer
    const countdown = setInterval(() => {
      secondsLeft--;
      if (secondsLeft > 0) {
        updateButton(`${messages.waiting} (${secondsLeft})`, sizeInfo);
        this.emit('countdown', secondsLeft);
      } else {
        clearInterval(countdown);
        button.disabled = false;
        updateButton(messages.ready, sizeInfo);
        this.emit('ready');

        if (enableSound) GameDownloadLib.playSound();
        if (enableVibration) GameDownloadLib.vibrate();

        // Analytics event ready
        if (analytics?.gaTrackingId && (window as any).gtag) {
          (window as any).gtag('event', 'download_ready', {
            file_url: url || urls.join(','),
            file_size: fileSize
          });
        }
        analytics?.customTracker?.('download_ready', { url, urls, fileSize });
      }
    }, 1000);

    button.onclick = async () => {
      if (button.disabled) return;

      // If showing progress, handle download differently
      if (showProgress && (url || urls.length === 1)) {
        button.disabled = true;
        const downloadUrl = url || urls[0];
        updateButton(messages.downloading || 'Downloading...', '0%');

        try {
          const blob = await GameDownloadLib.downloadWithProgress(
            downloadUrl,
            (progress) => {
              const extraInfo = [
                `${progress.percentage.toFixed(1)}%`,
                showFileSize && `${GameDownloadLib.formatSize(progress.loaded)}/${GameDownloadLib.formatSize(progress.total)}`,
                showDownloadSpeed && progress.speed
              ].filter(Boolean).join(' | ');
              
              updateButton(
                messages.downloading || 'Downloading...',
                extraInfo
              );
              
              if (progressCallback) {
                progressCallback(progress);
              }
            }
          );

          // Create download link
          const a = document.createElement('a');
          a.href = URL.createObjectURL(blob);
          a.download = downloadUrl.split('/').pop() || 'download';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(a.href);

          this.emit('download_complete', { url: downloadUrl, size: blob.size });
        } catch (error) {
          updateButton('Download failed', 'Please try again');
          this.emit('download_error', { url: downloadUrl, error });
          console.error('Download failed:', error);
          return;
        }
      } else {
        // Original download behavior for multiple files or when progress not enabled
        if (urls.length > 1) {
          // Multi-file download: open each url in new tab
          urls.forEach(u => window.open(u, '_blank'));
        } else if (url) {
          window.location.href = url;
        } else if (urls.length === 1) {
          window.location.href = urls[0];
        } else {
          console.warn('No download URL provided');
          return;
        }
      }

      this.emit('download_click');

      // Analytics event download click
      if (analytics?.gaTrackingId && (window as any).gtag) {
        (window as any).gtag('event', 'download_click', {
          file_url: url || urls.join(','),
          file_size: fileSize
        });
      }
      analytics?.customTracker?.('download_click', { url, urls, fileSize });
    };
  }
}

// Export for ES modules and global window for UMD
export { GameDownloadLib as GDL };
export default GameDownloadLib;

declare global {
  interface Window {
    GDL: typeof GameDownloadLib;
  }
}

// Auto assign to window if running in browser
if (typeof window !== 'undefined') {
  window.GDL = GameDownloadLib;
}
