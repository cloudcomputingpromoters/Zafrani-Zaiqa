/* =====================================================
   Zafrani Zaiqa — Main JavaScript
   ===================================================== */

/* ---------- Navbar: transparent → scrolled ---------- */
(function initNavbar() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  function updateNav() {
    if (window.scrollY > 60) {
      navbar.classList.add('scrolled');
      navbar.classList.remove('transparent');
    } else {
      navbar.classList.remove('scrolled');
      navbar.classList.add('transparent');
    }
  }

  updateNav();
  window.addEventListener('scroll', updateNav, { passive: true });
})();

/* ---------- Mobile hamburger menu ---------- */
(function initMobileMenu() {
  const toggle   = document.getElementById('menuToggle');
  const mobileMenu = document.getElementById('mobileMenu');
  if (!toggle || !mobileMenu) return;

  toggle.addEventListener('click', () => {
    const isOpen = mobileMenu.classList.toggle('open');
    toggle.classList.toggle('open', isOpen);
    toggle.setAttribute('aria-expanded', isOpen);
  });

  // Close on link click
  mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      mobileMenu.classList.remove('open');
      toggle.classList.remove('open');
    });
  });
})();

/* ---------- Active nav link ---------- */
(function setActiveLink() {
  const path = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a, .mobile-menu a').forEach(a => {
    if (a.getAttribute('href') === path) {
      a.classList.add('active');
    }
  });
})();

/* ---------- Scroll-reveal animations ---------- */
(function initScrollReveal() {
  const elements = document.querySelectorAll('.animate-on-scroll, .stagger');
  if (!elements.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  elements.forEach(el => observer.observe(el));
})();

/* ---------- Menu category tabs (menu.html) ---------- */
(function initMenuTabs() {
  const tabs     = document.querySelectorAll('.tab-btn');
  const sections = document.querySelectorAll('.menu-section');
  if (!tabs.length) return;

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.target;

      tabs.forEach(t => t.classList.remove('active'));
      sections.forEach(s => s.classList.remove('active'));

      tab.classList.add('active');
      const section = document.getElementById(target);
      if (section) {
        section.classList.add('active');
        section.querySelectorAll('.stagger').forEach(el => {
          el.classList.add('visible');
        });
      }
    });
  });
})();

/* ---------- Catering discount calculator (catering.html) ---------- */
(function initDiscountCalc() {
  const form = document.getElementById('cateringForm');
  if (!form) return;

  const trayInputs = form.querySelectorAll('[data-price]');
  const subtotalEl = document.getElementById('calcSubtotal');
  const discountEl = document.getElementById('calcDiscount');
  const totalEl    = document.getElementById('calcTotal');
  const tierEl     = document.getElementById('discountTier');

  function recalc() {
    let subtotal   = 0;
    let fullTrays  = 0;

    trayInputs.forEach(input => {
      const qty   = parseInt(input.value) || 0;
      const price = parseFloat(input.dataset.price) || 0;
      const trayType = input.dataset.tray || '';
      subtotal += qty * price;
      if (trayType === 'full') fullTrays += qty;
    });

    let discountPct = 0;
    let tierText    = 'No discount applied';

    if (fullTrays >= 10) {
      discountPct = 20;
      tierText    = `🎉 ${fullTrays} Full Trays → 20% Off applied!`;
    } else if (fullTrays >= 5) {
      discountPct = 15;
      tierText    = `🎊 ${fullTrays} Full Trays → 15% Off applied!`;
    } else if (fullTrays >= 3) {
      discountPct = 10;
      tierText    = `✨ ${fullTrays} Full Trays → 10% Off applied!`;
    } else if (fullTrays > 0) {
      tierText = `Add ${3 - fullTrays} more Full Tray(s) to unlock 10% Off!`;
    }

    const discountAmt = subtotal * discountPct / 100;
    const total       = subtotal - discountAmt;

    if (subtotalEl) subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
    if (discountEl) discountEl.textContent = discountAmt > 0 ? `-$${discountAmt.toFixed(2)} (${discountPct}%)` : '$0.00';
    if (totalEl)    totalEl.textContent    = `$${total.toFixed(2)}`;
    if (tierEl)     tierEl.textContent     = tierText;

    if (tierEl) {
      tierEl.style.color = discountAmt > 0 ? 'var(--saffron)' : 'var(--text-muted)';
    }
  }

  trayInputs.forEach(input => input.addEventListener('input', recalc));
  recalc();
})();

/* ---------- Contact / Order form ---------- */
(function initContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  form.addEventListener('submit', function(e) {
    e.preventDefault();

    const btn = form.querySelector('[type="submit"]');
    const original = btn.textContent;
    btn.textContent = 'Sending…';
    btn.disabled = true;

    // Simulate async submission
    setTimeout(() => {
      btn.textContent = original;
      btn.disabled = false;
      showToast('✅ Your order request has been sent! We\'ll reach out within 24 hours.');
      form.reset();
    }, 1200);
  });
})();

/* ---------- Toast notification ---------- */
function showToast(message, duration = 4000) {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('hide');
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

/* ---------- Smooth scroll for anchor links ---------- */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

/* ---------- Lazy load images ---------- */
(function initLazyLoad() {
  const images = document.querySelectorAll('img[data-src]');
  if (!images.length) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src;
        img.removeAttribute('data-src');
        observer.unobserve(img);
      }
    });
  }, { rootMargin: '200px' });

  images.forEach(img => observer.observe(img));
})();
