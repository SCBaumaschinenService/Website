/* ═══════════════════════════════════════════════════════════════
   SC BAUMASCHINEN SERVICE – MAIN JAVASCRIPT
   ═══════════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {
    initHeader();
    initMobileMenu();
    initRevealAnimations();
    initParticles();
    initCounterAnimation();
    initContactForm();
    initFileDrop();
    initSmoothScroll();
    initCookieConsent();
});

/* ── Header Scroll Effect ──────────────────────────────────── */
function initHeader() {
    const header = document.getElementById('header');
    let lastScroll = 0;

    window.addEventListener('scroll', () => {
        const currentScroll = window.scrollY;

        if (currentScroll > 60) {
            header.classList.add('header--scrolled');
        } else {
            header.classList.remove('header--scrolled');
        }

        lastScroll = currentScroll;
    }, { passive: true });
}

/* ── Mobile Menu ───────────────────────────────────────────── */
function initMobileMenu() {
    const burger = document.getElementById('burger');
    const nav = document.getElementById('nav');
    const navLinks = nav.querySelectorAll('.header__nav-link');

    burger.addEventListener('click', () => {
        burger.classList.toggle('header__burger--active');
        nav.classList.toggle('header__nav--open');
        document.body.style.overflow = nav.classList.contains('header__nav--open') ? 'hidden' : '';
    });

    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            burger.classList.remove('header__burger--active');
            nav.classList.remove('header__nav--open');
            document.body.style.overflow = '';
        });
    });
}

/* ── Reveal on Scroll ──────────────────────────────────────── */
function initRevealAnimations() {
    const elements = document.querySelectorAll('.reveal');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const delay = entry.target.dataset.delay;
                if (delay) {
                    entry.target.style.transitionDelay = `${delay * 0.06}s`;
                    // Clear delay after animation so it doesn't affect hover
                    setTimeout(() => {
                        entry.target.style.transitionDelay = '';
                    }, 600 + delay * 60);
                }
                entry.target.classList.add('reveal--visible');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -40px 0px'
    });

    elements.forEach(el => observer.observe(el));
}

/* ── Particle Animation (Sparks) ───────────────────────────── */
function initParticles() {
    const canvas = document.getElementById('particles');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let particles = [];
    let animationId;

    function resize() {
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
    }

    resize();
    window.addEventListener('resize', resize);

    class Particle {
        constructor() {
            this.reset();
        }

        reset() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 2 + 0.5;
            this.speedX = (Math.random() - 0.5) * 0.5;
            this.speedY = (Math.random() - 0.5) * 0.5;
            this.opacity = Math.random() * 0.5 + 0.1;
            this.color = Math.random() > 0.7
                ? `rgba(245, 124, 32, ${this.opacity})`
                : `rgba(255, 255, 255, ${this.opacity * 0.3})`;
        }

        update() {
            this.x += this.speedX;
            this.y += this.speedY;

            if (this.x < 0 || this.x > canvas.width ||
                this.y < 0 || this.y > canvas.height) {
                this.reset();
            }
        }

        draw() {
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    // Create particles
    const particleCount = Math.min(80, Math.floor(canvas.width * canvas.height / 15000));
    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        particles.forEach(p => {
            p.update();
            p.draw();
        });

        // Draw connections
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < 120) {
                    ctx.strokeStyle = `rgba(245, 124, 32, ${0.05 * (1 - dist / 120)})`;
                    ctx.lineWidth = 0.5;
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.stroke();
                }
            }
        }

        animationId = requestAnimationFrame(animate);
    }

    // Only animate when hero is visible
    const heroObserver = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) {
            animate();
        } else {
            cancelAnimationFrame(animationId);
        }
    }, { threshold: 0.1 });

    heroObserver.observe(document.getElementById('hero'));
}

/* ── Counter Animation ─────────────────────────────────────── */
function initCounterAnimation() {
    const counters = document.querySelectorAll('.stat__number');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    counters.forEach(counter => observer.observe(counter));
}

function animateCounter(element) {
    const target = parseInt(element.dataset.target);
    const duration = 2000;
    const start = performance.now();

    function update(now) {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);

        // Ease out cubic
        const eased = 1 - Math.pow(1 - progress, 3);

        element.textContent = Math.floor(eased * target);

        if (progress < 1) {
            requestAnimationFrame(update);
        } else {
            element.textContent = target;
        }
    }

    requestAnimationFrame(update);
}

/* ── Contact Form (Formspree) ──────────────────────────────── */
function initContactForm() {
    const contactForm = document.getElementById('contact-form');
    if (!contactForm) return;

    contactForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        const submitBtn = document.getElementById('submit-btn');
        const formSuccess = document.getElementById('form-success');

        submitBtn.classList.add('btn--loading');
        submitBtn.disabled = true;

        const formData = new FormData(contactForm);

        try {
            const response = await fetch(contactForm.action, {
                method: 'POST',
                body: formData,
                headers: { 'Accept': 'application/json' }
            });

            if (response.ok) {
                contactForm.style.display = 'none';
                formSuccess.style.display = 'flex';
            } else {
                throw new Error('Server error');
            }
        } catch (err) {
            submitBtn.classList.remove('btn--loading');
            submitBtn.disabled = false;
            alert('Fehler beim Senden. Bitte versuchen Sie es erneut oder kontaktieren Sie uns direkt per Telefon.');
        }
    });
}

/* ── File Drop Zone ────────────────────────────────────────── */
function initFileDrop() {
    const dropZone = document.getElementById('file-drop');
    if (!dropZone) return;

    const fileInput = dropZone.querySelector('.form-file__input');
    const label = dropZone.querySelector('.form-file__label span');

    ['dragenter', 'dragover'].forEach(evt => {
        dropZone.addEventListener(evt, (e) => {
            e.preventDefault();
            dropZone.classList.add('form-file--dragover');
        });
    });

    ['dragleave', 'drop'].forEach(evt => {
        dropZone.addEventListener(evt, (e) => {
            e.preventDefault();
            dropZone.classList.remove('form-file--dragover');
        });
    });

    dropZone.addEventListener('drop', (e) => {
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            fileInput.files = files;
            label.innerHTML = `<strong>${files[0].name}</strong> ausgewählt`;
        }
    });

    fileInput.addEventListener('change', () => {
        if (fileInput.files.length > 0) {
            label.innerHTML = `<strong>${fileInput.files[0].name}</strong> ausgewählt`;
        }
    });
}

/* ── Smooth Scroll ─────────────────────────────────────────── */
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const headerHeight = document.getElementById('header').offsetHeight;
                const targetPosition = target.getBoundingClientRect().top + window.scrollY - headerHeight;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

/* ── Cookie Consent ────────────────────────────────────────── */
function initCookieConsent() {
    const banner = document.getElementById('cookie-banner');
    const acceptBtn = document.getElementById('cookie-accept');
    const settingsBtn = document.getElementById('cookie-settings');

    if (!banner) return;

    // Check if user already made a choice
    const consent = localStorage.getItem('sc-cookie-consent');
    if (consent) {
        banner.classList.add('cookie-banner--hidden');
        return;
    }

    acceptBtn.addEventListener('click', () => {
        localStorage.setItem('sc-cookie-consent', 'all');
        banner.classList.add('cookie-banner--hidden');
    });

    settingsBtn.addEventListener('click', () => {
        localStorage.setItem('sc-cookie-consent', 'necessary');
        banner.classList.add('cookie-banner--hidden');
    });
}

