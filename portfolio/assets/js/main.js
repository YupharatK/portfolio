(function () {
  const content = window.siteContent;
  if (!content) {
    return;
  }

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const byId = (id) => document.getElementById(id);

  const profileName = byId("profile-name");
  const profileRole = byId("profile-role");
  const profileIntro = byId("profile-intro");
  const profileLocation = byId("profile-location");
  const aboutHello = byId("about-hello");
  const aboutText = byId("about-text");
  const aboutPhoto = byId("about-photo");
  const aboutMark = byId("about-mark");
  const aboutEducationList = byId("about-education-list");
  const aboutTechnicalList = byId("about-technical-list");
  const aboutToolsTechList = byId("about-tools-tech-list");
  const aboutDropTags = byId("about-drop-tags");

  const heroPrimaryCta = byId("hero-primary-cta");
  const heroSecondaryCta = byId("hero-secondary-cta");

  const projectsGrid = byId("projects-grid");
  const projectFilters = byId("projects-filters");

  const contactEmail = byId("contact-email");
  const contactPhone = byId("contact-phone");
  const socialLinks = byId("social-links");

  const footerName = byId("footer-name");
  const footerYear = byId("footer-year");

  profileName.textContent = content.profile.name;
  profileRole.textContent = content.profile.role;
  profileIntro.textContent = content.profile.intro;
  profileLocation.textContent = content.profile.location;

  heroPrimaryCta.textContent = content.hero.primaryCtaLabel;
  heroSecondaryCta.textContent = content.hero.secondaryCtaLabel;

  footerName.textContent = content.profile.name;
  footerYear.textContent = "| " + new Date().getFullYear();

  renderProjects(content.projects, projectsGrid, projectFilters);
  renderAboutSection(content.aboutSection, content.profile);
  renderSocial(content.contact.social, socialLinks);

  contactEmail.textContent = content.contact.email;
  contactEmail.href = "mailto:" + content.contact.email;
  contactPhone.textContent = content.contact.phone;

  initIntroSequence(prefersReducedMotion);
  bindMobileNav();
  bindSmoothScroll(prefersReducedMotion);
  initReveal(prefersReducedMotion);
  initDropPhysics(prefersReducedMotion);
  focusSuccessMessage();

  function renderAboutSection(aboutData, profile) {
    const data = aboutData || {};
    const fallbackBio = profile.about || profile.intro || "";
    const derivedMark = (profile.name || "YP")
      .replace(/\s+/g, "")
      .slice(0, 2)
      .toUpperCase();

    if (aboutHello) {
      aboutHello.textContent = data.hello || "About Me";
    }

    if (aboutText) {
      aboutText.textContent = data.bio || fallbackBio;
    }

    if (aboutPhoto && data.photo) {
      if (data.photo.src) {
        aboutPhoto.src = data.photo.src;
      }
      if (data.photo.alt) {
        aboutPhoto.alt = data.photo.alt;
      }
    }

    if (aboutMark) {
      aboutMark.textContent = data.mark || derivedMark;
    }

    renderEducation(data.education || [], aboutEducationList);
    renderChipList(data.technicalSkills || data.traits || [], aboutTechnicalList);
    renderChipList(data.toolsTechnologies || data.languages || [], aboutToolsTechList);
    renderDropTags(data.dropTags || [], aboutDropTags);
  }

  function renderEducation(items, root) {
    if (!root) {
      return;
    }
    root.textContent = "";

    items.forEach((item) => {
      const li = document.createElement("li");
      li.className = "about-list-item";

      const period = document.createElement("p");
      period.className = "about-item-period";
      period.textContent = item.period || "";

      const title = document.createElement("p");
      title.className = "about-item-title";
      title.textContent = item.title || "";

      const detail = document.createElement("p");
      detail.className = "about-item-detail";
      detail.textContent = item.detail || "";

      li.append(period, title, detail);
      root.appendChild(li);
    });
  }

  function renderSimpleList(items, root) {
    if (!root) {
      return;
    }
    root.textContent = "";
    items.forEach((item) => {
      const li = document.createElement("li");
      li.textContent = item;
      root.appendChild(li);
    });
  }

  function renderChipList(items, root) {
    if (!root) {
      return;
    }
    root.textContent = "";

    items.forEach((item) => {
      const li = document.createElement("li");
      li.className = "about-chip-item";
      li.textContent = typeof item === "string" ? item : item.name || "";
      root.appendChild(li);
    });
  }

  function renderDropTags(items, root) {
    if (!root) {
      return;
    }
    root.textContent = "";

    items.forEach((item, index) => {
      const li = document.createElement("li");
      li.className = "about-drop-chip";
      li.textContent = item;
      li.style.setProperty("--chip-delay", 120 + index * 85 + "ms");
      root.appendChild(li);
    });
  }

  function initDropPhysics(reducedMotion) {
    const area = document.querySelector(".about-drop-area");
    const list = byId("about-drop-tags");
    if (!area || !list) {
      return;
    }

    const chips = Array.from(list.children);
    if (!chips.length) {
      return;
    }

    const setStatic = () => {
      list.classList.add("drop-static");
      chips.forEach((chip) => {
        chip.style.opacity = "1";
        chip.style.left = "auto";
        chip.style.top = "auto";
        chip.style.transform = "none";
      });
    };

    if (reducedMotion) {
      setStatic();
      return;
    }

    let started = false;
    let rafId = 0;
    let startAt = 0;
    let prevAt = 0;
    let lastMoveAt = 0;
    let bodies = [];

    const gravity = 2350;
    const wallBounce = 0.44;
    const floorBounce = 0.32;
    const floorDrag = 0.88;
    const maxDuration = 12000;

    const ensureLoop = () => {
      if (rafId !== 0) {
        return;
      }
      rafId = window.requestAnimationFrame(step);
    };

    const step = (now) => {
      if (!startAt) {
        startAt = now;
        prevAt = now;
      }

      const dt = Math.min(0.033, (now - prevAt) / 1000);
      prevAt = now;
      const elapsed = now - startAt;
      const width = list.clientWidth;
      const height = list.clientHeight;
      let activeCount = 0;

      bodies.forEach((body) => {
        if (body.sleeping) {
          return;
        }
        activeCount += 1;

        body.vy += gravity * dt;
        body.x += body.vx * dt;
        body.y += body.vy * dt;
        body.angle += body.av * dt;

        if (body.x < 0) {
          body.x = 0;
          body.vx = Math.abs(body.vx) * wallBounce;
        }

        const maxX = width - body.width;
        if (body.x > maxX) {
          body.x = maxX;
          body.vx = -Math.abs(body.vx) * wallBounce;
        }

        const floor = height - body.height;
        if (body.y >= floor) {
          body.y = floor;
          body.vy *= -floorBounce;
          body.vx *= floorDrag;
          body.av *= 0.73;

          if (!body.firstImpact) {
            body.firstImpact = true;
            const scatter = (body.index % 2 === 0 ? -1 : 1) * (130 + Math.random() * 110);
            body.vx += scatter;
            body.av += (Math.random() - 0.5) * 95;
          }

          if (Math.abs(body.vy) < 25) {
            body.vy = 0;
          }
        }

        if (body.y >= height - body.height - 0.5 && Math.abs(body.vy) < 2.2 && Math.abs(body.vx) < 2.2) {
          body.vx = 0;
          body.vy = 0;
          body.av = 0;
          body.sleeping = true;
        }

        body.chip.style.transform =
          "translate3d(" + body.x.toFixed(2) + "px, " + body.y.toFixed(2) + "px, 0) rotate(" + body.angle.toFixed(2) + "deg)";
      });

      if (activeCount > 0 && elapsed < maxDuration) {
        rafId = window.requestAnimationFrame(step);
      } else {
        rafId = 0;
      }
    };

    const applyImpulse = (clientX, clientY, power, radius) => {
      if (!started || !bodies.length) {
        return;
      }

      const bounds = list.getBoundingClientRect();
      const px = clientX - bounds.left;
      const py = clientY - bounds.top;

      bodies.forEach((body) => {
        const cx = body.x + body.width * 0.5;
        const cy = body.y + body.height * 0.5;
        const dx = cx - px;
        const dy = cy - py;
        const dist = Math.hypot(dx, dy) || 1;
        if (dist > radius) {
          return;
        }

        const strength = (1 - dist / radius) * power;
        const nx = dx / dist;
        const ny = dy / dist;

        body.vx += nx * strength;
        body.vy += ny * (strength * 0.9) - 120;
        body.av += (Math.random() - 0.5) * 180;
        body.sleeping = false;
      });

      ensureLoop();
    };

    const startPhysics = () => {
      if (started) {
        return;
      }
      started = true;

      const width = list.clientWidth;
      const height = list.clientHeight;
      if (!width || !height) {
        setStatic();
        return;
      }

      list.classList.remove("drop-static");

      bodies = chips.map((chip, index) => {
        const rect = chip.getBoundingClientRect();
        const chipWidth = rect.width;
        const chipHeight = rect.height;
        const spread = index - (chips.length - 1) / 2;

        return {
          chip,
          index,
          width: chipWidth,
          height: chipHeight,
          x: width * 0.5 - chipWidth * 0.5 + (Math.random() - 0.5) * 28,
          y: -chipHeight - index * 18 - Math.random() * 60,
          vx: spread * 62 + (Math.random() - 0.5) * 40,
          vy: Math.random() * 30,
          angle: (Math.random() - 0.5) * 8,
          av: (Math.random() - 0.5) * 78,
          firstImpact: false,
          sleeping: false
        };
      });

      bodies.forEach((body) => {
        body.chip.style.opacity = "1";
        body.chip.style.left = "0";
        body.chip.style.top = "0";
      });
      startAt = 0;
      prevAt = 0;
      ensureLoop();
    };

    area.addEventListener("pointermove", (event) => {
      if (event.pointerType !== "mouse") {
        return;
      }

      const now = Date.now();
      if (now - lastMoveAt < 110) {
        return;
      }
      lastMoveAt = now;
      applyImpulse(event.clientX, event.clientY, 340, 190);
    });

    area.addEventListener("pointerdown", (event) => {
      applyImpulse(event.clientX, event.clientY, 560, 220);
    });

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }
          obs.unobserve(entry.target);
          window.setTimeout(startPhysics, 150);
        });
      },
      {
        threshold: 0.28
      }
    );

    observer.observe(area);
  }

  function renderProjects(projects, root, filtersRoot) {
    if (!root) {
      return;
    }

    const categories = ["ผลงานในชั้นเรียน", "ผลงานที่ฝึกเขียน"];
    const mappedProjects = (projects || []).map((project, index) => {
      const category = categories.includes(project.category) ? project.category : categories[index % categories.length];
      return Object.assign({}, project, { category });
    });

    let activeCategory = categories[0];

    const renderFilters = () => {
      if (!filtersRoot) {
        return;
      }
      filtersRoot.textContent = "";

      categories.forEach((category) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "project-filter-btn";
        button.textContent = category;
        button.setAttribute("aria-pressed", category === activeCategory ? "true" : "false");

        if (category === activeCategory) {
          button.classList.add("is-active");
        }

        button.addEventListener("click", () => {
          if (category === activeCategory) {
            return;
          }
          activeCategory = category;
          renderFilters();
          renderCards();
        });

        filtersRoot.appendChild(button);
      });
    };

    const renderCards = () => {
      root.textContent = "";
      const visibleItems = mappedProjects.filter((project) => project.category === activeCategory);

      if (!visibleItems.length) {
        const empty = document.createElement("p");
        empty.className = "projects-empty";
        empty.textContent = "ยังไม่มีผลงานในหมวดนี้";
        root.appendChild(empty);
        return;
      }

      const createdCards = [];

      visibleItems.forEach((project, index) => {
        const article = document.createElement("article");
        article.className = "project-card";
        article.style.setProperty("--project-enter-delay", index * 85 + "ms");

        const media = document.createElement("div");
        media.className = "project-media";
        media.setAttribute("role", "img");
        media.setAttribute("aria-label", project.imageAlt || project.title);

        const track = document.createElement("span");
        track.className = "project-track";
        track.textContent = "● " + (project.track || "Frontend");

        if (project.image) {
          media.classList.add("has-image");
          const image = document.createElement("img");
          image.className = "project-image";
          image.src = project.image;
          image.alt = project.imageAlt || project.title;
          image.loading = "lazy";
          media.append(track, image);
        } else {
          const visual = document.createElement("div");
          visual.className = "project-visual";
          visual.innerHTML =
            '<span class="project-graph project-graph-1"></span><span class="project-graph project-graph-2"></span><span class="project-ring"></span><span class="project-percent">39%</span>';
          media.append(track, visual);
        }

        const body = document.createElement("div");
        body.className = "project-body";

        const title = document.createElement("h3");
        title.textContent = project.title;

        const summary = document.createElement("p");
        summary.textContent = project.summary;

        const techList = document.createElement("ul");
        techList.className = "project-tech";

        (project.tech || []).forEach((item) => {
          const li = document.createElement("li");
          li.textContent = item;
          techList.appendChild(li);
        });

        const links = document.createElement("div");
        links.className = "project-links";

        const linkButtons = [];
        const hasDemo = typeof project.demoUrl === "string" && project.demoUrl.trim() && project.demoUrl.trim() !== "#";
        const repoLinks = getProjectRepoLinks(project);

        if (hasDemo) {
          const demo = document.createElement("a");
          demo.className = "project-btn project-btn-primary";
          demo.href = project.demoUrl;
          demo.target = "_blank";
          demo.rel = "noreferrer";
          demo.textContent = "Live Demo →";
          linkButtons.push(demo);
        }

        repoLinks.forEach((repoItem) => {
          const repo = document.createElement("a");
          repo.className = "project-btn project-btn-ghost";
          repo.href = repoItem.url;
          repo.target = "_blank";
          repo.rel = "noreferrer";
          repo.textContent = repoItem.label;
          linkButtons.push(repo);
        });

        if (linkButtons.length === 1) {
          links.classList.add("is-single");
        }
        if (linkButtons.length > 0) {
          links.append(...linkButtons);
        }

        body.append(title, summary, techList);
        if (linkButtons.length > 0) {
          body.append(links);
        }
        article.append(media, body);

        root.appendChild(article);
        createdCards.push(article);
      });

      window.requestAnimationFrame(() => {
        createdCards.forEach((card) => card.classList.add("is-visible"));
      });
    };

    renderFilters();
    renderCards();
  }

  function getProjectRepoLinks(project) {
    const links = [];
    const pushIfValid = (url, label) => {
      if (typeof url !== "string") {
        return;
      }
      const cleanUrl = url.trim();
      if (!cleanUrl || cleanUrl === "#") {
        return;
      }
      links.push({ url: cleanUrl, label });
    };

    if (Array.isArray(project.repoUrls)) {
      project.repoUrls.forEach((item, index) => {
        if (!item || typeof item !== "object") {
          return;
        }
        pushIfValid(item.url, item.label || "GitHub " + (index + 1));
      });
      return links;
    }

    pushIfValid(project.frontendRepoUrl, "GitHub Frontend");
    pushIfValid(project.backendRepoUrl, "GitHub Backend");

    if (!links.length) {
      pushIfValid(project.repoUrl, "GitHub");
    }

    return links;
  }

  function renderSocial(items, root) {
    root.textContent = "";

    items.forEach((item) => {
      const li = document.createElement("li");
      const link = document.createElement("a");
      link.href = item.url;
      link.target = "_blank";
      link.rel = "noreferrer";
      link.textContent = item.label;
      li.appendChild(link);
      root.appendChild(li);
    });
  }

  function initIntroSequence(reducedMotion) {
    const body = document.body;
    const splash = byId("intro-splash");
    if (!body || !splash) {
      return;
    }

    const introFragments = Array.from(splash.querySelectorAll("[data-intro-step]")).sort((a, b) => {
      return Number(a.dataset.introStep) - Number(b.dataset.introStep);
    });
    const introHint = splash.querySelector(".intro-hint");

    const isDeepLinked = window.location.hash && window.location.hash !== "#hero" && window.location.hash !== "#top";
    if (isDeepLinked) {
      body.classList.remove("intro-mode", "intro-leaving");
      body.classList.add("intro-ready", "intro-complete");
      introFragments.forEach((fragment) => fragment.classList.add("is-visible"));
      return;
    }

    let introTriggered = false;
    let touchStartY = 0;
    let currentStep = 0;
    let lastProgressAt = 0;

    const cleanup = () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      splash.removeEventListener("click", progressIntro);
    };

    const finishIntro = () => {
      body.classList.remove("intro-mode", "intro-leaving");
      body.classList.add("intro-complete");
    };

    const revealNextFragment = () => {
      if (currentStep >= introFragments.length) {
        return false;
      }

      const fragment = introFragments[currentStep];
      fragment.classList.add("is-visible");
      currentStep += 1;

      if (currentStep === introFragments.length) {
        body.classList.add("intro-ready");
        if (introHint) {
          introHint.textContent = "Scroll again to enter";
        }
      }

      return true;
    };

    const triggerIntro = () => {
      if (introTriggered || !body.classList.contains("intro-mode")) {
        return;
      }

      introTriggered = true;
      body.classList.add("intro-leaving");
      cleanup();
      window.setTimeout(finishIntro, reducedMotion ? 20 : 760);
    };

    const progressIntro = () => {
      const now = Date.now();
      if (now - lastProgressAt < 170) {
        return;
      }
      lastProgressAt = now;

      const hasRevealed = revealNextFragment();
      if (!hasRevealed) {
        triggerIntro();
      }
    };

    const onWheel = (event) => {
      if (!body.classList.contains("intro-mode")) {
        return;
      }
      if (event.deltaY < 6) {
        return;
      }
      event.preventDefault();
      progressIntro();
    };

    const onKeyDown = (event) => {
      if (!body.classList.contains("intro-mode")) {
        return;
      }

      const allowedKeys = ["ArrowDown", "PageDown", " ", "Enter"];
      if (!allowedKeys.includes(event.key)) {
        return;
      }

      event.preventDefault();
      progressIntro();
    };

    const onTouchStart = (event) => {
      touchStartY = event.touches[0]?.clientY || 0;
    };

    const onTouchMove = (event) => {
      if (!body.classList.contains("intro-mode")) {
        return;
      }

      const currentY = event.touches[0]?.clientY || touchStartY;
      const delta = touchStartY - currentY;
      if (delta < 16) {
        return;
      }

      event.preventDefault();
      progressIntro();
      touchStartY = currentY;
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    splash.addEventListener("click", progressIntro);
  }

  function bindMobileNav() {
    const header = document.querySelector(".site-header");
    const toggle = document.querySelector(".nav-toggle");
    const navLinks = document.querySelectorAll(".site-nav a");

    if (!header || !toggle) {
      return;
    }

    toggle.addEventListener("click", () => {
      const isOpen = header.classList.toggle("nav-open");
      toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });

    navLinks.forEach((link) => {
      link.addEventListener("click", () => {
        header.classList.remove("nav-open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });

    document.addEventListener("click", (event) => {
      if (!header.classList.contains("nav-open")) {
        return;
      }

      const clickInside = header.contains(event.target);
      if (!clickInside) {
        header.classList.remove("nav-open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  function bindSmoothScroll(reducedMotion) {
    const links = document.querySelectorAll('a[href^="#"]');

    links.forEach((link) => {
      link.addEventListener("click", (event) => {
        const href = link.getAttribute("href");
        if (!href || href === "#") {
          return;
        }

        const target = document.querySelector(href);
        if (!target) {
          return;
        }

        event.preventDefault();
        target.scrollIntoView({
          behavior: reducedMotion ? "auto" : "smooth",
          block: "start"
        });

        history.replaceState(null, "", href);
      });
    });
  }

  function initReveal(reducedMotion) {
    const revealItems = document.querySelectorAll(".reveal");

    if (reducedMotion || !("IntersectionObserver" in window)) {
      revealItems.forEach((item) => item.classList.add("reveal-visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("reveal-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.2,
        rootMargin: "0px 0px -40px 0px"
      }
    );

    revealItems.forEach((item) => observer.observe(item));
  }

  function focusSuccessMessage() {
    const successBox = byId("contact-success");
    if (!successBox) {
      return;
    }

    if (window.location.hash === "#contact-success") {
      successBox.style.display = "block";
      successBox.focus();
    }
  }
})();
