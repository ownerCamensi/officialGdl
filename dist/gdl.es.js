class EventEmitter {
  constructor() {
    this.events = {};
  }
  on(event, listener) {
    if (!this.events[event]) this.events[event] = [];
    this.events[event].push(listener);
  }
  off(event, listener) {
    if (!this.events[event]) return;
    this.events[event] = this.events[event].filter((l) => l !== listener);
  }
  emit(event, ...args) {
    if (!this.events[event]) return;
    for (const listener of this.events[event]) {
      listener(...args);
    }
  }
}
class GameDownloadLib extends EventEmitter {
  constructor() {
    super(...arguments);
    this.plugins = [];
  }
  static playSound() {
    try {
      const audio = new Audio("data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=");
      audio.volume = 0.3;
      audio.play();
    } catch (e) {
      console.warn("Sound play failed", e);
    }
  }
  static vibrate() {
    if ("vibrate" in navigator) {
      navigator.vibrate([100, 50, 100]);
    }
  }
  static formatSize(bytes) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  }
  static formatSpeed(bytesPerSec) {
    if (bytesPerSec < 1024) return `${bytesPerSec.toFixed(0)} B/s`;
    if (bytesPerSec < 1024 * 1024) return `${(bytesPerSec / 1024).toFixed(1)} KB/s`;
    return `${(bytesPerSec / (1024 * 1024)).toFixed(1)} MB/s`;
  }
  static async getFileSize(url) {
    try {
      const response = await fetch(url, { method: "HEAD" });
      return +(response.headers.get("Content-Length") || 0);
    } catch (e) {
      console.warn("Failed to get file size", e);
      return 0;
    }
  }
  static async downloadWithProgress(url, progressCallback) {
    var _a;
    const response = await fetch(url);
    const reader = (_a = response.body) == null ? void 0 : _a.getReader();
    const contentLength = +(response.headers.get("Content-Length") || 0);
    let receivedLength = 0;
    let lastTime = Date.now();
    let lastLoaded = 0;
    const chunks = [];
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
      receivedLength += value.length;
      if (progressCallback) {
        const now = Date.now();
        const timeDiff = (now - lastTime) / 1e3;
        const loadedDiff = receivedLength - lastLoaded;
        const speed = timeDiff > 0 ? loadedDiff / timeDiff : 0;
        progressCallback({
          total: contentLength,
          loaded: receivedLength,
          percentage: contentLength > 0 ? receivedLength / contentLength * 100 : 0,
          speed: GameDownloadLib.formatSpeed(speed)
        });
        lastTime = now;
        lastLoaded = receivedLength;
      }
    }
    return new Blob(chunks);
  }
  registerPlugin(plugin) {
    this.plugins.push(plugin);
    plugin.init(this);
  }
  async initDownload(config) {
    var _a;
    const button = document.getElementById(config.buttonId);
    if (!button) {
      console.warn(`Button with id "${config.buttonId}" not found`);
      return;
    }
    const {
      waitTime = 3,
      messages = {
        waiting: "Preparing file...",
        ready: "Download now!",
        downloading: "Downloading..."
      },
      enableSound = true,
      enableVibration = true,
      theme = "auto",
      analytics,
      url,
      urls,
      showProgress = false,
      progressCallback,
      showFileSize = true,
      showDownloadSpeed = true
    } = config;
    if (theme === "dark" || theme === "auto" && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      button.classList.add("gdl-dark");
    }
    button.disabled = true;
    button.textContent = messages.waiting;
    const fileName = urls ? urls[0] : url;
    const fileType = ((_a = fileName == null ? void 0 : fileName.split(".").pop()) == null ? void 0 : _a.toLowerCase()) || "";
    const icons = {
      apk: "📱",
      exe: "💻",
      zip: "🗜️",
      pdf: "📄",
      rar: "🗜️",
      mp3: "🎵",
      mp4: "🎥",
      iso: "📀",
      dmg: "🍏",
      deb: "🐧",
      default: "📥"
    };
    const icon = icons[fileType] || icons["default"];
    let secondsLeft = waitTime;
    const updateButton = (msg, extraInfo = "") => {
      button.innerHTML = `${icon} ${msg}${extraInfo ? `<br><small>${extraInfo}</small>` : ""}`;
    };
    let fileSize = 0;
    if (showFileSize && (url || (urls == null ? void 0 : urls[0]))) {
      try {
        fileSize = await GameDownloadLib.getFileSize(url || urls[0]);
      } catch (e) {
        console.warn("Failed to get file size", e);
      }
    }
    const sizeInfo = fileSize > 0 ? ` (${GameDownloadLib.formatSize(fileSize)})` : "";
    updateButton(messages.waiting, sizeInfo);
    const countdown = setInterval(() => {
      var _a2;
      secondsLeft--;
      if (secondsLeft > 0) {
        updateButton(`${messages.waiting} (${secondsLeft})`, sizeInfo);
        this.emit("countdown", secondsLeft);
      } else {
        clearInterval(countdown);
        button.disabled = false;
        updateButton(messages.ready, sizeInfo);
        this.emit("ready");
        if (enableSound) GameDownloadLib.playSound();
        if (enableVibration) GameDownloadLib.vibrate();
        if ((analytics == null ? void 0 : analytics.gaTrackingId) && window.gtag) {
          window.gtag("event", "download_ready", {
            file_url: url || (urls == null ? void 0 : urls.join(",")),
            file_size: fileSize
          });
        }
        (_a2 = analytics == null ? void 0 : analytics.customTracker) == null ? void 0 : _a2.call(analytics, "download_ready", { url, urls, fileSize });
      }
    }, 1e3);
    button.onclick = async () => {
      var _a2;
      if (button.disabled) return;
      if (showProgress && (url || urls && urls.length === 1)) {
        button.disabled = true;
        const downloadUrl = url || urls[0];
        updateButton(messages.downloading || "Downloading...", "0%");
        try {
          const blob = await GameDownloadLib.downloadWithProgress(
            downloadUrl,
            (progress) => {
              const extraInfo = [
                `${progress.percentage.toFixed(1)}%`,
                showFileSize && `${GameDownloadLib.formatSize(progress.loaded)}/${GameDownloadLib.formatSize(progress.total)}`,
                showDownloadSpeed && progress.speed
              ].filter(Boolean).join(" | ");
              updateButton(
                messages.downloading || "Downloading...",
                extraInfo
              );
              if (progressCallback) {
                progressCallback(progress);
              }
            }
          );
          const a = document.createElement("a");
          a.href = URL.createObjectURL(blob);
          a.download = downloadUrl.split("/").pop() || "download";
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(a.href);
          this.emit("download_complete", { url: downloadUrl, size: blob.size });
        } catch (error) {
          updateButton("Download failed", "Please try again");
          this.emit("download_error", { url: downloadUrl, error });
          console.error("Download failed:", error);
          return;
        }
      } else {
        if (urls && urls.length > 1) {
          urls.forEach((u) => window.open(u, "_blank"));
        } else if (url) {
          window.location.href = url;
        } else {
          console.warn("No download URL provided");
          return;
        }
      }
      this.emit("download_click");
      if ((analytics == null ? void 0 : analytics.gaTrackingId) && window.gtag) {
        window.gtag("event", "download_click", {
          file_url: url || (urls == null ? void 0 : urls.join(",")),
          file_size: fileSize
        });
      }
      (_a2 = analytics == null ? void 0 : analytics.customTracker) == null ? void 0 : _a2.call(analytics, "download_click", { url, urls, fileSize });
    };
  }
}
if (typeof window !== "undefined") {
  window.GDL = GameDownloadLib;
}
export {
  GameDownloadLib as GDL,
  GameDownloadLib as default
};
//# sourceMappingURL=gdl.es.js.map
