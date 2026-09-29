const burger = document.querySelector('.burger');
const mobileNav = document.querySelector('.mobile-nav');
const mobileNavClose = document.querySelector('.mobile-nav__close');
const header = document.querySelector('.header');
const heroVideo = document.querySelector('.hero__video');

let lastFocusedElement = null;

function openMobileNav() {
  if (!mobileNav || !burger) return;
  lastFocusedElement = document.activeElement;
  mobileNav.classList.add('is-open');
  burger.classList.add('is-open');
  burger.setAttribute('aria-expanded', 'true');
  mobileNav.removeAttribute('inert');
  mobileNav.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  const firstLink = mobileNav.querySelector('a, button');
  if (firstLink) firstLink.focus();
}

function closeMobileNav() {
  if (!mobileNav || !burger) return;
  if (!mobileNav.classList.contains('is-open')) return;
  mobileNav.classList.remove('is-open');
  burger.classList.remove('is-open');
  burger.setAttribute('aria-expanded', 'false');
  mobileNav.setAttribute('inert', '');
  mobileNav.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  if (lastFocusedElement && typeof lastFocusedElement.focus === 'function') {
    lastFocusedElement.focus();
  }
}

document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', (e) => {
    const id = link.getAttribute('href');
    if (id === '#' || id.length < 2) return;
    const target = document.querySelector(id);
    if (!target) return;
    e.preventDefault();

    closeMobileNav();

    const headerOffset = header ? header.offsetHeight : 80;
    const top = target.getBoundingClientRect().top + window.pageYOffset - headerOffset;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});

if (burger) {
  burger.addEventListener('click', () => {
    if (mobileNav.classList.contains('is-open')) closeMobileNav();
    else openMobileNav();
  });
}

if (mobileNavClose) mobileNavClose.addEventListener('click', closeMobileNav);

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeMobileNav();
  if (e.key === 'Tab' && mobileNav && mobileNav.classList.contains('is-open')) {
    const focusable = mobileNav.querySelectorAll('a, button');
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }
});

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isDesktop = window.matchMedia('(min-width: 821px) and (hover: hover)').matches;
const isMobile = window.matchMedia('(max-width: 820px)').matches;

if (isDesktop && !prefersReducedMotion) {
  const revealEls = document.querySelectorAll(
    '.portfolio__item, .service, .stat, .gift__inner, .cta__inner, .section-head'
  );

  revealEls.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(24px)';
    el.style.transition = 'opacity .7s ease, transform .7s ease';
  });

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  revealEls.forEach(el => io.observe(el));
}

if (heroVideo) {
  heroVideo.muted = true;
  heroVideo.setAttribute('playsinline', '');

  const tryPlay = () => {
    const p = heroVideo.play();
    if (p && typeof p.catch === 'function') p.catch(() => {});
  };

  const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  const saveData = conn && conn.saveData;
  const shouldPlay = !prefersReducedMotion && !isMobile && !saveData;

  if (shouldPlay) {
    if (heroVideo.readyState >= 2) tryPlay();
    heroVideo.addEventListener('loadeddata', tryPlay, { once: true });
    heroVideo.addEventListener('canplay', tryPlay, { once: true });

    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) tryPlay();
    });
  } else {
    heroVideo.removeAttribute('autoplay');
    heroVideo.pause();
  }
}

if (isDesktop && heroVideo && !prefersReducedMotion) {
  let ticking = false;
  const onScrollParallax = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const scrolled = window.pageYOffset;
      if (scrolled < window.innerHeight) {
        heroVideo.style.transform = `translateY(${scrolled * 0.15}px) scale(1.05)`;
      }
      ticking = false;
    });
  };
  window.addEventListener('scroll', onScrollParallax, { passive: true });
}

let headerTicking = false;

const onScrollHeader = () => {
  if (!header) return;
  if (headerTicking) return;
  headerTicking = true;
  requestAnimationFrame(() => {
    if (window.pageYOffset > 40) {
      header.classList.add('is-scrolled');
    } else {
      header.classList.remove('is-scrolled');
    }
    headerTicking = false;
  });
};

window.addEventListener('scroll', onScrollHeader, { passive: true });
onScrollHeader();

let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    if (window.innerWidth > 1100) closeMobileNav();
  }, 150);
});