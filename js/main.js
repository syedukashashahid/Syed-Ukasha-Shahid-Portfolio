/*
 * Syed Ukasha Shahid — portfolio scripts (readable build).
 *
 * Needs, loaded before this file:
 *   js/vendor/gsap.min.js, js/vendor/ScrollTrigger.min.js, js/vendor/lenis.min.js
 *
 * Sections below, in order: environment flags, smooth scrolling, navigation,
 * hero (name fit, cursor effect, intro), scroll effects, reveals, cinematic
 * scroll scenes, project dialogs, small widgets (tabs, skills filter, clock,
 * copy buttons), live GitHub list, contact form, WebGL contour field, cursor.
 * Each part is marked with a "// src/scripts/<file>.ts" comment showing the
 * TypeScript source file it came from in the Astro project.
 */
(() => {
  // shims/gsap.js
  var gsap = window.gsap;
  var gsap_default = window.gsap;

  // shims/scrolltrigger.js
  var ScrollTrigger = window.ScrollTrigger;
  var scrolltrigger_default = window.ScrollTrigger;

  // src/scripts/env.ts
  var mq = (q) => (typeof window !== 'undefined' && window.matchMedia ? window.matchMedia(q).matches : false);
  var reducedMotion = mq('(prefers-reduced-motion: reduce)');
  var finePointer = mq('(hover: hover) and (pointer: fine)');
  var motionActive = () => document.documentElement.classList.contains('motion');

  // shims/lenis.js
  var lenis_default = window.Lenis;

  // src/scripts/smooth-scroll.ts
  var lenis = null;
  function lockScroll(lock) {
    if (lenis) {
      if (lock) lenis.stop();
      else lenis.start();
    }
    document.documentElement.style.overflow = lock ? 'hidden' : '';
  }
  var easeOutExpo = (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));
  var navOffset = () => parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0;
  function scrollToTarget(target) {
    const focus = () => {
      if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
    };
    const settle = () => {
      const drift2 = target.getBoundingClientRect().top - navOffset();
      if (Math.abs(drift2) > 4) {
        if (lenis) lenis.scrollTo(target, { immediate: true, force: true });
        else window.scrollTo({ top: window.scrollY + drift2, behavior: 'auto' });
      }
      focus();
    };
    if (lenis) {
      lenis.scrollTo(target, { duration: 1.25, easing: easeOutExpo, onComplete: settle });
    } else {
      target.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' });
      if ('onscrollend' in window) window.addEventListener('scrollend', settle, { once: true });
      else setTimeout(settle, 900);
    }
  }
  function initSmoothScroll(enable) {
    if (enable) {
      lenis = new lenis_default({ lerp: 0.11, smoothWheel: true, syncTouch: false });
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add((time) => lenis?.raf(time * 1e3));
      gsap.ticker.lagSmoothing(0);
    }
    document.addEventListener('click', (event) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey)
        return;
      const link = event.target?.closest('a[href^="#"]');
      if (!link) return;
      const id = decodeURIComponent(link.hash.slice(1));
      const target = id ? document.getElementById(id) : null;
      if (!target) return;
      event.preventDefault();
      scrollToTarget(target);
      if (location.hash !== `#${id}`) history.pushState(null, '', `#${id}`);
    });
  }

  // src/scripts/nav.ts
  function initNav() {
    const header = document.querySelector('[data-nav]');
    if (!header) return;
    const links = [...header.querySelectorAll('[data-nav-link]')];
    const marker = header.querySelector('[data-nav-marker]');
    const list = header.querySelector('[data-nav-list]');
    const progress = header.querySelector('[data-progress]');
    const bands = [...document.querySelectorAll('[data-band]')];
    const sections = links
      .map((l) => document.getElementById(l.dataset.navLink ?? ''))
      .filter((s) => Boolean(s));
    let activeId = '';
    const moveMarker = () => {
      if (!marker || !list) return;
      const link = links.find((l) => l.dataset.navLink === activeId);
      if (!link) {
        marker.style.setProperty('--o', '0');
        return;
      }
      const lr = link.getBoundingClientRect();
      const pr = list.getBoundingClientRect();
      marker.style.setProperty('--x', `${lr.left - pr.left}px`);
      marker.style.setProperty('--w', `${lr.width}px`);
      marker.style.setProperty('--o', '1');
    };
    const setActive = (id) => {
      if (id === activeId) return;
      activeId = id;
      links.forEach((l) => {
        if (l.dataset.navLink === id) l.setAttribute('aria-current', 'location');
        else l.removeAttribute('aria-current');
      });
      moveMarker();
    };
    const pickActive = () => {
      const probe = window.innerHeight * 0.4;
      let current = sections[0]?.id ?? '';
      for (const s of sections) {
        if (s.getBoundingClientRect().top <= probe) current = s.id;
      }
      setActive(current);
    };
    let theme = header.dataset.theme;
    const pickTheme = () => {
      const y = header.offsetHeight / 2;
      for (const b of bands) {
        const r = b.getBoundingClientRect();
        if (r.top <= y && r.bottom > y) {
          const t = b.dataset.theme;
          if (t && t !== theme) {
            theme = t;
            header.dataset.theme = t;
          }
          return;
        }
      }
    };
    let lastY = window.scrollY;
    let ticking = false;
    const update = () => {
      ticking = false;
      const y = window.scrollY;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      progress?.style.setProperty('--p', String(max > 0 ? Math.min(1, y / max) : 0));
      header.classList.toggle('is-scrolled', y > 24);
      const goingDown = y > lastY + 4;
      const goingUp = y < lastY - 4;
      if (goingDown && y > window.innerHeight * 0.85 && !header.contains(document.activeElement)) {
        header.classList.add('is-hidden');
      } else if (goingUp || y < 80) {
        header.classList.remove('is-hidden');
      }
      if (goingDown || goingUp) lastY = y;
      pickActive();
      pickTheme();
    };
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', () => {
      moveMarker();
      onScroll();
    });
    header.addEventListener('focusin', () => header.classList.remove('is-hidden'));
    document.fonts?.ready.then(moveMarker);
    update();
    const menu = document.querySelector('#menu');
    const openBtn = header.querySelector('[data-menu-open]');
    if (!menu || !openBtn) return;
    const closeMenu = () => {
      if (!menu.open) return;
      menu.close();
    };
    menu.addEventListener('close', () => {
      lockScroll(false);
      openBtn.setAttribute('aria-expanded', 'false');
    });
    openBtn.setAttribute('aria-expanded', 'false');
    openBtn.addEventListener('click', () => {
      menu.showModal();
      lockScroll(true);
      openBtn.setAttribute('aria-expanded', 'true');
    });
    menu.querySelector('[data-menu-close]')?.addEventListener('click', closeMenu);
    menu.querySelectorAll('[data-menu-link]').forEach((a) => {
      a.addEventListener('click', (event) => {
        const id = a.hash.slice(1);
        const target = document.getElementById(id);
        if (!target) return;
        event.preventDefault();
        menu.close();
        lockScroll(false);
        scrollToTarget(target);
        history.pushState(null, '', `#${id}`);
      });
    });
    window.matchMedia('(min-width: 901px)').addEventListener('change', (e) => {
      if (e.matches) closeMenu();
    });
  }

  // src/scripts/hero.ts
  var REST_WEIGHT = 820;
  var LIGHT_WEIGHT = 230;
  function initHero({ motion, fine }) {
    const hero = document.querySelector('.hero');
    const h1 = hero?.querySelector('.hero__name');
    const vis = hero?.querySelector('[data-name]');
    if (!hero || !h1 || !vis) return;
    const words = [...vis.querySelectorAll('.hero__word')];
    const chars = [...vis.querySelectorAll('[data-ch]')];
    const stackedMq = window.matchMedia('(max-width: 599px)');
    const interactive = fine && motion;
    let centers = [];
    const fit = () => {
      chars.forEach((c) => {
        c.style.width = '';
        c.style.fontWeight = '';
      });
      h1.style.setProperty('--name-size', '100px');
      const avail = h1.clientWidth;
      const stacked = stackedMq.matches;
      const measured = stacked
        ? Math.max(...words.map((w) => w.getBoundingClientRect().width))
        : words[words.length - 1].getBoundingClientRect().right - words[0].getBoundingClientRect().left;
      if (!measured) return;
      const size = Math.max(40, (100 * avail) / measured) * 0.998;
      h1.style.setProperty('--name-size', `${size.toFixed(2)}px`);
      if (interactive && !stacked) {
        const widths = chars.map((c) => c.getBoundingClientRect().width);
        chars.forEach((c, i) => (c.style.width = `${widths[i]}px`));
        const left = vis.getBoundingClientRect().left;
        centers = chars.map((c) => {
          const r = c.getBoundingClientRect();
          return r.left + r.width / 2 - left;
        });
        weights = chars.map(() => REST_WEIGHT);
      } else {
        centers = [];
      }
    };
    let weights = chars.map(() => REST_WEIGHT);
    let fitTimer = 0;
    const refit = () => {
      window.clearTimeout(fitTimer);
      fitTimer = window.setTimeout(() => {
        fit();
        ScrollTrigger.refresh();
      }, 120);
    };
    fit();
    document.fonts?.ready.then(() => {
      fit();
      ScrollTrigger.refresh();
    });
    new ResizeObserver(refit).observe(hero);
    if (interactive) {
      let px = -1e5;
      let py = -1e5;
      let inside = false;
      let visible = true;
      hero.addEventListener('pointermove', (e) => {
        px = e.clientX;
        py = e.clientY;
        inside = true;
      });
      hero.addEventListener('pointerleave', () => (inside = false));
      new IntersectionObserver(([entry]) => (visible = entry.isIntersecting)).observe(hero);
      const tick = () => {
        if (!visible || !centers.length) return;
        const r = vis.getBoundingClientRect();
        const radius = r.width * 0.09;
        const dy = py < r.top ? r.top - py : py > r.bottom ? py - r.bottom : 0;
        const vFactor = Math.exp(-Math.pow(dy / (r.height * 1.4), 2));
        for (let i = 0; i < chars.length; i++) {
          const cx = r.left + centers[i];
          const d = Math.abs(px - cx);
          const influence = inside ? Math.exp(-Math.pow(d / radius, 2)) * vFactor : 0;
          const target = REST_WEIGHT - (REST_WEIGHT - LIGHT_WEIGHT) * influence;
          const next = weights[i] + (target - weights[i]) * 0.16;
          if (Math.abs(next - weights[i]) > 0.4) {
            weights[i] = next;
            chars[i].style.fontWeight = String(Math.round(next));
          }
        }
      };
      gsap.ticker.add(tick);
    }
    if (!motion) return;
    const frame = hero.querySelector('.hero__frame');
    const img = hero.querySelector('[data-hero-img]') ?? frame?.querySelector('img');
    const headline = hero.querySelector('[data-hero-headline]');
    const lines = hero.querySelectorAll('[data-hero-line]');
    const meta = hero.querySelector('[data-hero-meta]');
    const tl = gsap.timeline({ defaults: { ease: 'expo.out' }, delay: 0.1 });
    if (frame) {
      tl.to(frame, { '--cg': '10px', '--cc': 'rgba(140, 207, 234, 0.75)', duration: 1.4 }, 0);
    }
    if (img) {
      tl.to(img, { opacity: 1, duration: 0.5, ease: 'power1.out' }, 0.1).to(
        img,
        {
          filter: 'brightness(1) contrast(1) blur(0px)',
          duration: 2,
          ease: 'power2.out',
          // Inline 'none' outranks the intro CSS state, leaving the photograph exactly as supplied.
          onComplete: () => void (img.style.filter = 'none'),
        },
        0.1,
      );
    }
    tl.to(chars, { y: 0, duration: 1.05, stagger: 0.024 }, 0.15);
    tl.set(vis, { clipPath: 'none' });
    if (headline) {
      gsap.set(headline, { opacity: 1 });
      const inner = headline.querySelector('.hero__hl');
      if (inner) tl.from(inner, { yPercent: 115, duration: 1.1, clearProps: 'transform' }, 0.5);
    }
    if (meta) tl.to(meta, { opacity: 1, duration: 0.8, ease: 'power2.out' }, 0.75);
    tl.fromTo(
      lines,
      { opacity: 0, y: 14 },
      { opacity: 1, y: 0, duration: 0.9, stagger: 0.07, clearProps: 'transform' },
      0.8,
    );
    const portrait = hero.querySelector('[data-hero-portrait]');
    if (portrait) {
      gsap.to(portrait, {
        yPercent: 7,
        ease: 'none',
        scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true },
      });
    }
    gsap.to(vis, {
      yPercent: -18,
      ease: 'none',
      scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true },
    });
  }

  // src/scripts/scroll-effects.ts
  function initScrollEffects() {
    document.querySelectorAll('[data-develop]').forEach((el) => {
      const img = el.tagName === 'IMG' ? el : el.querySelector('img');
      if (!img) return;
      ScrollTrigger.create({
        trigger: el.closest('figure') ?? el,
        start: 'top 82%',
        once: true,
        onEnter: () =>
          gsap.to(el, {
            opacity: 1,
            filter: 'grayscale(0) brightness(1) contrast(1) blur(0px)',
            duration: 1.8,
            ease: 'power2.out',
            onComplete: () => void (el.style.filter = 'none'),
          }),
      });
    });
    const csFrame = document.querySelector('.cs__frame');
    if (csFrame) {
      gsap.fromTo(
        csFrame,
        { rotateX: 14, y: 40, transformPerspective: 1800 },
        {
          rotateX: 0,
          y: 0,
          ease: 'none',
          scrollTrigger: { trigger: csFrame, start: 'top 98%', end: 'top 35%', scrub: 0.6 },
        },
      );
      const markers = csFrame.querySelectorAll('.cs__marker');
      gsap.set(markers, { '--m': 0 });
      ScrollTrigger.create({
        trigger: csFrame,
        start: 'top 70%',
        once: true,
        onEnter: () =>
          gsap.to(markers, {
            '--m': 1,
            duration: 0.7,
            ease: 'back.out(2.2)',
            stagger: 0.12,
            delay: 0.3,
          }),
      });
    }
    document.querySelectorAll('[data-tilt] > *').forEach((frame) => {
      gsap.fromTo(
        frame,
        { rotateX: 18, rotateY: -16, rotateZ: 2, y: 80 },
        {
          rotateX: 0,
          rotateY: 0,
          rotateZ: 0,
          y: 0,
          ease: 'none',
          scrollTrigger: { trigger: frame, start: 'top 100%', end: 'center 55%', scrub: 0.6 },
        },
      );
    });
    const pop = document.querySelector('[data-pop]');
    if (pop && window.matchMedia('(min-width: 641px)').matches) {
      gsap.fromTo(
        pop,
        { y: 90, rotate: -3 },
        {
          y: -50,
          rotate: 0,
          ease: 'none',
          scrollTrigger: { trigger: pop.parentElement, start: 'top 90%', end: 'bottom 30%', scrub: 0.8 },
        },
      );
    }
    const progress = document.querySelector('[data-edu-progress]');
    if (progress) {
      gsap.fromTo(
        progress,
        { scaleX: 0 },
        {
          scaleX: 1,
          duration: 1.6,
          ease: 'expo.out',
          scrollTrigger: { trigger: progress, start: 'top 80%', once: true },
        },
      );
    }
  }

  // src/scripts/reveals.ts
  var GROUPS = [
    {
      kind: 'rise',
      selector: [
        '.t-section',
        '.pinfo__title',
        '.gh__title',
        '.footer__name',
        '.edu__year',
        '.strengths__list li',
        '.strengths__lang',
      ].join(','),
    },
    {
      kind: 'settle',
      selector: [
        '.t-lead',
        '.pinfo__category',
        '.pinfo__status',
        '.pinfo__context',
        '.pinfo__summary',
        '.pinfo__stack',
        '.pinfo__actions',
        '.projects__key',
        '.plate .figlabel',
        '.cs__scale',
        '.cc__map',
        '.cc__menu',
        '.cc__palette',
        '.bus__hint',
        '.bus__figure .win',
        '.gh__text',
        '.gh__cta',
        '.skills__lead',
        '.skills__filter',
        '.skills__gtitle',
        '.edu__title',
        '.edu__inst',
        '.edu__detail',
        '.edu__semlabel',
        '.strengths__title',
        '.strengths__sub',
        '.contact__lead',
        '.cform',
        '.footer__col',
        '.footer__top',
      ].join(','),
    },
    {
      kind: 'stagger',
      selector: [
        '.about__block',
        '.about__fact',
        '.cs__legend li',
        '.bus__stop',
        '.skill__name',
        '.skill__where',
        '.edu__sems li',
        '.contact__row',
      ].join(','),
    },
  ];
  var FROM = {
    rise: { yPercent: 38, opacity: 0, clipPath: 'inset(100% 0% 0% 0%)' },
    settle: { y: 28, opacity: 0 },
    stagger: { y: 22, opacity: 0 },
  };
  var TO = {
    rise: {
      yPercent: 0,
      opacity: 1,
      clipPath: 'inset(-20% 0% -20% 0%)',
      duration: 1.1,
      ease: 'expo.out',
      stagger: 0.08,
    },
    settle: { y: 0, opacity: 1, duration: 0.9, ease: 'power3.out', stagger: 0.07 },
    stagger: { y: 0, opacity: 1, duration: 0.7, ease: 'power3.out', stagger: 0.05 },
  };
  function initReveals() {
    ScrollTrigger.config({ ignoreMobileResize: true });
    const mobile = window.matchMedia('(max-width: 767px)').matches;
    const start = mobile ? 'top 94%' : 'top 88%';
    const fold = window.innerHeight;
    const done = /* @__PURE__ */ new WeakSet();
    for (const { kind, selector } of GROUPS) {
      const targets = gsap.utils
        .toArray(selector)
        .filter((el) => !el.closest('.hero, dialog') && el.getBoundingClientRect().top > fold * 0.92);
      if (!targets.length) continue;
      gsap.set(targets, FROM[kind]);
      const reveal = (batch) => {
        const fresh = batch.filter((el) => !done.has(el));
        if (!fresh.length) return;
        fresh.forEach((el) => done.add(el));
        gsap.to(fresh, {
          ...TO[kind],
          // Shorter, tighter motion on phones.
          duration: TO[kind].duration * (mobile ? 0.8 : 1),
          overwrite: 'auto',
          clearProps: 'transform,opacity,clipPath',
        });
      };
      ScrollTrigger.batch(targets, {
        start,
        interval: 0.08,
        batchMax: mobile ? 4 : 8,
        onEnter: reveal,
        onEnterBack: reveal,
        onLeave: reveal,
        // jumped straight past it
        onLeaveBack: () => {},
      });
    }
    const aboutFrame = document.querySelector('.about__frame');
    if (aboutFrame && aboutFrame.getBoundingClientRect().top > fold * 0.92) {
      gsap.fromTo(
        aboutFrame,
        { '--cg': '30px' },
        {
          '--cg': '7px',
          duration: 1.4,
          ease: 'expo.out',
          scrollTrigger: { trigger: aboutFrame, start, once: true },
        },
      );
    }
    gsap.utils.toArray('.skills__group').forEach((group) => {
      if (group.getBoundingClientRect().top <= fold * 0.92) return;
      gsap.fromTo(
        group,
        { '--rule-draw': 0 },
        {
          '--rule-draw': 1,
          duration: 1.2,
          ease: 'expo.out',
          scrollTrigger: { trigger: group, start, once: true },
        },
      );
    });
    document.fonts?.ready.then(() => ScrollTrigger.refresh());
  }

  // src/scripts/cinematic.ts
  function initCinematic() {
    const mm = gsap.matchMedia();
    mm.add({ desktop: '(min-width: 768px)', mobile: '(max-width: 767px)' }, (ctx) => {
      const desktop = Boolean(ctx.conditions?.desktop);
      heroExit(desktop);
      expandFrames(desktop);
      if (desktop) cameraTour();
      else cameraPullBack();
      drift(desktop);
      pushIns(desktop);
      ScrollTrigger.sort();
      ScrollTrigger.refresh();
    });
  }
  function heroExit(desktop) {
    const hero = document.querySelector('.hero');
    const fade = hero?.querySelector('[data-hero-fade]');
    const frame = hero?.querySelector('.hero__frame');
    if (!hero || !fade) return;
    const st = { trigger: hero, start: 'top top', end: 'bottom top', scrub: true };
    gsap.fromTo(
      fade,
      { opacity: 0 },
      { opacity: 0.85, ease: 'power1.in', scrollTrigger: { ...st, start: desktop ? '20% top' : '35% top' } },
    );
    if (frame)
      gsap.to(frame, {
        scale: desktop ? 1.1 : 1.06,
        transformOrigin: '50% 30%',
        ease: 'none',
        scrollTrigger: st,
      });
  }
  function expandFrames(desktop) {
    const side = desktop ? 5 : 3.5;
    const radius = desktop ? 28 : 18;
    gsap.utils.toArray('#about, .plate--cc, .plate--sh, #education').forEach((el) => {
      gsap.fromTo(
        el,
        { clipPath: `inset(0% ${side}% 0% ${side}% round ${radius}px)` },
        {
          clipPath: 'inset(0% 0% 0% 0% round 0px)',
          ease: 'none',
          scrollTrigger: {
            trigger: el,
            start: 'top bottom',
            end: desktop ? 'top 20%' : 'top 35%',
            scrub: true,
          },
        },
      );
    });
  }
  var SHOTS = [
    { fx: 0.27, fy: 0.42, s: 2.1, callout: '1' },
    { fx: 0.82, fy: 0.4, s: 1.9, callout: '2' },
    { fx: 0.44, fy: 0.84, s: 1.75, callout: '3' },
    { fx: 0.8, fy: 0.84, s: 1.9, callout: '4' },
    { fx: 0.1, fy: 0.32, s: 2.2, callout: '5' },
  ];
  var aim = ({ fx, fy, s }) => {
    const clamp = (v) => gsap.utils.clamp((1 - s) * 100, 0, v);
    return {
      xPercent: clamp((0.5 - fx * s) * 100),
      yPercent: clamp((0.5 - fy * s) * 100),
      scale: s,
      '--cam-s': s,
    };
  };
  function cameraTour() {
    const figure = document.querySelector('.cs__figure');
    const camera = figure?.querySelector('[data-cs-camera]');
    if (!figure || !camera) return;
    const markers = [...figure.querySelectorAll('[data-callout]')];
    const legend = [...document.querySelectorAll('[data-callout-key]')];
    const subtitle = figure.querySelector('[data-cs-subtitle]');
    const subNum = figure.querySelector('[data-cs-subnum]');
    const subHead = figure.querySelector('[data-cs-subhead]');
    const subText = figure.querySelector('[data-cs-subtext]');
    let current = '';
    const show = (n) => {
      if (n === current) return;
      current = n;
      markers.forEach((m2) => m2.classList.toggle('is-active', m2.dataset.callout === n));
      legend.forEach((k) => k.classList.toggle('is-active', k.dataset.calloutKey === n));
      const m = markers.find((x) => x.dataset.callout === n);
      subtitle?.classList.toggle('is-on', Boolean(m));
      if (m && subNum && subHead && subText) {
        subNum.textContent = n;
        subHead.textContent = m.dataset.title ?? '';
        subText.textContent = m.dataset.text ?? '';
      }
    };
    const MOVE = 1;
    const HOLD = 0.9;
    const tl = gsap.timeline({ defaults: { ease: 'power2.inOut' } });
    tl.set(camera, { xPercent: 0, yPercent: 0, scale: 1, '--cam-s': 1 });
    tl.to({}, { duration: 0.4 });
    const holds = [];
    SHOTS.forEach((shot) => {
      const start = tl.duration() + MOVE * 0.5;
      tl.to(camera, { ...aim(shot), duration: MOVE });
      tl.to({}, { duration: HOLD });
      holds.push({ start, end: tl.duration() + MOVE * 0.5, n: shot.callout ?? '' });
    });
    tl.to(camera, { xPercent: 0, yPercent: 0, scale: 1, '--cam-s': 1, duration: MOVE });
    tl.to({}, { duration: 0.5 });
    const total = tl.duration();
    ScrollTrigger.create({
      trigger: figure,
      start: () => (figure.offsetHeight > window.innerHeight * 0.86 ? 'top top+=72' : 'center center'),
      end: () => `+=${window.innerHeight * 3.2}`,
      pin: true,
      scrub: 0.8,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      animation: tl,
      onUpdate: (self) => {
        const t = self.progress * total;
        show(holds.find((h) => t >= h.start && t <= h.end)?.n ?? '');
      },
      onLeave: () => show(''),
      onLeaveBack: () => show(''),
    });
  }
  function cameraPullBack() {
    const camera = document.querySelector('[data-cs-camera]');
    if (!camera) return;
    gsap.fromTo(camera, aim({ fx: 0.27, fy: 0.42, s: 1.7 }), {
      xPercent: 0,
      yPercent: 0,
      scale: 1,
      '--cam-s': 1,
      ease: 'power1.inOut',
      scrollTrigger: { trigger: camera, start: 'top 80%', end: 'bottom 35%', scrub: 0.6 },
    });
  }
  function drift(desktop) {
    const amount = desktop ? 48 : 18;
    gsap.utils.toArray('.skills__list').forEach((list, i) => {
      const dir = i % 2 === 0 ? 1 : -1;
      gsap.fromTo(
        list,
        { x: amount * dir },
        {
          x: -amount * dir,
          ease: 'none',
          scrollTrigger: { trigger: list, start: 'top bottom', end: 'bottom top', scrub: true },
        },
      );
    });
  }
  function pushIns(desktop) {
    const bus = document.querySelector('.bus__figure');
    if (bus) {
      gsap.fromTo(
        bus,
        { y: desktop ? 90 : 40, scale: 0.96 },
        {
          y: 0,
          scale: 1,
          ease: 'none',
          scrollTrigger: { trigger: bus, start: 'top bottom', end: 'top 30%', scrub: true },
        },
      );
    }
    const title = document.querySelector('.contact__title');
    if (title) {
      gsap.fromTo(
        title,
        { scale: 0.86, opacity: 0.15, y: desktop ? 80 : 40, transformOrigin: '0% 100%' },
        {
          scale: 1,
          opacity: 1,
          y: 0,
          ease: 'none',
          scrollTrigger: { trigger: title, start: 'top bottom', end: 'top 45%', scrub: true },
        },
      );
    }
  }

  // src/scripts/dialogs.ts
  function initDialogs(motion) {
    const openers = document.querySelectorAll('[data-dialog-open]');
    const closing = /* @__PURE__ */ new WeakSet();
    let opener = null;
    const animateClose = (dialog) => {
      if (closing.has(dialog)) return;
      if (!motion) {
        dialog.close();
        return;
      }
      closing.add(dialog);
      gsap.to(dialog, {
        xPercent: 100,
        duration: 0.45,
        ease: 'power3.in',
        onComplete: () => {
          dialog.close();
          gsap.set(dialog, { clearProps: 'transform' });
          closing.delete(dialog);
        },
      });
    };
    openers.forEach((btn) => {
      const dialog = document.getElementById(btn.dataset.dialogOpen ?? '');
      if (!dialog) return;
      btn.addEventListener('click', () => {
        opener = btn;
        dialog.showModal();
        lockScroll(true);
        dialog.scrollTop = 0;
        if (motion) gsap.fromTo(dialog, { xPercent: 100 }, { xPercent: 0, duration: 0.7, ease: 'expo.out' });
      });
    });
    document.querySelectorAll('dialog[data-dialog]').forEach((dialog) => {
      dialog.setAttribute('data-lenis-prevent', '');
      dialog
        .querySelectorAll('[data-dialog-close]')
        .forEach((b) => b.addEventListener('click', () => animateClose(dialog)));
      dialog.addEventListener('cancel', (e) => {
        e.preventDefault();
        animateClose(dialog);
      });
      dialog.addEventListener('click', (e) => {
        const r = dialog.getBoundingClientRect();
        const outside =
          e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom;
        if (outside && e.target === dialog) animateClose(dialog);
      });
      dialog.addEventListener('close', () => {
        lockScroll(false);
        opener?.focus({ preventScroll: true });
        opener = null;
      });
    });
  }

  // src/scripts/widgets.ts
  function initCallouts() {
    const scope = document.querySelector('.plate--cs');
    if (!scope) return;
    const keys = scope.querySelectorAll('[data-callout-key]');
    const set = (n) => {
      scope
        .querySelectorAll('[data-callout]')
        .forEach((m) => m.classList.toggle('is-active', m.dataset.callout === n));
      keys.forEach((k) => k.classList.toggle('is-active', k.dataset.calloutKey === n));
    };
    keys.forEach((k) => {
      k.addEventListener('pointerenter', () => set(k.dataset.calloutKey ?? null));
      k.addEventListener('pointerleave', () => set(null));
    });
  }
  function initBusTabs() {
    const tablist = document.querySelector('[data-tabs]');
    if (!tablist) return;
    const tabs = [...tablist.querySelectorAll('[role="tab"]')];
    const fill = tablist.querySelector('[data-route-fill]');
    const scope = tablist.closest('.plate--bus');
    const select = (index, focus = false) => {
      tabs.forEach((tab, i) => {
        const on = i === index;
        tab.setAttribute('aria-selected', String(on));
        tab.tabIndex = on ? 0 : -1;
        tab.classList.toggle('is-passed', i < index);
        const panel = document.getElementById(tab.getAttribute('aria-controls') ?? '');
        panel?.classList.toggle('is-active', on);
      });
      const id = tabs[index].dataset.tab;
      scope
        ?.querySelectorAll('[data-side]')
        .forEach((li) => li.classList.toggle('is-sel', li.dataset.side === id));
      fill?.style.setProperty('--route-p', String(index / (tabs.length - 1)));
      if (focus) tabs[index].focus();
    };
    tabs.forEach((tab, i) => {
      tab.addEventListener('click', () => select(i));
      tab.addEventListener('keydown', (e) => {
        const last = tabs.length - 1;
        let next = -1;
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = i === last ? 0 : i + 1;
        else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = i === 0 ? last : i - 1;
        else if (e.key === 'Home') next = 0;
        else if (e.key === 'End') next = last;
        if (next >= 0) {
          e.preventDefault();
          select(next, true);
        }
      });
    });
    select(0);
  }
  function initSkillsFilter() {
    const root = document.querySelector('[data-skills]');
    if (!root) return;
    const buttons = [...root.querySelectorAll('[data-filter]')];
    const skills = [...root.querySelectorAll('.skill')];
    const status = root.querySelector('[data-skills-status]');
    buttons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.filter ?? 'all';
        buttons.forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
        const filtering = id !== 'all';
        root.classList.toggle('is-filtering', filtering);
        const matched = [];
        skills.forEach((s) => {
          const hit = filtering && (s.dataset.used ?? '').split(' ').includes(id);
          s.classList.toggle('is-match', hit);
          const name = s.querySelector('.skill__name')?.textContent?.trim();
          if (hit && name && !matched.includes(name)) matched.push(name);
        });
        if (status) {
          status.textContent = filtering
            ? `${btn.textContent?.trim()} used ${matched.length} listed skills: ${matched.join(', ')}.`
            : 'Showing all skills.';
        }
      });
    });
  }
  function initClock(timeZone = 'Asia/Karachi') {
    const wrap = document.querySelector('[data-clock-wrap]');
    const el = document.querySelector('[data-clock]');
    if (!wrap || !el) return;
    let fmt;
    try {
      fmt = new Intl.DateTimeFormat('en-GB', { timeZone, hour: '2-digit', minute: '2-digit', hour12: false });
    } catch {
      return;
    }
    const render2 = () => {
      el.textContent = fmt.format(/* @__PURE__ */ new Date());
    };
    render2();
    wrap.hidden = false;
    window.setInterval(render2, 2e4);
  }
  function initCopy() {
    document.querySelectorAll('[data-copy]').forEach((btn) => {
      const label = btn.querySelector('[data-copy-label]');
      const original = label?.textContent ?? 'Copy';
      let timer = 0;
      btn.addEventListener('click', async () => {
        const text = btn.dataset.copy ?? '';
        let ok = false;
        try {
          await navigator.clipboard.writeText(text);
          ok = true;
        } catch {
          ok = false;
        }
        if (label) label.textContent = ok ? 'Copied' : 'Copy failed';
        btn.classList.toggle('is-done', ok);
        window.clearTimeout(timer);
        timer = window.setTimeout(() => {
          if (label) label.textContent = original;
          btn.classList.remove('is-done');
        }, 2200);
      });
    });
  }

  // src/scripts/github.ts
  var CACHE_KEY = 'gh-repos-v1';
  var CACHE_MS = 30 * 60 * 1e3;
  var readCache = (user) => {
    try {
      const raw = sessionStorage.getItem(`${CACHE_KEY}:${user}`);
      if (!raw) return null;
      const { at, data } = JSON.parse(raw);
      return Date.now() - at < CACHE_MS ? data : null;
    } catch {
      return null;
    }
  };
  var writeCache = (user, data) => {
    try {
      sessionStorage.setItem(`${CACHE_KEY}:${user}`, JSON.stringify({ at: Date.now(), data }));
    } catch {}
  };
  var dateFmt = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  function render(list, repos) {
    list.replaceChildren(
      ...repos.map((r) => {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = r.html_url;
        a.rel = 'noopener';
        const name = document.createElement('span');
        name.className = 'gh__name';
        name.textContent = r.name;
        const arrow = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        arrow.setAttribute('viewBox', '0 0 24 24');
        arrow.setAttribute('class', 'gh__arrow');
        arrow.setAttribute('aria-hidden', 'true');
        arrow.innerHTML =
          '<path d="M9 5h10v10M19 5L6 18" fill="none" stroke="currentColor" stroke-width="1.6"/>';
        a.append(name, arrow);
        if (r.description) {
          const d = document.createElement('span');
          d.className = 'gh__desc';
          d.textContent = r.description;
          a.append(d);
        }
        const meta = document.createElement('span');
        meta.className = 'gh__meta';
        const bits = [r.language, `Updated ${dateFmt.format(new Date(r.pushed_at))}`].filter(Boolean);
        bits.forEach((b) => {
          const s = document.createElement('span');
          s.textContent = b;
          meta.append(s);
        });
        a.append(meta);
        li.append(a);
        return li;
      }),
    );
  }
  function initGitHub() {
    const root = document.querySelector('[data-gh]');
    const list = root?.querySelector('[data-gh-list]');
    const state = root?.querySelector('[data-gh-state]');
    const user = root?.dataset.ghUser;
    if (!root || !list || !state || !user) return;
    let hide = [];
    try {
      hide = JSON.parse(root.dataset.ghHide ?? '[]').map((n) => n.toLowerCase());
    } catch {
      hide = [];
    }
    const show = (repos, total) => {
      const visible = repos
        .filter((r) => !r.fork && !hide.includes(r.name.toLowerCase()))
        .sort((a, b) => Date.parse(b.pushed_at) - Date.parse(a.pushed_at))
        .slice(0, 6);
      if (!visible.length) {
        list.replaceChildren();
        state.textContent = 'No public repositories to show yet.';
        return;
      }
      render(list, visible);
      state.textContent = `Showing the ${visible.length} most recently updated of ${total} public repositories.`;
    };
    const load = async () => {
      const cached = readCache(user);
      if (cached) {
        show(cached, cached.length);
        return;
      }
      state.textContent = 'Loading repositories from GitHub\u2026';
      try {
        const ctrl = new AbortController();
        const timeout = window.setTimeout(() => ctrl.abort(), 8e3);
        const res = await fetch(
          `https://api.github.com/users/${encodeURIComponent(user)}/repos?per_page=100&sort=pushed`,
          {
            headers: { Accept: 'application/vnd.github+json' },
            signal: ctrl.signal,
          },
        );
        window.clearTimeout(timeout);
        if (!res.ok) throw new Error(String(res.status));
        const data = await res.json();
        writeCache(user, data);
        show(data, data.length);
      } catch {
        list.replaceChildren();
        state.textContent =
          'GitHub couldn\u2019t be reached just now, so the repository list isn\u2019t shown. Use the button to browse them on GitHub.';
      }
    };
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver(
        (entries) => {
          if (entries.some((e) => e.isIntersecting)) {
            io.disconnect();
            load();
          }
        },
        { rootMargin: '1600px 0px' },
      );
      io.observe(root);
    } else {
      load();
    }
  }

  // src/scripts/contact-form.ts
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  var rules = {
    name: (v) => (v.trim().length < 2 ? 'Enter your name.' : ''),
    email: (v) =>
      !v.trim()
        ? 'Enter your email address.'
        : !EMAIL_RE.test(v.trim())
          ? 'Enter an email address like name@example.com.'
          : '',
    subject: (v) => (v.trim().length < 2 ? 'Add a subject.' : ''),
    message: (v) => (v.trim().length < 10 ? 'Write a message of at least 10 characters.' : ''),
  };
  var escapeHtml = (s) =>
    s.replace(
      /[&<>"']/g,
      (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c],
    );
  function initContactForm() {
    const form = document.querySelector('[data-contact-form]');
    if (!form) return;
    const fields = [...form.querySelectorAll('input[name]:not([name="company"]), textarea[name]')];
    const status = form.querySelector('[data-status]');
    const submit = form.querySelector('[data-submit]');
    const submitLabel = form.querySelector('[data-submit-label]');
    const provider = form.dataset.provider ?? 'none';
    const to = form.dataset.to ?? '';
    let attempted = false;
    const errorEl = (f) => document.getElementById(`${f.id}-err`);
    const check = (f) => {
      const msg = rules[f.name]?.(f.value) ?? '';
      const el = errorEl(f);
      if (el) el.textContent = msg;
      if (msg) f.setAttribute('aria-invalid', 'true');
      else f.removeAttribute('aria-invalid');
      return !msg;
    };
    fields.forEach((f) => {
      f.addEventListener('blur', () => attempted && check(f));
      f.addEventListener('input', () => {
        if (attempted || f.getAttribute('aria-invalid') === 'true') check(f);
      });
    });
    const showStatus = (html, tone) => {
      status.innerHTML = html;
      status.classList.toggle('is-error', tone === 'error');
      status.hidden = false;
      status.focus({ preventScroll: false });
    };
    const mailtoHref = (data) => {
      const body = `${data.message}

${data.name}
${data.email}`;
      return `mailto:${to}?subject=${encodeURIComponent(data.subject)}&body=${encodeURIComponent(body)}`;
    };
    const fallbackActions = (data) =>
      `<div class="cform__actions"><a class="btn btn--line" href="${mailtoHref(data)}">Open in email app</a><a class="link" href="mailto:${to}"><span>${escapeHtml(to)}</span></a></div>`;
    const setBusy = (busy) => {
      submit.disabled = busy;
      submit.setAttribute('aria-busy', String(busy));
      submitLabel.textContent = busy ? 'Sending\u2026' : 'Send message';
    };
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      attempted = true;
      const valid = fields.map(check).every(Boolean);
      if (!valid) {
        fields.find((f) => f.getAttribute('aria-invalid') === 'true')?.focus();
        return;
      }
      const hp = form.querySelector('[name="company"]');
      if (hp?.value) return;
      const data = Object.fromEntries(fields.map((f) => [f.name, f.value.trim()]));
      if (provider === 'none') {
        showStatus(
          `<p><strong>Your message has not been sent.</strong> Online sending isn\u2019t set up on this copy of the site yet.</p><p>Your text is still in the form. Open it in your email app to send it to ${escapeHtml(to)}.</p>${fallbackActions(data)}`,
          'info',
        );
        return;
      }
      setBusy(true);
      try {
        let ok = false;
        if (provider === 'web3forms') {
          const res = await fetch('https://api.web3forms.com/submit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
            body: JSON.stringify({
              access_key: form.dataset.web3formsKey,
              from_name: 'Portfolio contact form',
              subject: `Portfolio: ${data.subject}`,
              name: data.name,
              email: data.email,
              message: data.message,
              replyto: data.email,
            }),
          });
          const json = await res.json().catch(() => ({}));
          ok = res.ok && json.success === true;
        } else if (provider === 'formspree') {
          const res = await fetch(form.dataset.formspree ?? '', {
            method: 'POST',
            headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...data, _replyto: data.email, _subject: `Portfolio: ${data.subject}` }),
          });
          ok = res.ok;
        }
        if (!ok) throw new Error('Delivery not confirmed');
        form.reset();
        attempted = false;
        showStatus(
          `<p><strong>Message sent.</strong> Thanks, ${escapeHtml(data.name)}. It\u2019s in my inbox, and I\u2019ll reply to ${escapeHtml(data.email)}.</p>`,
          'ok',
        );
      } catch {
        showStatus(
          `<p><strong>Your message wasn\u2019t sent.</strong> The email service didn\u2019t confirm delivery. Check your connection and try again, or email me directly.</p>${fallbackActions(data)}`,
          'error',
        );
      } finally {
        setBusy(false);
      }
    });
  }

  // src/scripts/contour.ts
  var VERT = `#version 300 es
in vec2 p;
void main() { gl_Position = vec4(p, 0.0, 1.0); }`;
  var FRAG = `#version 300 es
precision highp float;
uniform vec2 uRes;
uniform float uTime;
uniform vec3 uMouse; // xy in surface space, z = strength
uniform vec3 uColor;
out vec4 outColor;

vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
float snoise(vec3 v) {
  const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;
  i = mod289(i);
  vec4 p = permute(permute(permute(i.z + vec4(0.0, i1.z, i2.z, 1.0)) + i.y + vec4(0.0, i1.y, i2.y, 1.0)) + i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);
  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
}

void main() {
  vec2 uv = gl_FragCoord.xy / uRes.y;
  float t = uTime * 0.035;
  float h = snoise(vec3(uv * 1.15, t)) * 0.62 + snoise(vec3(uv * 2.6 + 7.3, t * 1.6)) * 0.22;
  vec2 d = uv - uMouse.xy;
  h += uMouse.z * 0.75 * exp(-dot(d, d) * 9.0);

  float bands = 11.0;
  float f = h * bands;
  float w = fwidth(f);
  float line = 1.0 - smoothstep(0.0, w * 1.25, abs(fract(f - 0.5) - 0.5));
  float f5 = h * bands / 4.0;
  float w5 = fwidth(f5);
  float major = 1.0 - smoothstep(0.0, w5 * 1.6, abs(fract(f5 - 0.5) - 0.5));

  // Fade toward the left so the form side stays calm.
  float xr = gl_FragCoord.x / uRes.x;
  float fade = smoothstep(0.0, 0.55, 1.0 - xr) * 0.85 + 0.15;
  float a = (line * 0.16 + major * 0.32) * fade;
  outColor = vec4(uColor * a, a);
}`;
  function initContour(motion) {
    const canvas = document.querySelector('[data-contour]');
    if (!canvas) return;
    const gl = canvas.getContext('webgl2', {
      alpha: true,
      antialias: false,
      premultipliedAlpha: true,
      powerPreference: 'low-power',
    });
    if (!gl) {
      canvas.remove();
      return;
    }
    const compile = (type, src) => {
      const s = gl.createShader(type);
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) ?? 'shader');
      return s;
    };
    let program;
    try {
      program = gl.createProgram();
      gl.attachShader(program, compile(gl.VERTEX_SHADER, VERT));
      gl.attachShader(program, compile(gl.FRAGMENT_SHADER, FRAG));
      gl.linkProgram(program);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error('link');
    } catch {
      canvas.remove();
      return;
    }
    gl.useProgram(program);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(program, 'p');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const uRes = gl.getUniformLocation(program, 'uRes');
    const uTime = gl.getUniformLocation(program, 'uTime');
    const uMouse = gl.getUniformLocation(program, 'uMouse');
    const uColor = gl.getUniformLocation(program, 'uColor');
    gl.uniform3f(uColor, 140 / 255, 207 / 255, 234 / 255);
    let width = 0;
    let height = 0;
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const r = canvas.getBoundingClientRect();
      width = Math.max(1, Math.round(r.width * dpr));
      height = Math.max(1, Math.round(r.height * dpr));
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }
      gl.viewport(0, 0, width, height);
      gl.uniform2f(uRes, width, height);
    };
    const mouse = { x: 0, y: 0, z: 0, tx: 0, ty: 0, tz: 0 };
    const section = canvas.parentElement;
    if (motion) {
      section.addEventListener('pointermove', (e) => {
        const r = canvas.getBoundingClientRect();
        mouse.tx = (e.clientX - r.left) / r.height;
        mouse.ty = (r.bottom - e.clientY) / r.height;
        mouse.tz = 1;
      });
      section.addEventListener('pointerleave', () => (mouse.tz = 0));
    }
    let raf = 0;
    let running = false;
    const start = performance.now() - 4e4 * Math.random();
    const draw = (now) => {
      mouse.x += (mouse.tx - mouse.x) * 0.06;
      mouse.y += (mouse.ty - mouse.y) * 0.06;
      mouse.z += (mouse.tz - mouse.z) * 0.04;
      gl.uniform1f(uTime, (now - start) / 1e3);
      gl.uniform3f(uMouse, mouse.x, mouse.y, mouse.z);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };
    const loop = (now) => {
      draw(now);
      raf = requestAnimationFrame(loop);
    };
    const play = () => {
      if (running || !motion) return;
      running = true;
      raf = requestAnimationFrame(loop);
    };
    const pause = () => {
      running = false;
      cancelAnimationFrame(raf);
    };
    resize();
    draw(performance.now());
    new ResizeObserver(() => {
      resize();
      if (!running) draw(performance.now());
    }).observe(canvas);
    let inView = false;
    new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      if (inView && !document.hidden) play();
      else pause();
    }).observe(canvas);
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) pause();
      else if (inView) play();
    });
  }

  // src/scripts/pointer.ts
  function initCursor() {
    const root = document.querySelector('[data-cursor]');
    const ring = root?.querySelector('[data-cursor-ring]');
    const cross = root?.querySelector('[data-cursor-cross]');
    if (!root || !ring || !cross) return;
    root.hidden = false;
    document.documentElement.classList.add('has-cursor');
    root.classList.add('is-out');
    const setCrossX = gsap.quickSetter(cross, 'x', 'px');
    const setCrossY = gsap.quickSetter(cross, 'y', 'px');
    const ringX = gsap.quickTo(ring, 'x', { duration: 0.45, ease: 'power3.out' });
    const ringY = gsap.quickTo(ring, 'y', { duration: 0.45, ease: 'power3.out' });
    const interactive = 'a, button, [role="tab"], label, summary, [data-cursor-link]';
    const textual = 'input, textarea, select, [contenteditable="true"]';
    window.addEventListener(
      'pointermove',
      (e) => {
        if (e.pointerType !== 'mouse') return;
        setCrossX(e.clientX);
        setCrossY(e.clientY);
        ringX(e.clientX);
        ringY(e.clientY);
        root.classList.remove('is-out');
        const t = e.target;
        root.classList.toggle('is-text', Boolean(t?.closest(textual)));
        root.classList.toggle('is-link', Boolean(t?.closest(interactive)) && !t?.closest(textual));
      },
      { passive: true },
    );
    document.addEventListener('pointerleave', () => root.classList.add('is-out'));
    window.addEventListener('blur', () => root.classList.add('is-out'));
    window.addEventListener('pointerdown', () => root.classList.add('is-down'));
    window.addEventListener('pointerup', () => root.classList.remove('is-down'));
    const syncDialogs = () => {
      const anyOpen = Boolean(document.querySelector('dialog[open]'));
      document.documentElement.classList.toggle('has-cursor', !anyOpen);
      root.style.visibility = anyOpen ? 'hidden' : '';
    };
    new MutationObserver(syncDialogs).observe(document.body, {
      subtree: true,
      attributes: true,
      attributeFilter: ['open'],
    });
  }
  function initMagnetic() {
    document.querySelectorAll('[data-magnetic]').forEach((el) => {
      const x = gsap.quickTo(el, 'x', { duration: 0.6, ease: 'elastic.out(1, 0.5)' });
      const y = gsap.quickTo(el, 'y', { duration: 0.6, ease: 'elastic.out(1, 0.5)' });
      el.addEventListener('pointermove', (e) => {
        if (e.pointerType !== 'mouse') return;
        const r = el.getBoundingClientRect();
        x((e.clientX - (r.left + r.width / 2)) * 0.22);
        y((e.clientY - (r.top + r.height / 2)) * 0.32);
      });
      el.addEventListener('pointerleave', () => {
        x(0);
        y(0);
      });
    });
  }

  // src/scripts/main.ts
  gsap.registerPlugin(ScrollTrigger);
  var safely = (name, fn) => {
    try {
      fn();
    } catch (err) {
      if (false) console.warn(`[${name}]`, err);
    }
  };
  var whenNear = (selector, fn) => {
    const el = document.querySelector(selector);
    if (!el || !('IntersectionObserver' in window)) return fn();
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          io.disconnect();
          safely('lazy', fn);
        }
      },
      { rootMargin: '900px 0px' },
    );
    io.observe(el);
  };
  var watchPageHeight = () => {
    if (!('ResizeObserver' in window)) return;
    let last = document.body.scrollHeight;
    let timer = 0;
    let lastScroll = 0;
    window.addEventListener('scroll', () => (lastScroll = performance.now()), { passive: true });
    const check = () => {
      if (performance.now() - lastScroll < 220) {
        timer = window.setTimeout(check, 220);
        return;
      }
      const h = document.body.scrollHeight;
      if (Math.abs(h - last) > 2) {
        ScrollTrigger.refresh();
        last = document.body.scrollHeight;
      }
    };
    new ResizeObserver(() => {
      window.clearTimeout(timer);
      timer = window.setTimeout(check, 150);
    }).observe(document.body);
  };
  function init() {
    if (window.__motionFallback) window.clearTimeout(window.__motionFallback);
    const motion = motionActive() && !reducedMotion;
    safely('scroll', () => initSmoothScroll(motion && finePointer));
    safely('nav', initNav);
    safely('hero', () => initHero({ motion, fine: finePointer }));
    safely('dialogs', () => initDialogs(motion));
    safely('callouts', initCallouts);
    safely('bus', initBusTabs);
    safely('skills', initSkillsFilter);
    safely('clock', () => initClock());
    safely('copy', initCopy);
    safely('github', initGitHub);
    safely('form', initContactForm);
    safely('contour', () => whenNear('#contact', () => initContour(motion)));
    if (motion) {
      safely('effects', initScrollEffects);
      safely('reveals', initReveals);
      safely('cinematic', initCinematic);
      if (finePointer) {
        safely('cursor', initCursor);
        safely('magnetic', initMagnetic);
      }
    } else {
      document.documentElement.classList.remove('motion');
    }
    window.addEventListener('load', () => ScrollTrigger.refresh());
    watchPageHeight();
  }

  // entry.ts
  init();
})();
