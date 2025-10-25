(function() {
  // ===== ONE-TIME EMOJI HOVER EFFECT =====
  // This version spawns emojis only once when hovering starts
  
  const canvas = document.createElement('canvas');
  canvas.id = 'emojiHoverCanvas';
  canvas.style.cssText = 'position:fixed;top:0;left:0;pointer-events:none;z-index:1000;';
  document.body.appendChild(canvas);
  
  const ctx = canvas.getContext('2d');
  let bubbles = [];
  let animationId = null;
  let activeLink = null;
  let hasSpawned = false; // Track if emojis have been spawned for current hover
  
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
    
    // ONE-TIME SPAWNING: Only spawn emojis once when hovering starts
    if (activeLink && !hasSpawned) {
      const rect = activeLink.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const emoji = activeLink.dataset.emoji || '💌';
      
      // Spawn more bubbles for a more dramatic one-time effect
      const numBubbles = 3 + Math.floor(Math.random() * 4); // Choose how many bubbles, with some randomisation
      for (let i = 0; i < numBubbles; i++) {
        const angle = Math.random() * Math.PI * 2;
        bubbles.push(new Bubble(centerX, centerY, emoji, angle));
      }
      hasSpawned = true; // Mark as spawned to prevent more spawning
    }
    
    bubbles = bubbles.filter(b => {
      const alive = b.update();
      if (alive) b.draw();
      return alive;
    });
    
    // Continue animation as long as there are bubbles to animate
    if (bubbles.length > 0) {
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
        hasSpawned = false; // Reset spawn flag for new hover
        if (!animationId) animate();
      });
      
      link.addEventListener('mouseleave', () => {
        activeLink = null;
        hasSpawned = false; // Reset spawn flag
        // Note: Don't stop animation here - let existing bubbles finish their animation
      });
    });
  }
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initEmojiHover);
  } else {
    initEmojiHover();
  }
})();
