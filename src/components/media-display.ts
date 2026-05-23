import { t } from '../i18n';
import { getState } from '../state';

export class MediaDisplay extends HTMLElement {
  private timerInterval: any = null;
  private startTime = 0;
  private timeSpentMs = 0;
  private isPaused = false;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();
  }

  setMedia(file: any) {
    this.timeSpentMs = 0;
    this.render(file);
  }

  formatTime(ms: number) {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
    const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
    const seconds = String(totalSeconds % 60).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  }

  render(file?: any) {
    if (!file) {
      this.shadowRoot!.innerHTML = ``;
      return;
    }

    const isVideo = file.type === 'video';
    
    this.shadowRoot!.innerHTML = `
      <style>
        :host {
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 100%;
        }
        .media-container {
          position: relative;
          width: 100%;
          max-width: 800px;
          border-radius: 16px;
          overflow: hidden;
          background: rgba(0,0,0,0.5);
          display: flex;
          justify-content: center;
          margin-bottom: 24px;
          border: 1px solid #334155;
          visibility: var(--media-visibility, visible);
        }
        img, video {
          max-width: 100%;
          max-height: 60vh;
          object-fit: contain;
        }
        .controls {
          background: rgba(30, 41, 59, 0.5);
          padding: 24px;
          border-radius: 16px;
          border: 1px solid #334155;
          text-align: center;
          width: 100%;
          max-width: 400px;
        }
        .timer {
          font-size: 48px;
          font-family: monospace;
          color: #38bdf8;
          margin-bottom: 24px;
        }
        button {
          width: 100%;
          padding: 12px;
          border-radius: 8px;
          font-weight: bold;
          font-size: 16px;
          cursor: pointer;
          border: none;
        }
        .btn-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .btn-start {
          background: #3b82f6;
          color: white;
        }
        .btn-pause {
          background: #eab308;
          color: white;
          display: none;
        }
        .btn-resume {
          background: #10b981;
          color: white;
          display: none;
        }
        .btn-stop {
          background: #ef4444;
          color: white;
          display: none;
        }
      </style>
      
      <h2 style="color: #38bdf8; font-size: 24px; margin-bottom: 16px;">${t('yourSelection')}</h2>
      
      <div class="media-container">
        ${isVideo 
          ? `<video controls autoplay loop><source src="${file.url}" type="${file.mimeType || 'video/mp4'}"></video>`
          : `<img src="${file.url}" alt="${file.name}">`
        }
      </div>

      <div class="controls">
        <div class="timer" id="timerDisplay">00:00:00</div>
        <div class="btn-group">
          <button class="btn-start" id="startBtn">${t('startSession')}</button>
          <button class="btn-pause" id="pauseBtn">${t('pauseSession')}</button>
          <button class="btn-resume" id="resumeBtn">${t('resumeSession')}</button>
          <button class="btn-stop" id="stopBtn">${t('stopSession')}</button>
        </div>
      </div>
    `;

    this.setupListeners();
  }

  setupListeners() {
    const shadow = this.shadowRoot!;
    const startBtn = shadow.getElementById('startBtn');
    const stopBtn = shadow.getElementById('stopBtn');
    const pauseBtn = shadow.getElementById('pauseBtn');
    const resumeBtn = shadow.getElementById('resumeBtn');
    const timerDisplay = shadow.getElementById('timerDisplay');

    if (startBtn && stopBtn && pauseBtn && resumeBtn && timerDisplay) {
      const updateTimer = () => {
        this.timerInterval = setInterval(() => {
          const elapsed = this.timeSpentMs + (Date.now() - this.startTime);
          timerDisplay.textContent = this.formatTime(elapsed);
        }, 1000);
      };

      startBtn.addEventListener('click', () => {
        this.startTime = Date.now();
        this.timeSpentMs = 0;
        this.isPaused = false;
        
        startBtn.style.display = 'none';
        stopBtn.style.display = 'block';
        
        if (getState().mode === 'Estudo') {
          pauseBtn.style.display = 'block';
        }
        
        updateTimer();
      });

      pauseBtn.addEventListener('click', () => {
        clearInterval(this.timerInterval);
        this.timeSpentMs += Date.now() - this.startTime;
        this.isPaused = true;
        
        pauseBtn.style.display = 'none';
        resumeBtn.style.display = 'block';
      });

      resumeBtn.addEventListener('click', () => {
        this.startTime = Date.now();
        this.isPaused = false;
        
        resumeBtn.style.display = 'none';
        pauseBtn.style.display = 'block';
        
        updateTimer();
      });

      stopBtn.addEventListener('click', () => {
        clearInterval(this.timerInterval);
        if (!this.isPaused) {
          this.timeSpentMs += Date.now() - this.startTime;
        }
        
        this.dispatchEvent(new CustomEvent('session-complete', {
          detail: { timeSpentMs: this.timeSpentMs },
          bubbles: true,
          composed: true
        }));
      });
    }
  }
}

customElements.define('media-display', MediaDisplay);
