/* ============================================================
   FERREIRA & ASSOCIADOS — JAVASCRIPT PRINCIPAL
   ============================================================ */

'use strict';

/* ============================================================
   1. PRELOADER
   ============================================================ */
window.addEventListener('load', () => {
  const preloader = document.getElementById('preloader');
  if (!preloader) return;

  setTimeout(() => {
    preloader.classList.add('hidden');
    // Dispara animações do hero após preloader
    document.querySelectorAll('.reveal-hero').forEach(el => {
      setTimeout(() => el.classList.add('visible'), 100);
    });
  }, 1800);
});

/* ============================================================
   2. NAVBAR — scroll effect + active link + mobile menu
   ============================================================ */
const navbar    = document.getElementById('navbar');
const hamburger = document.getElementById('hamburger');
const navLinks  = document.getElementById('navLinks');
const allNavLinks = document.querySelectorAll('.nav-link');

// Scroll effect
window.addEventListener('scroll', () => {
  if (window.scrollY > 60) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
  updateActiveLink();
  toggleBackToTop();
}, { passive: true });

// Mobile menu toggle
hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('open');
  navLinks.classList.toggle('open');
  document.body.style.overflow = navLinks.classList.contains('open') ? 'hidden' : '';
});

// Close menu on link click
allNavLinks.forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('open');
    navLinks.classList.remove('open');
    document.body.style.overflow = '';
  });
});

// Close menu on outside click
document.addEventListener('click', (e) => {
  if (!navbar.contains(e.target) && navLinks.classList.contains('open')) {
    hamburger.classList.remove('open');
    navLinks.classList.remove('open');
    document.body.style.overflow = '';
  }
});

// Active link based on scroll position
function updateActiveLink() {
  const sections = document.querySelectorAll('section[id]');
  let currentSection = '';

  sections.forEach(section => {
    const sectionTop    = section.offsetTop - 120;
    const sectionBottom = sectionTop + section.offsetHeight;
    if (window.scrollY >= sectionTop && window.scrollY < sectionBottom) {
      currentSection = section.getAttribute('id');
    }
  });

  allNavLinks.forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href') === `#${currentSection}`) {
      link.classList.add('active');
    }
  });
}

/* ============================================================
   3. SCROLL REVEAL — Intersection Observer
   ============================================================ */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right').forEach(el => {
  revealObserver.observe(el);
});

/* ============================================================
   4. CONTADOR ANIMADO
   ============================================================ */
function animateCounter(el) {
  const target   = parseInt(el.getAttribute('data-target'), 10);
  const duration = 2000;
  const step     = target / (duration / 16);
  let current    = 0;

  const timer = setInterval(() => {
    current += step;
    if (current >= target) {
      current = target;
      clearInterval(timer);
    }
    el.textContent = Math.floor(current).toLocaleString('pt-BR');
  }, 16);
}

const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.querySelectorAll('.numero-value').forEach(animateCounter);
      counterObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.4 });

const numerosSection = document.getElementById('numeros');
if (numerosSection) counterObserver.observe(numerosSection);

/* ============================================================
   5. CARROSSEL DE PROFISSIONAIS
   ============================================================ */
(function initCarousel() {
  const track    = document.getElementById('carouselTrack');
  const prevBtn  = document.getElementById('prevBtn');
  const nextBtn  = document.getElementById('nextBtn');
  const dotsWrap = document.getElementById('carouselDots');

  if (!track) return;

  const cards       = Array.from(track.children);
  const totalCards  = cards.length;
  let currentIndex  = 0;
  let autoPlayTimer = null;
  let isDragging    = false;
  let startX        = 0;
  let dragOffset    = 0;

  // Calcula quantos cards são visíveis
  function getVisibleCount() {
    const width = window.innerWidth;
    if (width <= 768)  return 1;
    if (width <= 1024) return 2;
    return 3;
  }

  // Cria dots
  function buildDots() {
    dotsWrap.innerHTML = '';
    const visibleCount = getVisibleCount();
    const totalSlides  = Math.ceil(totalCards / visibleCount);

    for (let i = 0; i < totalSlides; i++) {
      const dot = document.createElement('button');
      dot.className = 'carousel-dot' + (i === 0 ? ' active' : '');
      dot.setAttribute('aria-label', `Slide ${i + 1}`);
      dot.addEventListener('click', () => goTo(i * visibleCount));
      dotsWrap.appendChild(dot);
    }
  }

  // Atualiza posição
  function updateCarousel(animate = true) {
    const visibleCount = getVisibleCount();
    const cardWidth    = track.parentElement.offsetWidth;
    const gap          = 24; // 1.5rem
    const singleWidth  = (cardWidth - gap * (visibleCount - 1)) / visibleCount;

    // Garante que o índice não ultrapasse o limite
    const maxIndex = Math.max(0, totalCards - visibleCount);
    currentIndex   = Math.min(Math.max(currentIndex, 0), maxIndex);

    const offset = currentIndex * (singleWidth + gap);

    track.style.transition = animate ? 'transform .5s cubic-bezier(.4,0,.2,1)' : 'none';
    track.style.transform  = `translateX(-${offset}px)`;

    // Atualiza largura dos cards
    cards.forEach(card => {
      card.style.flex     = `0 0 ${singleWidth}px`;
      card.style.minWidth = `${singleWidth}px`;
    });

    // Atualiza botões
    prevBtn.disabled = currentIndex === 0;
    nextBtn.disabled = currentIndex >= maxIndex;

    // Atualiza dots
    const dotEls    = dotsWrap.querySelectorAll('.carousel-dot');
    const dotIndex  = Math.floor(currentIndex / visibleCount);
    dotEls.forEach((d, i) => d.classList.toggle('active', i === dotIndex));
  }

  function goTo(index) {
    currentIndex = index;
    updateCarousel();
  }

  function next() {
    const visibleCount = getVisibleCount();
    const maxIndex     = Math.max(0, totalCards - visibleCount);
    if (currentIndex >= maxIndex) {
      currentIndex = 0;
    } else {
      currentIndex = Math.min(currentIndex + visibleCount, maxIndex);
    }
    updateCarousel();
  }

  function prev() {
    const visibleCount = getVisibleCount();
    currentIndex = Math.max(currentIndex - visibleCount, 0);
    updateCarousel();
  }

  // Auto play
  function startAutoPlay() {
    stopAutoPlay();
    autoPlayTimer = setInterval(next, 4000);
  }
  function stopAutoPlay() {
    clearInterval(autoPlayTimer);
  }

  // Botões
  nextBtn.addEventListener('click', () => { next(); startAutoPlay(); });
  prevBtn.addEventListener('click', () => { prev(); startAutoPlay(); });

  // Pause on hover
  track.parentElement.addEventListener('mouseenter', stopAutoPlay);
  track.parentElement.addEventListener('mouseleave', startAutoPlay);

  // Touch / drag support
  track.addEventListener('touchstart', (e) => {
    isDragging = true;
    startX     = e.touches[0].clientX;
    stopAutoPlay();
  }, { passive: true });

  track.addEventListener('touchmove', (e) => {
    if (!isDragging) return;
    dragOffset = e.touches[0].clientX - startX;
  }, { passive: true });

  track.addEventListener('touchend', () => {
    if (!isDragging) return;
    isDragging = false;
    if (dragOffset < -50) next();
    else if (dragOffset > 50) prev();
    dragOffset = 0;
    startAutoPlay();
  });

  // Mouse drag
  track.addEventListener('mousedown', (e) => {
    isDragging = true;
    startX     = e.clientX;
    track.style.cursor = 'grabbing';
    stopAutoPlay();
  });
  document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    dragOffset = e.clientX - startX;
  });
  document.addEventListener('mouseup', () => {
    if (!isDragging) return;
    isDragging = false;
    track.style.cursor = '';
    if (dragOffset < -50) next();
    else if (dragOffset > 50) prev();
    dragOffset = 0;
    startAutoPlay();
  });

  // Resize
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      buildDots();
      updateCarousel(false);
    }, 150);
  });

  // Init
  buildDots();
  updateCarousel(false);
  startAutoPlay();
})();

/* ============================================================
   6. FORMULÁRIO DE CONTATO
   ============================================================ */
const contatoForm = document.getElementById('contatoForm');
const formSuccess = document.getElementById('formSuccess');

if (contatoForm) {
  contatoForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const btn = contatoForm.querySelector('button[type="submit"]');
    const originalText = btn.innerHTML;

    // Loading state
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';
    btn.disabled  = true;

    // Simula envio (substituir por fetch real se necessário)
    setTimeout(() => {
      btn.innerHTML = originalText;
      btn.disabled  = false;
      contatoForm.reset();
      formSuccess.classList.add('show');

      setTimeout(() => formSuccess.classList.remove('show'), 6000);
    }, 1800);
  });
}

/* ============================================================
   7. BACK TO TOP
   ============================================================ */
const backToTop = document.getElementById('backToTop');

function toggleBackToTop() {
  if (!backToTop) return;
  if (window.scrollY > 400) {
    backToTop.classList.add('visible');
  } else {
    backToTop.classList.remove('visible');
  }
}

if (backToTop) {
  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* ============================================================
   8. SMOOTH SCROLL para links internos
   ============================================================ */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', (e) => {
    const href = anchor.getAttribute('href');
    if (href === '#') return;

    const target = document.querySelector(href);
    if (!target) return;

    e.preventDefault();
    const offset = navbar ? navbar.offsetHeight + 16 : 80;
    const top    = target.getBoundingClientRect().top + window.scrollY - offset;

    window.scrollTo({ top, behavior: 'smooth' });
  });
});

/* ============================================================
   9. MÁSCARA DE TELEFONE
   ============================================================ */
const telefoneInput = document.getElementById('telefone');
if (telefoneInput) {
  telefoneInput.addEventListener('input', (e) => {
    let v = e.target.value.replace(/\D/g, '').slice(0, 11);
    if (v.length > 10) {
      v = v.replace(/^(\d{2})(\d{5})(\d{4}).*/, '($1) $2-$3');
    } else if (v.length > 6) {
      v = v.replace(/^(\d{2})(\d{4})(\d{0,4}).*/, '($1) $2-$3');
    } else if (v.length > 2) {
      v = v.replace(/^(\d{2})(\d{0,5})/, '($1) $2');
    } else if (v.length > 0) {
      v = v.replace(/^(\d{0,2})/, '($1');
    }
    e.target.value = v;
  });
}

/* ============================================================
   10. PARALLAX SUTIL no Hero
   ============================================================ */
const heroBg = document.querySelector('.hero-bg');
if (heroBg && window.innerWidth > 768) {
  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    heroBg.style.transform = `translateY(${scrollY * 0.3}px) scale(1)`;
  }, { passive: true });
}

/* ============================================================
   11. CURSOR GLOW (desktop only)
   ============================================================ */
if (window.innerWidth > 1024) {
  const glow = document.createElement('div');
  glow.style.cssText = `
    position: fixed; pointer-events: none; z-index: 9998;
    width: 300px; height: 300px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(141, 76, 201, 0.06) 0%, transparent 70%);
    transform: translate(-50%, -50%);
    transition: left .03s ease, top .03s ease;
  `;
  document.body.appendChild(glow);

  document.addEventListener('mousemove', (e) => {
    glow.style.left = `${e.clientX}px`;
    glow.style.top  = `${e.clientY}px`;
  });
}

/* ============================================================
   12. INICIALIZAÇÃO GERAL
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  updateActiveLink();
  toggleBackToTop();
});