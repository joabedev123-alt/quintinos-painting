(function () {
  const header = document.querySelector(".site-header");
  const shell = document.querySelector(".nav-shell");
  const nav = document.getElementById("site-nav");
  const toggle = document.querySelector(".nav-toggle");
  const yearNodes = document.querySelectorAll("[data-year]");
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  yearNodes.forEach((node) => {
    node.textContent = String(new Date().getFullYear());
  });

  function syncOffset() {
    if (!shell) return;
    const bottom = shell.getBoundingClientRect().bottom;
    document.documentElement.style.setProperty("--header-offset", Math.ceil(bottom + 12) + "px");
  }

  syncOffset();
  window.addEventListener("resize", syncOffset);

  function closeNav() {
    if (!nav || !toggle) return;
    nav.classList.remove("is-open");
    header.classList.remove("is-open");
    document.body.classList.remove("nav-open");
    toggle.setAttribute("aria-expanded", "false");
    toggle.innerHTML = '<i class="bi bi-list" aria-hidden="true"></i><span class="sr-only">Open menu</span>';
  }

  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      const open = !nav.classList.contains("is-open");
      nav.classList.toggle("is-open", open);
      header.classList.toggle("is-open", open);
      document.body.classList.toggle("nav-open", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.innerHTML = open
        ? '<i class="bi bi-x-lg" aria-hidden="true"></i><span class="sr-only">Close menu</span>'
        : '<i class="bi bi-list" aria-hidden="true"></i><span class="sr-only">Open menu</span>';
      if (open) {
        const first = nav.querySelector("a");
        if (first) first.focus();
      }
    });

    nav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        if (window.matchMedia("(max-width: 980px)").matches) closeNav();
      });
    });
  }

  document.querySelectorAll(".sub-toggle").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      const item = button.closest(".has-sub");
      const open = !item.classList.contains("is-open");
      document.querySelectorAll(".has-sub").forEach((node) => {
        if (node !== item) {
          node.classList.remove("is-open");
          const other = node.querySelector(".sub-toggle");
          if (other) other.setAttribute("aria-expanded", "false");
        }
      });
      item.classList.toggle("is-open", open);
      button.setAttribute("aria-expanded", open ? "true" : "false");
    });
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeNav();
      document.querySelectorAll(".has-sub.is-open").forEach((item) => {
        item.classList.remove("is-open");
        const button = item.querySelector(".sub-toggle");
        if (button) button.setAttribute("aria-expanded", "false");
      });
    }
  });

  document.addEventListener("click", (event) => {
    if (!event.target.closest(".has-sub")) {
      document.querySelectorAll(".has-sub.is-open").forEach((item) => {
        item.classList.remove("is-open");
        const button = item.querySelector(".sub-toggle");
        if (button) button.setAttribute("aria-expanded", "false");
      });
    }
    if (nav && toggle && nav.classList.contains("is-open") && !event.target.closest(".nav-shell") && !event.target.closest(".site-nav")) {
      closeNav();
    }
  });

  document.querySelectorAll("[data-scroller]").forEach((scroller) => {
    const row = scroller.querySelector(".arch-row");
    const prev = scroller.querySelector(".prev");
    const next = scroller.querySelector(".next");
    if (!row || !prev || !next) return;

    const amount = () => Math.max(220, row.clientWidth * 0.8);

    function update() {
      const max = row.scrollWidth - row.clientWidth - 4;
      prev.disabled = row.scrollLeft <= 4;
      next.disabled = row.scrollLeft >= max;
    }

    prev.addEventListener("click", () => {
      row.scrollBy({ left: -amount(), behavior: reduce ? "auto" : "smooth" });
    });
    next.addEventListener("click", () => {
      row.scrollBy({ left: amount(), behavior: reduce ? "auto" : "smooth" });
    });
    row.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    update();
  });

  const dialog = document.getElementById("lightbox");
  const lightboxImg = document.getElementById("lightbox-img");
  const lightboxCaption = document.getElementById("lightbox-caption");
  const items = Array.from(document.querySelectorAll("[data-lightbox]"));
  let index = 0;

  function show(nextIndex) {
    if (!items.length || !dialog) return;
    index = (nextIndex + items.length) % items.length;
    const item = items[index];
    lightboxImg.src = item.getAttribute("data-src");
    lightboxImg.alt = item.getAttribute("data-caption") || "";
    lightboxCaption.textContent = item.getAttribute("data-caption") || "";
    if (!dialog.open) dialog.showModal();
  }

  items.forEach((item, itemIndex) => {
    item.addEventListener("click", () => show(itemIndex));
  });

  if (dialog) {
    dialog.addEventListener("click", (event) => {
      const action = event.target.closest("[data-lightbox-action]");
      if (action) {
        const type = action.getAttribute("data-lightbox-action");
        if (type === "close") dialog.close();
        if (type === "prev") show(index - 1);
        if (type === "next") show(index + 1);
        return;
      }
      if (event.target === dialog) dialog.close();
    });

    dialog.addEventListener("keydown", (event) => {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        show(index - 1);
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        show(index + 1);
      }
    });

    dialog.addEventListener("close", () => {
      lightboxImg.removeAttribute("src");
    });
  }

  const form = document.getElementById("estimate");
  const success = document.getElementById("form-success");
  if (success && new URLSearchParams(window.location.search).get("sent") === "1") {
    success.hidden = false;
    success.focus();
  }

  if (form) {
    const nextField = form.querySelector('input[name="_next"]');
    if (nextField && location.protocol.startsWith("http")) {
      nextField.value = location.origin + location.pathname.replace(/[^/]+$/, "contact.html") + "?sent=1";
    }

    form.addEventListener("submit", (event) => {
      let valid = true;
      form.querySelectorAll("[required]").forEach((field) => {
        const error = field.parentElement.querySelector(".error");
        const missing = !field.value.trim();
        const badEmail = field.type === "email" && field.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value);
        const bad = missing || badEmail;
        field.setAttribute("aria-invalid", bad ? "true" : "false");
        if (error) {
          error.textContent = missing ? "This field is required." : badEmail ? "Enter a valid email address." : "";
        }
        if (bad) valid = false;
      });
      if (!valid) {
        event.preventDefault();
        const first = form.querySelector("[aria-invalid='true']");
        if (first) first.focus();
      }
    });
  }

  const toTop = document.querySelector(".to-top");
  if (toTop) {
    const onScroll = () => {
      toTop.hidden = window.scrollY < 500;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    toTop.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
    });
  }
})();
