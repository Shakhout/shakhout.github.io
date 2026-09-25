/**
 * Interactive particle network for the hero background.
 *
 * - Particles drift and link to neighbours within LINK_DISTANCE.
 * - The pointer attracts nearby particles and draws accent links to them.
 * - Clicking/tapping sends out a shockwave that pushes particles away.
 * - Rendering pauses while the hero is off-screen or the tab is hidden.
 * - With reduced motion, a single static frame is drawn.
 */

const LINK_DISTANCE = 120;
const POINTER_RADIUS = 180;
const MAX_PARTICLES = 140;
const AREA_PER_PARTICLE = 9000;
const BASE_SPEED = 0.25;

export function initHeroCanvas(canvas, { reducedMotion = false } = {}) {
    const ctx = canvas.getContext('2d');
    if (!ctx) {
        return;
    }

    const accent = getComputedStyle(document.documentElement).getPropertyValue('--accent-rgb').trim() || '255, 69, 69';
    const pointer = { x: 0, y: 0, active: false };
    let particles = [];
    let pulses = [];
    let width = 0;
    let height = 0;
    let frameId = 0;
    let running = false;

    function createParticle() {
        const angle = Math.random() * Math.PI * 2;
        const speed = BASE_SPEED * (0.4 + Math.random());
        return {
            x: Math.random() * width,
            y: Math.random() * height,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            r: Math.random() * 1.4 + 0.6,
        };
    }

    function resize() {
        const rect = canvas.getBoundingClientRect();
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        width = rect.width;
        height = rect.height;
        canvas.width = Math.round(width * dpr);
        canvas.height = Math.round(height * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        const target = Math.min(MAX_PARTICLES, Math.round((width * height) / AREA_PER_PARTICLE));
        while (particles.length < target) {
            particles.push(createParticle());
        }
        particles.length = target;
        particles.forEach((p) => {
            p.x = Math.min(p.x, width);
            p.y = Math.min(p.y, height);
        });

        if (!running) {
            draw();
        }
    }

    function update() {
        for (const p of particles) {
            if (pointer.active) {
                const dx = pointer.x - p.x;
                const dy = pointer.y - p.y;
                const dist = Math.hypot(dx, dy);
                if (dist < POINTER_RADIUS && dist > 1) {
                    const force = (1 - dist / POINTER_RADIUS) * 0.02;
                    p.vx += dx / dist * force;
                    p.vy += dy / dist * force;
                }
            }

            for (const pulse of pulses) {
                const dx = p.x - pulse.x;
                const dy = p.y - pulse.y;
                const dist = Math.hypot(dx, dy);
                if (dist > 1 && Math.abs(dist - pulse.r) < 30) {
                    const force = pulse.strength * (1 - pulse.r / pulse.max);
                    p.vx += dx / dist * force;
                    p.vy += dy / dist * force;
                }
            }

            // Ease back toward cruising speed so the field never stalls or explodes.
            const speed = Math.hypot(p.vx, p.vy);
            if (speed > BASE_SPEED * 1.5) {
                p.vx *= 0.97;
                p.vy *= 0.97;
            } else if (speed < BASE_SPEED * 0.3) {
                p.vx *= 1.05;
                p.vy *= 1.05;
            }

            p.x += p.vx;
            p.y += p.vy;

            if (p.x < -10) p.x = width + 10;
            if (p.x > width + 10) p.x = -10;
            if (p.y < -10) p.y = height + 10;
            if (p.y > height + 10) p.y = -10;
        }

        for (const pulse of pulses) {
            pulse.r += 6;
        }
        pulses = pulses.filter((pulse) => pulse.r < pulse.max);
    }

    function draw() {
        ctx.clearRect(0, 0, width, height);

        // Links between neighbouring particles.
        ctx.lineWidth = 1;
        for (let i = 0; i < particles.length; i++) {
            const a = particles[i];
            for (let j = i + 1; j < particles.length; j++) {
                const b = particles[j];
                const dx = a.x - b.x;
                const dy = a.y - b.y;
                if (Math.abs(dx) > LINK_DISTANCE || Math.abs(dy) > LINK_DISTANCE) {
                    continue;
                }
                const dist = Math.hypot(dx, dy);
                if (dist < LINK_DISTANCE) {
                    ctx.strokeStyle = `rgba(255, 255, 255, ${(1 - dist / LINK_DISTANCE) * 0.14})`;
                    ctx.beginPath();
                    ctx.moveTo(a.x, a.y);
                    ctx.lineTo(b.x, b.y);
                    ctx.stroke();
                }
            }
        }

        // Accent links to the pointer, then the particles themselves.
        for (const p of particles) {
            let near = 0;
            if (pointer.active) {
                const dist = Math.hypot(pointer.x - p.x, pointer.y - p.y);
                if (dist < POINTER_RADIUS) {
                    near = 1 - dist / POINTER_RADIUS;
                    ctx.strokeStyle = `rgba(${accent}, ${near * 0.55})`;
                    ctx.beginPath();
                    ctx.moveTo(p.x, p.y);
                    ctx.lineTo(pointer.x, pointer.y);
                    ctx.stroke();
                }
            }
            ctx.fillStyle = near > 0 ? `rgba(${accent}, ${0.5 + near * 0.5})` : 'rgba(255, 255, 255, 0.55)';
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r + near * 1.2, 0, Math.PI * 2);
            ctx.fill();
        }

        for (const pulse of pulses) {
            ctx.strokeStyle = `rgba(${accent}, ${(1 - pulse.r / pulse.max) * 0.6})`;
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.arc(pulse.x, pulse.y, pulse.r, 0, Math.PI * 2);
            ctx.stroke();
        }
    }

    function loop() {
        update();
        draw();
        frameId = requestAnimationFrame(loop);
    }

    function start() {
        if (running || reducedMotion) {
            return;
        }
        running = true;
        frameId = requestAnimationFrame(loop);
    }

    function stop() {
        running = false;
        cancelAnimationFrame(frameId);
    }

    function toLocal(event) {
        const rect = canvas.getBoundingClientRect();
        return { x: event.clientX - rect.left, y: event.clientY - rect.top };
    }

    // Listen on the hero section so the pointer still registers over the text.
    const hero = canvas.parentElement;

    hero.addEventListener('pointermove', (event) => {
        Object.assign(pointer, toLocal(event), { active: true });
    });

    hero.addEventListener('pointerleave', () => {
        pointer.active = false;
    });

    hero.addEventListener('pointerdown', (event) => {
        if (reducedMotion || event.target.closest('a, button')) {
            return;
        }
        const { x, y } = toLocal(event);
        pulses.push({ x, y, r: 0, max: Math.max(width, height) * 0.45, strength: 1.4 });
    });

    new ResizeObserver(resize).observe(canvas);

    new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting && !document.hidden) {
            start();
        } else {
            stop();
        }
    }).observe(hero);

    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            stop();
        } else if (hero.getBoundingClientRect().bottom > 0) {
            start();
        }
    });

    resize();
}
