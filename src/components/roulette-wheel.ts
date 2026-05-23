export class RouletteWheel extends HTMLElement {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private files: any[] = [];
  private currentAngle = 0;
  private isSpinning = false;
  private colors = ['#f43f5e', '#ec4899', '#d946ef', '#a855f7', '#8b5cf6', '#6366f1', '#3b82f6', '#0ea5e9', '#06b6d4', '#14b8a6', '#10b981', '#22c55e'];

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.canvas = document.createElement('canvas');
    this.canvas.width = 500;
    this.canvas.height = 500;
    this.ctx = this.canvas.getContext('2d')!;
  }

  connectedCallback() {
    this.shadowRoot!.innerHTML = `
      <style>
        :host {
          display: block;
          position: relative;
          margin: 20px 0;
        }
        .wheel-container {
          position: relative;
          width: 100%;
          max-width: 500px;
          margin: 0 auto;
        }
        canvas {
          max-width: 100%;
          height: auto;
          border-radius: 50%;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
        }
        .pointer {
          position: absolute;
          top: -20px;
          left: 50%;
          transform: translateX(-50%);
          width: 0;
          height: 0;
          border-left: 20px solid transparent;
          border-right: 20px solid transparent;
          border-top: 40px solid #fff;
          z-index: 10;
          filter: drop-shadow(0 4px 6px rgba(0,0,0,0.5));
        }
      </style>
      <div class="wheel-container">
        <div class="pointer"></div>
      </div>
    `;
    this.shadowRoot!.querySelector('.wheel-container')!.appendChild(this.canvas);
    this.drawWheel();
  }

  setFiles(files: any[]) {
    this.files = files;
    this.drawWheel();
  }

  drawWheel() {
    if (this.files.length === 0) return;
    const width = this.canvas.width;
    const height = this.canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(centerX, centerY) - 10;
    const sliceAngle = (2 * Math.PI) / this.files.length;

    this.ctx.clearRect(0, 0, width, height);

    for (let i = 0; i < this.files.length; i++) {
      const angle = this.currentAngle + i * sliceAngle;
      
      this.ctx.beginPath();
      this.ctx.moveTo(centerX, centerY);
      this.ctx.arc(centerX, centerY, radius, angle, angle + sliceAngle);
      this.ctx.closePath();
      this.ctx.fillStyle = this.colors[i % this.colors.length];
      this.ctx.fill();
      this.ctx.strokeStyle = 'rgba(0,0,0,0.2)';
      this.ctx.stroke();

      this.ctx.save();
      this.ctx.translate(centerX, centerY);
      this.ctx.rotate(angle + sliceAngle / 2);
      this.ctx.textAlign = 'right';
      this.ctx.fillStyle = '#ffffff';
      this.ctx.font = 'bold 16px sans-serif';
      let displayName = this.files[i].name;
      if (displayName.length > 20) displayName = displayName.substring(0, 17) + '...';
      this.ctx.fillText(displayName, radius - 20, 5);
      this.ctx.restore();
    }

    this.ctx.beginPath();
    this.ctx.arc(centerX, centerY, 30, 0, 2 * Math.PI);
    this.ctx.fillStyle = '#1e293b';
    this.ctx.fill();
    this.ctx.lineWidth = 4;
    this.ctx.strokeStyle = '#ffffff';
    this.ctx.stroke();
    
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = '24px sans-serif';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText('★', centerX, centerY);
  }

  spin(): Promise<any> {
    return new Promise((resolve) => {
      if (this.isSpinning || this.files.length === 0) return;
      this.isSpinning = true;

      const randomBuffer = new Uint32Array(2);
      window.crypto.getRandomValues(randomBuffer);
      const randFloat1 = randomBuffer[0] / (0xffffffff + 1);
      const randFloat2 = randomBuffer[1] / (0xffffffff + 1);

      let velocity = 0.3 + (randFloat1 * 0.4); 
      const friction = 0.001 + (randFloat2 * 0.0005); 

      const animate = () => {
        this.currentAngle += velocity;
        velocity -= friction;

        this.drawWheel();

        if (velocity > 0) {
          requestAnimationFrame(animate);
        } else {
          this.isSpinning = false;
          resolve(this.determineWinner());
        }
      };

      requestAnimationFrame(animate);
    });
  }

  determineWinner() {
    const sliceAngle = (2 * Math.PI) / this.files.length;
    const normalizedAngle = this.currentAngle % (2 * Math.PI);
    let pointerAngle = (3 * Math.PI / 2) - normalizedAngle;
    if (pointerAngle < 0) pointerAngle += 2 * Math.PI;
    
    const winnerIndex = Math.floor(pointerAngle / sliceAngle);
    return this.files[winnerIndex];
  }
}

customElements.define('roulette-wheel', RouletteWheel);
