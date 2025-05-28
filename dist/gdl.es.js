class GameDownloadLib {
  static playSound() {
    const audio = new Audio("data:audio/wav;base64,/* base64 encoded short sound */");
    audio.volume = 0.3;
    audio.play().catch((e) => console.warn("Sound playback failed:", e));
  }
  static vibrate() {
    if ("vibrate" in navigator) {
      navigator.vibrate([100, 50, 100]);
    }
  }
  static initDownload(config) {
    var _a;
    const button = document.getElementById(config.buttonId);
    if (!button) return;
    const {
      waitTime = 3,
      messages = {
        waiting: "Preparing file...",
        ready: "Download now!"
      },
      enableSound = true,
      enableVibration = true,
      theme = "auto"
    } = config;
    if (theme === "dark" || theme === "auto" && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      button.classList.add("gdl-dark");
    }
    button.disabled = true;
    button.textContent = messages.waiting;
    const fileType = (_a = config.url.split(".").pop()) == null ? void 0 : _a.toLowerCase();
    const icons = {
      apk: "📱",
      exe: "💻",
      zip: "🗜️",
      pdf: "📄"
    };
    const icon = icons[fileType || ""] || "📥";
    button.innerHTML = `${icon} ${button.textContent}`;
    let secondsLeft = waitTime;
    const countdown = setInterval(() => {
      var _a2, _b, _c, _d;
      secondsLeft--;
      button.innerHTML = `${icon} ${messages.waiting} (${secondsLeft}s...)`;
      if (secondsLeft <= 0) {
        clearInterval(countdown);
        button.disabled = false;
        button.innerHTML = `${icon} ${messages.ready}`;
        if (enableSound) this.playSound();
        if (enableVibration) this.vibrate();
        if ((_a2 = config.analytics) == null ? void 0 : _a2.gaTrackingId) {
          (_b = window.gtag) == null ? void 0 : _b.call(window, "event", "download_ready", {
            file_url: config.url
          });
        }
        (_d = (_c = config.analytics) == null ? void 0 : _c.customTracker) == null ? void 0 : _d.call(_c, "download_ready");
      }
    }, 1e3);
    button.onclick = () => {
      var _a2, _b, _c, _d;
      window.location.href = config.url;
      if ((_a2 = config.analytics) == null ? void 0 : _a2.gaTrackingId) {
        (_b = window.gtag) == null ? void 0 : _b.call(window, "event", "download_start", {
          file_url: config.url
        });
      }
      (_d = (_c = config.analytics) == null ? void 0 : _c.customTracker) == null ? void 0 : _d.call(_c, "download_start");
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
