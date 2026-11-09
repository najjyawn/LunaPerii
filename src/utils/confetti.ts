// Lightweight, crash-proof confetti burst that works in all browsers and sandboxed iframes

export function triggerConfetti(originX = 0.5, originY = 0.5) {
  try {
    if (typeof document === 'undefined') return;

    // Create 24 colorful falling confetti particles in DOM
    const colors = ['#fb7185', '#f472b6', '#c084fc', '#fde047', '#34d399', '#38bdf8'];
    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.left = '0';
    container.style.top = '0';
    container.style.width = '100vw';
    container.style.height = '100vh';
    container.style.pointerEvents = 'none';
    container.style.zIndex = '9999';
    container.style.overflow = 'hidden';

    document.body.appendChild(container);

    const startX = window.innerWidth * originX;
    const startY = window.innerHeight * originY;

    for (let i = 0; i < 28; i++) {
      const particle = document.createElement('div');
      const color = colors[i % colors.length];
      const size = Math.random() * 8 + 6;
      const angle = (Math.PI * 2 * i) / 28 + (Math.random() - 0.5) * 0.5;
      const velocity = Math.random() * 140 + 80;
      const endX = startX + Math.cos(angle) * velocity;
      const endY = startY + Math.sin(angle) * velocity + 150; // gravity down

      particle.style.position = 'absolute';
      particle.style.left = `${startX}px`;
      particle.style.top = `${startY}px`;
      particle.style.width = `${size}px`;
      particle.style.height = `${size * 0.7}px`;
      particle.style.backgroundColor = color;
      particle.style.borderRadius = i % 2 === 0 ? '50%' : '2px';
      particle.style.transform = `rotate(${Math.random() * 360}deg)`;
      particle.style.opacity = '1';
      particle.style.transition = 'all 0.9s cubic-bezier(0.25, 1, 0.5, 1)';

      container.appendChild(particle);

      // Trigger animation on next frame
      requestAnimationFrame(() => {
        particle.style.left = `${endX}px`;
        particle.style.top = `${endY}px`;
        particle.style.opacity = '0';
        particle.style.transform = `rotate(${Math.random() * 720}deg) scale(0.6)`;
      });
    }

    // Cleanup container after animation finishes
    setTimeout(() => {
      try {
        if (container.parentNode) {
          container.parentNode.removeChild(container);
        }
      } catch {
        // ignore
      }
    }, 1100);
  } catch (err) {
    console.warn('Confetti animation suppressed:', err);
  }
}
