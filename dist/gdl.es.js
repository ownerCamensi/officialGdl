const o = {
  init(t) {
    const e = document.getElementById(t.buttonId);
    if (!e) {
      console.error("GDL: Button not found");
      return;
    }
    e.addEventListener("click", () => {
      var n;
      e.textContent = ((n = t.messages) == null ? void 0 : n.waiting) || "Please wait...";
      const i = t.waitTime || 0;
      setTimeout(() => {
        window.location.href = t.url;
      }, i * 1e3);
    });
  }
};
export {
  o as GDL
};
