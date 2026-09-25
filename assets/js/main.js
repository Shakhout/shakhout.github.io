import { initHeroCanvas } from './hero-canvas.js';

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

/* Hero: canvas, name scramble, typed roles
   ========================================================================== */

function initScramble() {
    const glyphs = '!<>-_\\/[]{}=+*^?#01';
    $$('[data-scramble]').forEach((el, index) => {
        const text = el.textContent;
        if (reducedMotion) {
            return;
        }
        const start = performance.now() + index * 250;
        const duration = 1100;

        function frame(now) {
            const progress = Math.max(0, Math.min(1, (now - start) / duration));
            const revealed = Math.floor(progress * text.length);
            el.textContent = [...text]
                .map((char, i) => {
                    if (i < revealed || char === ' ' || char === '.') {
                        return char;
                    }
                    return glyphs[Math.floor(Math.random() * glyphs.length)];
                })
                .join('');
            if (progress < 1) {
                requestAnimationFrame(frame);
            }
        }
        requestAnimationFrame(frame);
    });
}

function initTyped() {
    const el = $('.typed');
    if (!el) {
        return;
    }
    const words = JSON.parse(el.dataset.words);
    if (reducedMotion) {
        el.textContent = words[0];
        return;
    }

    let word = 0;
    let length = 0;
    let deleting = false;

    function tick() {
        const current = words[word];
        length += deleting ? -1 : 1;
        el.textContent = current.slice(0, length);

        let delay = deleting ? 35 : 75;
        if (!deleting && length === current.length) {
            deleting = true;
            delay = 1800;
        } else if (deleting && length === 0) {
            deleting = false;
            word = (word + 1) % words.length;
            delay = 350;
        }
        setTimeout(tick, delay);
    }
    setTimeout(tick, 1200);
}

/* Header: scrolled state, hide on scroll down, progress bar, active link
   ========================================================================== */

function initHeader() {
    const header = $('.site-header');
    const progress = $('.scroll-progress');
    let lastY = window.scrollY;
    let ticking = false;

    function onScroll() {
        const y = window.scrollY;
        const max = document.documentElement.scrollHeight - window.innerHeight;
        header.classList.toggle('is-scrolled', y > 20);
        header.classList.toggle('is-hidden', y > lastY && y > 400 && !document.body.classList.contains('is-locked'));
        progress.style.setProperty('--progress', max > 0 ? (y / max).toFixed(4) : 0);
        lastY = y;
        ticking = false;
    }

    window.addEventListener('scroll', () => {
        if (!ticking) {
            ticking = true;
            requestAnimationFrame(onScroll);
        }
    }, { passive: true });
    onScroll();

    const links = new Map($$('.nav__link').map((link) => [link.hash.slice(1), link]));
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                links.forEach((link, id) => link.classList.toggle('is-active', id === entry.target.id));
            }
        });
    }, { rootMargin: '-45% 0px -50% 0px' });
    links.forEach((_, id) => {
        const section = document.getElementById(id);
        if (section) {
            observer.observe(section);
        }
    });
}

function initMobileNav() {
    const toggle = $('.nav__toggle');
    const menu = $('#nav-menu');

    function setOpen(open) {
        toggle.setAttribute('aria-expanded', String(open));
        menu.classList.toggle('is-open', open);
        document.body.classList.toggle('is-locked', open);
    }

    toggle.addEventListener('click', () => setOpen(toggle.getAttribute('aria-expanded') !== 'true'));
    menu.addEventListener('click', (event) => {
        if (event.target.closest('a')) {
            setOpen(false);
        }
    });
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && menu.classList.contains('is-open')) {
            setOpen(false);
            toggle.focus();
        }
    });
    window.matchMedia('(min-width: 761px)').addEventListener('change', (event) => {
        if (event.matches) {
            setOpen(false);
        }
    });
}

/* Scroll-driven effects: reveal, counters, timeline progress
   ========================================================================== */

function initReveal() {
    const items = $$('[data-reveal]');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.1 });

    // Stagger siblings that enter together.
    items.forEach((item) => {
        const siblings = [...item.parentElement.children].filter((child) => child.hasAttribute('data-reveal'));
        const index = siblings.indexOf(item);
        if (siblings.length > 1) {
            item.style.setProperty('--delay', `${Math.min(index, 6) * 0.07}s`);
        }
        observer.observe(item);
    });
}

function initCounters() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) {
                return;
            }
            observer.unobserve(entry.target);
            const el = entry.target;
            const target = Number(el.dataset.count);
            if (reducedMotion) {
                return;
            }
            const start = performance.now();
            const duration = 1400;
            function frame(now) {
                const t = Math.min(1, (now - start) / duration);
                el.textContent = Math.round(target * (1 - Math.pow(1 - t, 3)));
                if (t < 1) {
                    requestAnimationFrame(frame);
                }
            }
            requestAnimationFrame(frame);
        });
    }, { threshold: 0.6 });
    $$('[data-count]').forEach((el) => observer.observe(el));
}

function initTimeline() {
    const timeline = $('.timeline');
    if (!timeline) {
        return;
    }
    let ticking = false;
    function update() {
        const rect = timeline.getBoundingClientRect();
        const anchor = window.innerHeight * 0.6;
        const progress = Math.max(0, Math.min(1, (anchor - rect.top) / rect.height));
        timeline.style.setProperty('--progress', progress.toFixed(4));
        ticking = false;
    }
    window.addEventListener('scroll', () => {
        if (!ticking) {
            ticking = true;
            requestAnimationFrame(update);
        }
    }, { passive: true });
    update();
}

/* Pointer effects: cursor glow, spotlight cards, tilt, magnetic buttons
   ========================================================================== */

function initPointerEffects() {
    if (!finePointer || reducedMotion) {
        return;
    }

    const glow = $('.cursor-glow');
    let glowX = 0;
    let glowY = 0;
    let targetX = 0;
    let targetY = 0;
    let glowFrame = 0;

    function animateGlow() {
        glowX += (targetX - glowX) * 0.12;
        glowY += (targetY - glowY) * 0.12;
        glow.style.setProperty('--x', `${glowX}px`);
        glow.style.setProperty('--y', `${glowY}px`);
        glowFrame = Math.abs(targetX - glowX) + Math.abs(targetY - glowY) > 0.5 ? requestAnimationFrame(animateGlow) : 0;
    }

    document.addEventListener('pointermove', (event) => {
        targetX = event.clientX;
        targetY = event.clientY;
        glow.classList.add('is-active');
        if (!glowFrame) {
            glowFrame = requestAnimationFrame(animateGlow);
        }
    }, { passive: true });
    document.documentElement.addEventListener('pointerleave', () => glow.classList.remove('is-active'));

    $$('[data-spotlight]').forEach((card) => {
        card.addEventListener('pointermove', (event) => {
            const rect = card.getBoundingClientRect();
            card.style.setProperty('--mx', `${event.clientX - rect.left}px`);
            card.style.setProperty('--my', `${event.clientY - rect.top}px`);
        });
    });

    $$('[data-tilt]').forEach((card) => {
        card.addEventListener('pointermove', (event) => {
            const rect = card.getBoundingClientRect();
            const x = (event.clientX - rect.left) / rect.width - 0.5;
            const y = (event.clientY - rect.top) / rect.height - 0.5;
            card.style.setProperty('--ry', `${x * 8}deg`);
            card.style.setProperty('--rx', `${y * -8}deg`);
        });
        card.addEventListener('pointerleave', () => {
            card.style.setProperty('--rx', '0deg');
            card.style.setProperty('--ry', '0deg');
        });
    });

    $$('[data-magnetic]').forEach((button) => {
        button.addEventListener('pointermove', (event) => {
            const rect = button.getBoundingClientRect();
            button.style.setProperty('--mx', `${(event.clientX - rect.left - rect.width / 2) * 0.25}px`);
            button.style.setProperty('--my', `${(event.clientY - rect.top - rect.height / 2) * 0.35}px`);
        });
        button.addEventListener('pointerleave', () => {
            button.style.setProperty('--mx', '0px');
            button.style.setProperty('--my', '0px');
        });
    });
}

/* Work: filters and lightbox
   ========================================================================== */

function initFilters() {
    const buttons = $$('.filter');
    const projects = $$('.project');
    const empty = $('.projects__empty');

    projects.forEach((project, index) => {
        project.style.viewTransitionName = `project-${index}`;
    });

    function apply(filter) {
        let visible = 0;
        projects.forEach((project) => {
            const match = filter === 'all' || project.dataset.groups.split(' ').includes(filter);
            project.hidden = !match;
            if (match) {
                visible++;
                project.classList.add('is-visible');
            }
        });
        empty.hidden = visible > 0;
    }

    buttons.forEach((button) => {
        button.addEventListener('click', () => {
            buttons.forEach((b) => b.setAttribute('aria-pressed', String(b === button)));
            const filter = button.dataset.filter;
            if (document.startViewTransition && !reducedMotion) {
                document.startViewTransition(() => apply(filter));
            } else {
                apply(filter);
            }
        });
    });
}

function initLightbox() {
    const dialog = $('.lightbox');
    if (!dialog || typeof dialog.showModal !== 'function') {
        return;
    }
    const img = $('.lightbox__img', dialog);
    const title = $('.lightbox__title', dialog);
    const desc = $('.lightbox__desc', dialog);
    const link = $('.lightbox__link', dialog);

    $$('.project__open').forEach((trigger) => {
        trigger.addEventListener('click', () => {
            const data = trigger.dataset;
            img.src = data.image;
            img.alt = `Screenshot of ${data.title}`;
            title.textContent = data.title;
            desc.textContent = data.desc;
            link.hidden = !data.url;
            if (data.url) {
                link.href = data.url;
            }
            dialog.showModal();
        });
    });

    $('[data-close]', dialog).addEventListener('click', () => dialog.close());
    // Close when clicking the backdrop (the dialog element itself, outside its content).
    dialog.addEventListener('click', (event) => {
        if (event.target === dialog) {
            dialog.close();
        }
    });
}

/* Contact: copy email
   ========================================================================== */

function initCopy() {
    const toast = $('.toast');
    let timer = 0;

    function showToast(message) {
        toast.textContent = message;
        toast.classList.add('is-visible');
        clearTimeout(timer);
        timer = setTimeout(() => toast.classList.remove('is-visible'), 2200);
    }

    $$('[data-copy]').forEach((button) => {
        button.addEventListener('click', async () => {
            try {
                await navigator.clipboard.writeText(button.dataset.copy);
                showToast('Email copied to clipboard');
            } catch {
                showToast(button.dataset.copy);
            }
        });
    });
}

/* Boot
   ========================================================================== */

const canvas = $('.hero__canvas');
if (canvas) {
    initHeroCanvas(canvas, { reducedMotion });
}
initScramble();
initTyped();
initHeader();
initMobileNav();
initReveal();
initCounters();
initTimeline();
initPointerEffects();
initFilters();
initLightbox();
initCopy();

$$('[data-year]').forEach((el) => {
    el.textContent = new Date().getFullYear();
});
