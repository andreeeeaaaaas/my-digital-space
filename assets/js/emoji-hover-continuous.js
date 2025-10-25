(function() {
  // ===== CONTINUOUS EMOJI HOVER EFFECT =====
  // This version spawns emojis continuously while hovering (current behavior)
  
  const canvas = document.createElement('canvas');
  canvas.id = 'emojiHoverCanvas';
  canvas.style.cssText = 'position:fixed;top:0;left:0;pointer-events:none;z-index:1000;';
  document.body.appendChild(canvas);
  
  const ctx = canvas.getContext('2d');
  let bubbles = [];
  let animationId = null;
  let activeLink = null;
  let spawnTimer = 0;
  
  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);
  
  class Bubble {
    constructor(x, y, emoji, angle) {
      this.startX = x;
      this.startY = y;
      this.x = x;
      this.y = y;
      this.emoji = emoji;
      this.angle = angle;
      this.distance = 0;
      this.maxDistance = 80 + Math.random() * 40;
      this.speed = 2 + Math.random() * 2;
      this.scale = 0;
      this.maxScale = 0.8 + Math.random() * 0.4;
      this.alpha = 1;
      this.life = 0;
      this.maxLife = 60;
      this.rotation = Math.random() * Math.PI * 2;
      this.rotationSpeed = (Math.random() - 0.5) * 0.2;
    }
    
    update() {
      this.life++;
      if (this.scale < this.maxScale) this.scale += 0.08;
      if (this.distance < this.maxDistance) {
        this.distance += this.speed;
        this.speed *= 0.95;
      }
      this.rotation += this.rotationSpeed;
      if (this.life > this.maxLife * 0.7) {
        this.alpha = 1 - (this.life - this.maxLife * 0.7) / (this.maxLife * 0.3);
      }
      this.x = this.startX + Math.cos(this.angle) * this.distance;
      this.y = this.startY + Math.sin(this.angle) * this.distance;
      return this.life < this.maxLife;
    }
    
    draw() {
      ctx.save();
      ctx.globalAlpha = this.alpha;
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rotation);
      ctx.scale(this.scale, this.scale);
      ctx.font = '24px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(this.emoji, 0, 0);
      ctx.restore();
    }
  }
  
  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // CONTINUOUS SPAWNING: Keep spawning emojis while hovering
    if (activeLink) {
      spawnTimer++;
      if (spawnTimer >= 15) { // Spawn every 15 frames (about 4 times per second)
        const rect = activeLink.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const emoji = activeLink.dataset.emoji || '💌';
        
        const numBubbles = 2 + Math.floor(Math.random() * 2);
        for (let i = 0; i < numBubbles; i++) {
          const angle = Math.random() * Math.PI * 2;
          bubbles.push(new Bubble(centerX, centerY, emoji, angle));
        }
        spawnTimer = 0; // Reset timer to continue spawning
      }
    }
    
    bubbles = bubbles.filter(b => {
      const alive = b.update();
      if (alive) b.draw();
      return alive;
    });
    
    if (bubbles.length > 0 || activeLink) {
      animationId = requestAnimationFrame(animate);
    } else {
      animationId = null;
    }
  }
  
  function initEmojiHover() {
    const links = document.querySelectorAll('.emoji-hover');
    links.forEach(link => {
      link.addEventListener('mouseenter', e => {
        activeLink = e.target;
        spawnTimer = 15; // Start spawning immediately
        if (!animationId) animate();
      });
      
      link.addEventListener('mouseleave', () => {
        activeLink = null; // Stop spawning when mouse leaves
        spawnTimer = 0;
      });
    });
  }
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initEmojiHover);
  } else {
    initEmojiHover();
  }
})();
