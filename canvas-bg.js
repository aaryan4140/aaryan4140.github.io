/**
 * Minimalist Animated Canvas Background
 * Clean, lightweight, low-overhead ambient particle lattice with interactive mouse spotlight.
 * Minimalist design inspired by Linear, Stripe, and Apple.
 */

export class MinimalistCanvas {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;

    this.ctx = this.canvas.getContext('2d');
    this.particles = [];
    this.mouse = { x: -1000, y: -1000, targetX: -1000, targetY: -1000, radius: 160 };
    this.maxParticles = 65;
    this.connectionDistance = 130;
    this.animId = null;

    this.init();
  }

  init() {
    this.resize();
    this.createParticles();
    this.bindEvents();
    this.animate();
  }

  resize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);

    this.canvas.width = this.width * this.dpr;
    this.canvas.height = this.height * this.dpr;
    this.canvas.style.width = `${this.width}px`;
    this.canvas.style.height = `${this.height}px`;

    this.ctx.scale(this.dpr, this.dpr);
  }

  createParticles() {
    this.particles = [];
    const count = Math.min(Math.floor((this.width * this.height) / 22000), this.maxParticles);

    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        vx: (Math.random() - 0.5) * 0.45,
        vy: (Math.random() - 0.5) * 0.45,
        baseRadius: Math.random() * 1.5 + 1.0,
        radius: Math.random() * 1.5 + 1.0,
        alpha: Math.random() * 0.35 + 0.15
      });
    }
  }

  bindEvents() {
    window.addEventListener('resize', () => {
      this.resize();
      this.createParticles();
    });

    window.addEventListener('mousemove', (e) => {
      this.mouse.targetX = e.clientX;
      this.mouse.targetY = e.clientY;
    });

    window.addEventListener('mouseleave', () => {
      this.mouse.targetX = -1000;
      this.mouse.targetY = -1000;
    });
  }

  animate() {
    this.animId = requestAnimationFrame(() => this.animate());

    // Smooth mouse interpolation
    this.mouse.x += (this.mouse.targetX - this.mouse.x) * 0.08;
    this.mouse.y += (this.mouse.targetY - this.mouse.y) * 0.08;

    this.ctx.clearRect(0, 0, this.width, this.height);

    // Subtle ambient gradient glow under cursor
    if (this.mouse.x > -500) {
      const gradient = this.ctx.createRadialGradient(
        this.mouse.x, this.mouse.y, 0,
        this.mouse.x, this.mouse.y, 450
      );
      gradient.addColorStop(0, 'rgba(59, 130, 246, 0.045)');
      gradient.addColorStop(0.5, 'rgba(99, 102, 241, 0.015)');
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
      this.ctx.fillStyle = gradient;
      this.ctx.fillRect(0, 0, this.width, this.height);
    }

    // Update and draw particles
    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];

      p.x += p.vx;
      p.y += p.vy;

      // Wrap edges cleanly
      if (p.x < 0) p.x = this.width;
      if (p.x > this.width) p.x = 0;
      if (p.y < 0) p.y = this.height;
      if (p.y > this.height) p.y = 0;

      // Interaction with mouse cursor
      const dx = this.mouse.x - p.x;
      const dy = this.mouse.y - p.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < this.mouse.radius) {
        const factor = 1 - dist / this.mouse.radius;
        p.radius = p.baseRadius + factor * 2;
        p.alpha = 0.55 + factor * 0.35;
      } else {
        p.radius += (p.baseRadius - p.radius) * 0.08;
        p.alpha += (0.25 - p.alpha) * 0.05;
      }

      // Draw particle dot
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      this.ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha})`;
      this.ctx.fill();

      // Draw delicate connection lines
      for (let j = i + 1; j < this.particles.length; j++) {
        const p2 = this.particles[j];
        const lineDx = p.x - p2.x;
        const lineDy = p.y - p2.y;
        const lineDist = Math.sqrt(lineDx * lineDx + lineDy * lineDy);

        if (lineDist < this.connectionDistance) {
          const lineAlpha = (1 - lineDist / this.connectionDistance) * 0.12;
          this.ctx.beginPath();
          this.ctx.moveTo(p.x, p.y);
          this.ctx.lineTo(p2.x, p2.y);
          this.ctx.strokeStyle = `rgba(255, 255, 255, ${lineAlpha})`;
          this.ctx.lineWidth = 0.75;
          this.ctx.stroke();
        }
      }
    }
  }

  destroy() {
    if (this.animId) cancelAnimationFrame(this.animId);
  }
}
