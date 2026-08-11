(function () {
  const tabs = document.querySelectorAll("[data-diagram-tab]");
  const frame = document.getElementById("diagram-frame");
  const navLinks = document.querySelector(".nav-links");
  const toggle = document.querySelector(".mobile-toggle");

  if (tabs.length && frame) {
    tabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        tabs.forEach((t) => t.classList.remove("active"));
        tab.classList.add("active");
        frame.src = tab.dataset.diagramTab;
      });
    });
  }

  if (toggle && navLinks) {
    toggle.addEventListener("click", () => {
      navLinks.classList.toggle("open");
    });
  }
})();
