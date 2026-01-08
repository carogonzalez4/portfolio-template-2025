/**
 * ==========================================================================
 * GRADE 1: VANILLA JAVASCRIPT PORTFOLIO DEMO
 * Scroll animations using IntersectionObserver
 * No frameworks, no dependencies — just modern JavaScript!
 * ==========================================================================
 *
 * 🎓 LEARNING OBJECTIVES:
 * - Understand the IntersectionObserver API for scroll-based triggers
 * - Learn why IntersectionObserver is better than scroll event listeners
 * - Implement accessible animations with prefers-reduced-motion
 * - Master the observer pattern for performant scroll detection
 *
 * 📚 WHAT IS INTERSECTIONOBSERVER?
 * IntersectionObserver is a browser API that efficiently detects when elements
 * enter or leave the viewport (or any ancestor element). It's the modern
 * replacement for scroll event listeners.
 *
 * ⚡ WHY NOT USE addEventListener('scroll', ...)?
 * - scroll events fire on EVERY PIXEL of scroll (60+ times per second!)
 * - This blocks the main thread and causes "jank" (stuttering)
 * - IntersectionObserver is optimized by the browser, runs asynchronously,
 *   and only fires when intersection state actually changes
 *
 * 🔗 MDN DOCS: https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API
 */

// ==========================================================================
// 1. INTERSECTIONOBSERVER CONFIGURATION
// ==========================================================================

/**
 * Observer options control WHEN the callback fires.
 *
 * 📐 UNDERSTANDING THE OPTIONS:
 *
 * root: The element to use as the viewport for checking visibility.
 *       - null = browser viewport (most common)
 *       - element = custom scroll container
 *
 * rootMargin: Expands or shrinks the root's bounding box.
 *       - Format: "top right bottom left" (like CSS margin)
 *       - Negative values shrink the detection area
 *       - "0px 0px -10% 0px" means: trigger when element is 10% INTO the viewport
 *         (not at the very edge, which feels more natural)
 *
 * threshold: What percentage of the element must be visible to trigger.
 *       - 0 = trigger as soon as 1 pixel is visible
 *       - 0.1 = trigger when 10% is visible
 *       - 1.0 = trigger only when 100% visible
 *       - [0, 0.5, 1] = trigger at multiple thresholds
 */
const observerOptions = {
  root: null, // Use the browser viewport
  rootMargin: "0px 0px -10% 0px", // Trigger 10% before fully visible
  threshold: 0.1, // Need 10% visibility to trigger
};

/**
 * CALLBACK: Single-element reveals
 *
 * This function is called by IntersectionObserver whenever an observed
 * element's intersection state changes.
 *
 * @param {IntersectionObserverEntry[]} entries - Array of intersection events
 * @param {IntersectionObserver} observer - The observer instance (for cleanup)
 *
 * 📐 WHAT'S IN AN ENTRY?
 * - entry.isIntersecting: boolean - is element currently visible?
 * - entry.intersectionRatio: number - how much is visible (0-1)
 * - entry.target: Element - the DOM element being observed
 * - entry.boundingClientRect: DOMRect - element's position/size
 */
const revealOnScroll = (entries, observer) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      // Add class that triggers CSS transition (see style.css)
      entry.target.classList.add("visible");

      // 🎯 PERFORMANCE OPTIMIZATION: Stop observing after reveal
      // Once an element is revealed, we don't need to watch it anymore.
      // This reduces work for the observer and prevents re-triggering.
      observer.unobserve(entry.target);
    }
  });
};

/**
 * CALLBACK: Staggered container reveals
 *
 * Same pattern, but adds 'revealed' class to containers.
 * CSS handles the staggered animation of children via transition-delay.
 */
const revealStaggered = (entries, observer) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("revealed");
      observer.unobserve(entry.target);
    }
  });
};

/**
 * CREATE OBSERVER INSTANCES
 *
 * We create two separate observers because they add different classes.
 * You could use one observer with logic to determine which class to add,
 * but separate observers are clearer and more maintainable.
 */
const singleObserver = new IntersectionObserver(
  revealOnScroll,
  observerOptions
);
const staggerObserver = new IntersectionObserver(
  revealStaggered,
  observerOptions
);

// ==========================================================================
// 2. INITIALIZE OBSERVERS
// ==========================================================================

/**
 * Main initialization function for scroll animations.
 *
 * 🎓 KEY CONCEPT: PROGRESSIVE ENHANCEMENT
 * We check for reduced motion FIRST, before setting up any animations.
 * This ensures users who need reduced motion get a good experience immediately.
 *
 * 📐 THE FLOW:
 * 1. Check if user prefers reduced motion
 * 2. If yes → make everything visible immediately, skip animations
 * 3. If no → set up observers to trigger animations on scroll
 */
function initScrollAnimations() {
  /**
   * CHECK FOR REDUCED MOTION PREFERENCE
   *
   * window.matchMedia() is like CSS media queries, but in JavaScript!
   * It returns a MediaQueryList object with a .matches boolean property.
   *
   * This respects the user's OS-level accessibility settings:
   * - macOS: System Preferences → Accessibility → Display → Reduce motion
   * - Windows: Settings → Ease of Access → Display → Show animations
   * - iOS: Settings → Accessibility → Motion → Reduce Motion
   *
   * ⚠️ IMPORTANT: Always check this BEFORE initializing animations!
   */
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  if (prefersReducedMotion) {
    /**
     * GRACEFUL DEGRADATION FOR REDUCED MOTION
     *
     * Instead of animations, we immediately show all content.
     * Users get the same information, just without the motion.
     *
     * This is NOT about removing features — it's about providing
     * an equivalent experience for users who need it.
     */
    document.querySelectorAll(".animate-on-scroll").forEach((el) => {
      el.classList.add("visible");
    });
    document.querySelectorAll("[data-reveal-stagger]").forEach((el) => {
      el.classList.add("revealed");
    });
    return; // Exit early — no observers needed
  }

  /**
   * OBSERVE ELEMENTS FOR SCROLL-TRIGGERED ANIMATIONS
   *
   * querySelectorAll returns a NodeList (array-like).
   * forEach loops through each element and tells the observer to watch it.
   *
   * Once observed, the callback (revealOnScroll) will fire when the
   * element enters the viewport according to our observerOptions.
   */

  // Single element reveals (e.g., headings, paragraphs)
  document.querySelectorAll(".animate-on-scroll").forEach((el) => {
    singleObserver.observe(el);
  });

  // Staggered container reveals (e.g., skill grids, project cards)
  document.querySelectorAll("[data-reveal-stagger]").forEach((el) => {
    staggerObserver.observe(el);
  });
}

// ==========================================================================
// 3. SMOOTH SCROLL FOR ANCHOR LINKS
// ==========================================================================

/**
 * Enhanced smooth scrolling for in-page navigation.
 *
 * 🎓 WHY NOT JUST USE CSS scroll-behavior: smooth?
 * CSS smooth scrolling works great, but it has limitations:
 * 1. Can't account for fixed header height
 * 2. Can't update URL without page jump
 * 3. Less control over timing/easing
 *
 * This JavaScript approach gives us full control while still being simple.
 *
 * 📐 THE PATTERN:
 * 1. Find all links starting with "#" (anchor links)
 * 2. On click, prevent default jump behavior
 * 3. Calculate target position accounting for fixed nav height
 * 4. Smoothly scroll to that position
 * 5. Update URL for bookmarking/sharing
 */
function initSmoothScroll() {
  // Select all anchor links (href starts with "#")
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", (e) => {
      const targetId = anchor.getAttribute("href");

      // Ignore links that are just "#" (often used for JavaScript triggers)
      if (targetId === "#") return;

      const target = document.querySelector(targetId);
      if (target) {
        // Prevent the default "jump to anchor" behavior
        e.preventDefault();

        /**
         * CALCULATE SCROLL POSITION
         *
         * We need to account for the fixed navigation bar, otherwise
         * the target would be hidden behind it.
         *
         * getBoundingClientRect().top = distance from viewport top
         * window.scrollY = how far page is already scrolled
         * navHeight = height of fixed nav to offset
         */
        const navHeight = document.querySelector(".nav")?.offsetHeight || 0;
        const targetPosition =
          target.getBoundingClientRect().top + window.scrollY - navHeight;

        /**
         * SCROLL WITH SMOOTH BEHAVIOR
         *
         * window.scrollTo() with behavior: 'smooth' animates the scroll.
         * This is supported in all modern browsers.
         *
         * Note: CSS scroll-behavior: smooth on <html> provides a fallback
         * for browsers where this JS might fail.
         */
        window.scrollTo({
          top: targetPosition,
          behavior: "smooth",
        });

        /**
         * UPDATE URL WITHOUT PAGE RELOAD
         *
         * history.pushState() changes the URL in the address bar
         * without triggering a page reload or scroll jump.
         *
         * This means:
         * - Users can bookmark specific sections
         * - Sharing the URL goes to the right section
         * - Back button works as expected
         */
        history.pushState(null, "", targetId);
      }
    });
  });
}

// ==========================================================================
// 4. ACTIVE NAVIGATION STATE
// ==========================================================================

/**
 * Highlight the nav link corresponding to the currently visible section.
 *
 * 🎓 UX PRINCIPLE: LOCATION AWARENESS
 * Users should always know where they are in the page. Highlighting the
 * active nav link provides this feedback without requiring user action.
 *
 * 📐 THE APPROACH:
 * We use IntersectionObserver again! But with different rootMargin settings
 * that define a "detection zone" in the middle of the viewport.
 *
 * rootMargin: '-50% 0px -50% 0px' means:
 * - Shrink the detection area by 50% from top AND bottom
 * - This creates a narrow band in the middle of the viewport
 * - Only the section crossing this band is considered "active"
 */
function initActiveNav() {
  const navLinks = Array.from(document.querySelectorAll(".nav-links a"));
  const sections = Array.from(document.querySelectorAll("section[id]"));
  if (!navLinks.length || !sections.length) return;

  // Update active based on the vertical middle of the viewport
  const updateActive = () => {
    const middle = window.scrollY + window.innerHeight / 2;
    // Find the first section that contains the middle point
    let activeId = sections[0].id || null;
    for (const s of sections) {
      const top = s.offsetTop;
      const bottom = top + s.offsetHeight;
      if (middle >= top && middle <= bottom) {
        activeId = s.id;
        break;
      }
    }

    navLinks.forEach((link) => {
      const isMatch = link.getAttribute("href") === `#${activeId}`;
      link.classList.toggle("active", isMatch);
      if (isMatch) link.setAttribute("aria-current", "page");
      else link.removeAttribute("aria-current");
    });
  };

  // Throttle with requestAnimationFrame for performance
  let ticking = false;
  const onScroll = () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(() => {
        updateActive();
        ticking = false;
      });
    }
  };

  // Init and attach
  updateActive();
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);

  // expose cleanup handle so window.cleanupScrollObservers can remove if needed
  window._navActiveCleanup = () => {
    window.removeEventListener("scroll", onScroll);
    window.removeEventListener("resize", onScroll);
  };
}

// ==========================================================================
// 5. INITIALIZATION
// ==========================================================================

/**
 * DOMContentLoaded: The safe time to run DOM-manipulating JavaScript.
 *
 * 🎓 WHY DOMContentLoaded?
 * - Fires when HTML is fully parsed (DOM is ready)
 * - Doesn't wait for images/stylesheets to load (that's 'load' event)
 * - Safe to query and manipulate DOM elements
 *
 * If your script is in <head> without 'defer', this is essential.
 * If your script is at end of <body> or has 'defer', it's optional but good practice.
 */
document.addEventListener("DOMContentLoaded", () => {
  initScrollAnimations();
  initSmoothScroll();
  initActiveNav();

  console.log("🚀 Grade 1 Demo: Vanilla scroll animations initialized");
});

document.addEventListener("DOMContentLoaded", function () {
  const toggle = document.querySelector(".nav-toggle");
  const links = document.querySelector(".nav-links");

  if (!toggle || !links) return;

  toggle.addEventListener("click", () => {
    const open = links.classList.toggle("open");
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
  });

  // optional: close menu when a link is clicked (mobile)
  links.addEventListener("click", (e) => {
    if (e.target.tagName === "A") {
      links.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
    }
  });

  // Scroll-indicator: smooth-scroll to the About section when clicked (and keyboard accessible)
  const scrollIndicator = document.querySelector(".scroll-indicator");
  if (scrollIndicator) {
    // make accessible if not already
    if (!scrollIndicator.hasAttribute("role"))
      scrollIndicator.setAttribute("role", "button");
    if (!scrollIndicator.hasAttribute("tabindex"))
      scrollIndicator.setAttribute("tabindex", "0");

    const scrollToAbout = () => {
      const target = document.querySelector("#about");
      if (!target) return;
      const nav = document.querySelector(".nav");
      const navHeight = nav ? nav.offsetHeight : 0;
      const top =
        target.getBoundingClientRect().top +
        window.pageYOffset -
        navHeight -
        16; // small gap
      window.scrollTo({ top, behavior: "smooth" });
    };

    scrollIndicator.addEventListener("click", scrollToAbout);
    scrollIndicator.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        scrollToAbout();
      }
    });
  }

  /* Cursor trail (uses CSS .cursor-trail and --color-accent)
     - respects prefers-reduced-motion
     - throttled to avoid creating too many nodes
  */
  try {
    const prefersReduced =
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!prefersReduced && !window.__cursorTrailInit) {
      window.__cursorTrailInit = true;
      console.debug("cursor trail: init");

      const THROTTLE_MS = 40;
      const LIFE_MS = 700;
      let last = 0;

      const createTrail = (x, y) => {
        const el = document.createElement("div");
        el.className = "cursor-trail";
        el.style.left = x + "px";
        el.style.top = y + "px";
        const s = 0.7 + Math.random() * 0.6;
        el.style.transform = `translate(-50%,-50%) scale(${s})`;
        document.body.appendChild(el);

        // debug: ensure element created
        // console.debug("cursor trail: created", el);

        requestAnimationFrame(() => {
          el.style.transform = `translate(-50%,-50%) scale(${s * 0.18})`;
          el.style.opacity = "0";
        });

        setTimeout(() => {
          if (el && el.parentNode) el.parentNode.removeChild(el);
        }, LIFE_MS);
      };

      document.addEventListener("mousemove", (ev) => {
        const now = performance.now();
        if (now - last < THROTTLE_MS) return;
        last = now;
        createTrail(ev.clientX, ev.clientY);
      });

      document.addEventListener(
        "touchmove",
        (ev) => {
          const t = ev.touches && ev.touches[0];
          if (!t) return;
          const now = performance.now();
          if (now - last < THROTTLE_MS) return;
          last = now;
          createTrail(t.clientX, t.clientY);
        },
        { passive: true }
      );
    } else {
      console.debug("cursor trail: skipped (reduced-motion or already init)");
    }
  } catch (e) {
    console.warn("cursor trail init failed", e);
  }

  // NAV: highlight the single most-visible section in the viewport
  // Duplicate initActiveNav removed here. The single top-level initActiveNav()
  // (defined earlier) will handle active-link highlighting to avoid multiple
  // observers toggling classes at once.
});

/* --------------------------------------------------------------------------
   Sun rays: reliable, self-contained module (injects .sun-rays into every
   .section and .footer except #hero). Adds debug logs and a test helper.
   -------------------------------------------------------------------------- */
(function initSunRaysModule() {
  if (window.__sunRaysInit) {
    console.debug("sun-rays: already init");
    return;
  }
  window.__sunRaysInit = true;
  console.debug("sun-rays: module init");

  const prefersReduced =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReduced) {
    console.debug("sun-rays: reduced-motion enabled — skipping");
    return;
  }

  function createRaysIn(container, count = 7) {
    if (!container) return console.debug("sun-rays: no container");
    if (container.dataset.inited)
      return console.debug("sun-rays: container already inited");
    container.dataset.inited = "1";
    console.debug("sun-rays: creating", count, "rays in", container);

    for (let i = 0; i < count; i++) {
      const ray = document.createElement("div");
      ray.className = "ray";

      const left = 5 + Math.random() * 90; // %
      const scaleW = 0.7 + Math.random() * 1.0;
      const angle = -30 + Math.random() * 60; // deg
      const drift = (20 + Math.random() * 120) * (Math.random() < 0.5 ? -1 : 1); // px
      const duration = 12 + Math.random() * 28; // s
      const startOpacity = 0.04 + Math.random() * 0.08;
      const endOpacity = Math.max(
        0.01,
        startOpacity - (0.01 + Math.random() * 0.03)
      );

      ray.style.left = `${left}%`;
      ray.style.width = `${36 * scaleW}%`;
      ray.style.setProperty("--angle", `${angle}deg`);
      ray.style.setProperty("--drift", `${drift}px`);
      ray.style.setProperty("--start-opacity", `${startOpacity}`);
      ray.style.setProperty("--end-opacity", `${endOpacity}`);
      ray.style.animationDuration = `${duration}s`;
      ray.style.opacity = `${startOpacity}`;

      container.appendChild(ray);
    }
  }

  function ensureWrapperFor(sectionEl) {
    const container = sectionEl.querySelector(".container") || sectionEl;
    let wrapper = container.querySelector(".sun-rays");
    if (!wrapper) {
      wrapper = document.createElement("div");
      wrapper.className = "sun-rays";
      wrapper.setAttribute("aria-hidden", "true");
      container.insertBefore(wrapper, container.firstChild);
    }
    return wrapper;
  }

  function observeSectionsForRays() {
    const targets = Array.from(document.querySelectorAll(".section, .footer"));
    if (!targets.length) {
      console.debug("sun-rays: no .section/.footer found");
      return;
    }
    console.debug("sun-rays: observing", targets.length, "targets");

    const obs = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const section = entry.target;
          if (section.id === "hero") {
            observer.unobserve(section);
            return;
          }
          const wrapper = ensureWrapperFor(section);
          createRaysIn(wrapper, 7);
          observer.unobserve(section);
        });
      },
      { root: null, threshold: 0.06 }
    );

    targets.forEach((t) => {
      if (t.id === "hero") return;
      obs.observe(t);
    });

    // FALLBACK: create rays immediately for sections currently visible (helps debug)
    targets.forEach((t) => {
      if (t.id === "hero") return;
      const rect = t.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        const w = ensureWrapperFor(t);
        createRaysIn(w, 7);
      }
    });
  }

  // Start after DOM ready (safe even if script loaded earlier)
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", observeSectionsForRays);
  } else {
    observeSectionsForRays();
  }

  // Expose quick test helper for Console
  window._createSunRaysTest = (selector = "#about", count = 7) => {
    const el = document.querySelector(selector);
    if (!el)
      return console.debug("sun-rays test: selector not found", selector);
    const wrapper = ensureWrapperFor(el);
    createRaysIn(wrapper, count);
    console.debug("sun-rays test: created", count, "rays in", selector);
  };
})();

// ==========================================================================
// 6. CLEANUP (FOR SPA ENVIRONMENTS)
// ==========================================================================

/**
 * Cleanup function for Single Page Application (SPA) routing.
 *
 * 🎓 WHY IS CLEANUP IMPORTANT?
 * In SPAs (React, Vue, etc.), pages don't fully reload when navigating.
 * If you don't disconnect observers, they keep watching elements that
 * may have been removed, causing memory leaks and bugs.
 *
 * 📐 WHEN TO CALL THIS:
 * - Before navigating away from this page in an SPA
 * - In React: useEffect cleanup function
 * - In Vue: onUnmounted lifecycle hook
 *
 * For traditional multi-page sites, this isn't needed (page reload cleans up).
 */
window.cleanupScrollObservers = () => {
  try {
    singleObserver.disconnect();
  } catch {}
  try {
    staggerObserver.disconnect();
  } catch {}
  if (window._navActiveCleanup) window._navActiveCleanup();
  console.log("🧹 Observers cleaned up");
};
