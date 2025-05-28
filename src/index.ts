type InitOptions = {
  buttonId: string;
  url: string;
  fallbackUrl?: string;
  waitTime?: number;
  trackClicks?: boolean;
  accessProtection?: "none" | "scroll" | "timer";
  messages?: {
    waiting?: string;
    ready?: string;
    failed?: string;
  };
  theme?: "light" | "dark" | string;
};

export const GDL = {
  init(options: InitOptions) {
    const btn = document.getElementById(options.buttonId);
    if (!btn) {
      console.error("GDL: Button not found");
      return;
    }

    btn.addEventListener("click", () => {
      btn.textContent = options.messages?.waiting || "Please wait...";

      const time = options.waitTime || 0;
      setTimeout(() => {
        window.location.href = options.url;
      }, time * 1000);
    });
  },
};
