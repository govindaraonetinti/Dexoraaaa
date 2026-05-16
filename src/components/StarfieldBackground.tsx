import { useEffect, useRef } from "react";

const StarfieldBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;

    canvas.width = width;
    canvas.height = height;

    const particles: Particle[] = [];

    // more tiny particles
    const particleCount = 550;

    class Particle {
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      opacity: number;

      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;

        // VERY SMALL particles
        this.size = Math.random() * 1.2 + 0.1;

        // faster floating movement
        this.speedX = (Math.random() - 0.5) * 1.2;
        this.speedY = (Math.random() - 0.5) * 1.2;

        // different brightness
        this.opacity = Math.random() * 0.7 + 0.2;
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;

        // loop movement
        if (this.x > width) this.x = 0;
        if (this.x < 0) this.x = width;
        if (this.y > height) this.y = 0;
        if (this.y < 0) this.y = height;
      }

      draw() {
        if (!ctx) return;

        // tiny soft glow
        ctx.beginPath();
        ctx.fillStyle = `rgba(255,255,255,${
          this.opacity * 0.08
        })`;

        ctx.arc(
          this.x,
          this.y,
          this.size * 2.5,
          0,
          Math.PI * 2
        );

        ctx.fill();

        // tiny bright star
        ctx.beginPath();
        ctx.fillStyle = `rgba(255,255,255,${this.opacity})`;

        ctx.arc(
          this.x,
          this.y,
          this.size,
          0,
          Math.PI * 2
        );

        ctx.fill();
      }
    }

    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      particles.forEach((particle) => {
        particle.update();
        particle.draw();
      });

      requestAnimationFrame(animate);
    };

    animate();

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;

      canvas.width = width;
      canvas.height = height;
    };

    window.addEventListener("resize", resize);

    return () => {
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
    />
  );
};

export default StarfieldBackground;