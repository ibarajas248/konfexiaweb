const toggle = document.querySelector("[data-nav-toggle]");
const nav = document.querySelector("[data-nav]");
const header = document.querySelector(".site-header");

const updateHeaderState = () => {
  if (!header) return;
  header.classList.toggle("is-scrolled", window.scrollY > 18);
};

updateHeaderState();
window.addEventListener("scroll", updateHeaderState, { passive: true });

if (toggle && nav) {
  const closeNav = () => {
    nav.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
  };

  toggle.addEventListener("click", () => {
    const expanded = toggle.getAttribute("aria-expanded") === "true";
    toggle.setAttribute("aria-expanded", String(!expanded));
    nav.classList.toggle("is-open");
  });

  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      closeNav();
    });
  });

  document.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    if (nav.classList.contains("is-open") && !nav.contains(target) && !toggle.contains(target)) {
      closeNav();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeNav();
    }
  });
}

const year = document.querySelector("[data-year]");
if (year) {
  year.textContent = String(new Date().getFullYear());
}

const reveals = document.querySelectorAll("[data-reveal]");
if (reveals.length) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.16 }
  );

  reveals.forEach((item) => observer.observe(item));
}

const slider = document.querySelector("[data-slider]");
if (slider) {
  const slides = Array.from(slider.querySelectorAll(".hero-slide"));
  const prev = slider.querySelector("[data-slide-prev]");
  const next = slider.querySelector("[data-slide-next]");
  const dots = Array.from(slider.querySelectorAll("[data-slide-to]"));
  const intervalMs = Number(slider.getAttribute("data-slider-interval")) || 7000;
  let activeIndex = slides.findIndex((slide) => slide.classList.contains("is-active"));
  if (activeIndex < 0) activeIndex = 0;
  let timer = null;
  let touchStartX = 0;
  let touchStartY = 0;
  let touchDeltaX = 0;
  let touchDeltaY = 0;

  const setActive = (nextIndex) => {
    activeIndex = (nextIndex + slides.length) % slides.length;
    slides.forEach((slide, index) => {
      const isActive = index === activeIndex;
      slide.classList.toggle("is-active", isActive);
      slide.setAttribute("aria-hidden", String(!isActive));
    });
    dots.forEach((dot, index) => {
      const isActive = index === activeIndex;
      dot.classList.toggle("is-active", isActive);
      dot.setAttribute("aria-current", isActive ? "true" : "false");
    });
  };

  const start = () => {
    if (timer || slides.length < 2) return;
    timer = setInterval(() => setActive(activeIndex + 1), intervalMs);
  };

  const stop = () => {
    if (!timer) return;
    clearInterval(timer);
    timer = null;
  };

  prev?.addEventListener("click", () => {
    setActive(activeIndex - 1);
    stop();
    start();
  });

  next?.addEventListener("click", () => {
    setActive(activeIndex + 1);
    stop();
    start();
  });

  dots.forEach((dot) => {
    dot.addEventListener("click", () => {
      const slideTo = Number(dot.getAttribute("data-slide-to"));
      if (!Number.isNaN(slideTo)) {
        setActive(slideTo);
        stop();
        start();
      }
    });
  });

  slider.addEventListener("mouseenter", stop);
  slider.addEventListener("mouseleave", start);
  slider.addEventListener("focusin", stop);
  slider.addEventListener("focusout", () => {
    if (!slider.contains(document.activeElement)) start();
  });

  slider.addEventListener(
    "touchstart",
    (event) => {
      if (event.touches.length !== 1) return;
      touchStartX = event.touches[0].clientX;
      touchStartY = event.touches[0].clientY;
      touchDeltaX = 0;
      touchDeltaY = 0;
      stop();
    },
    { passive: true }
  );

  slider.addEventListener(
    "touchmove",
    (event) => {
      if (event.touches.length !== 1) return;
      touchDeltaX = event.touches[0].clientX - touchStartX;
      touchDeltaY = event.touches[0].clientY - touchStartY;
    },
    { passive: true }
  );

  slider.addEventListener("touchend", () => {
    const horizontalSwipe = Math.abs(touchDeltaX) > 46 && Math.abs(touchDeltaX) > Math.abs(touchDeltaY);
    if (horizontalSwipe) {
      if (touchDeltaX < 0) {
        setActive(activeIndex + 1);
      } else {
        setActive(activeIndex - 1);
      }
    }
    start();
  });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      stop();
    } else {
      start();
    }
  });

  setActive(activeIndex);
  start();
}
