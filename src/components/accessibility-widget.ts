import { t } from '../i18n';

export class AccessibilityWidget extends HTMLElement {
  constructor() {
    super();
    // No Shadow DOM so Shoelace autoloader can find and upgrade the elements
  }

  connectedCallback() {
    this.render();
    this.setupListeners();
  }

  render() {
    this.innerHTML = `
      <style>
        .a11y-floating-btn {
          position: fixed;
          bottom: 1.5rem;
          right: 1.5rem;
          z-index: 1000;
          width: 60px;
          height: 60px;
          background-color: var(--sl-color-primary-500, #3b82f6);
          color: white;
          border: none;
          border-radius: 50%;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.2s;
        }
        .a11y-floating-btn:hover {
          transform: scale(1.1);
        }
        .a11y-floating-btn svg {
          width: 30px;
          height: 30px;
          fill: currentColor;
        }
        
        .a11y-dialog-body {
          background: #ffffff;
          color: #334155;
          padding: 1rem;
        }
        .sl-theme-dark .a11y-dialog-body {
          background: #0f172a;
          color: #f8fafc;
        }

        .a11y-header-actions {
          display: flex;
          justify-content: flex-end;
          margin-bottom: 1rem;
        }
        
        .a11y-grid-container {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1rem;
        }
        @media (min-width: 600px) {
          .a11y-grid-container {
            grid-template-columns: 1fr 1fr;
          }
        }

        .a11y-card {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 0.5rem;
          padding: 1rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .sl-theme-dark .a11y-card {
          background: #1e293b;
          border-color: #334155;
        }

        .a11y-card-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 700;
          color: #1e293b;
          font-size: 1.1rem;
        }
        .sl-theme-dark .a11y-card-header {
          color: #f1f5f9;
        }
        
        .a11y-card-header svg {
          width: 20px;
          height: 20px;
          fill: var(--sl-color-primary-500, #3b82f6);
        }

        .a11y-controls-row {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .a11y-reset-btn {
          background: #e2e8f0;
          color: #475569;
          border: none;
          border-radius: 0.25rem;
          padding: 0.5rem 1rem;
          cursor: pointer;
          font-size: 0.875rem;
          font-weight: 500;
          transition: background 0.2s;
        }
        .a11y-reset-btn:hover {
          background: #cbd5e1;
        }
        .sl-theme-dark .a11y-reset-btn {
          background: #334155;
          color: #cbd5e1;
        }
        .sl-theme-dark .a11y-reset-btn:hover {
          background: #475569;
        }

        .a11y-slider-container {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          width: 100%;
          background: #f8fafc;
          padding: 0.5rem;
          border-radius: 0.25rem;
        }
        .sl-theme-dark .a11y-slider-container {
          background: #0f172a;
        }

        .a11y-slider-container input[type="range"] {
          flex: 1;
          accent-color: var(--sl-color-primary-500, #d946ef);
        }
        
        .a11y-font-list {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          background: #e2e8f0;
          border-radius: 0.5rem;
          overflow: hidden;
        }
        .sl-theme-dark .a11y-font-list {
          background: #334155;
        }
        
        .a11y-font-item {
          padding: 0.5rem;
          text-align: center;
          cursor: pointer;
          transition: background 0.2s;
        }
        .a11y-font-item:hover {
          background: rgba(0,0,0,0.05);
        }
        .sl-theme-dark .a11y-font-item:hover {
          background: rgba(255,255,255,0.05);
        }
        
        .a11y-color-picker {
          width: 60px;
          height: 35px;
          padding: 0;
          border: none;
          border-radius: 0.25rem;
          cursor: pointer;
        }
      </style>

      <button id="toggleBtn" class="a11y-floating-btn" aria-label="Acessibilidade">
        <svg viewBox="0 0 24 24"><path d="M12 2c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm9 7h-6v13h-2v-6h-2v6H9V9H3V7h18v2z"/></svg>
      </button>

      <sl-dialog label="Acessibilidade" id="a11yDialog" style="--width: 90vw; --max-width: 900px;">
        <div class="a11y-dialog-body">
          <div class="a11y-header-actions">
            <button id="resetAllBtn" class="a11y-reset-btn">Redefinir tudo</button>
          </div>
          
          <div class="a11y-grid-container">
            
            <!-- Card 1: Cor de fonte -->
            <div class="a11y-card">
              <div class="a11y-card-header">
                <svg viewBox="0 0 24 24"><path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9c.83 0 1.5-.67 1.5-1.5 0-.39-.15-.74-.39-1.01-.23-.26-.38-.61-.38-.99 0-.83.67-1.5 1.5-1.5H16c2.76 0 5-2.24 5-5 0-4.42-4.03-8-9-8z"/></svg>
                Cor de fonte
              </div>
              <div class="a11y-controls-row">
                <input type="color" id="fontColorPicker" class="a11y-color-picker" value="#000000">
                <button id="resetColorBtn" class="a11y-reset-btn">Redefinir</button>
              </div>
            </div>

            <!-- Card 2: Tipo de fonte -->
            <div class="a11y-card">
              <div class="a11y-card-header">
                <svg viewBox="0 0 24 24"><path d="M9 4v3h5v12h3V7h5V4H9zm-6 8h3v7h3v-7h3V9H3v3z"/></svg>
                Tipo de fonte
              </div>
              <div class="a11y-font-list" id="fontList">
                <div class="a11y-font-item" data-font="">Redefinir</div>
                <div class="a11y-font-item" style="font-family: serif;" data-font="serif">Serif</div>
                <div class="a11y-font-item" style="font-family: sans-serif;" data-font="sans-serif">Sans Serif</div>
                <div class="a11y-font-item" data-font="OpenDyslexic, sans-serif">Dislexia</div>
              </div>
            </div>

            <!-- Card 3: Font Kerning -->
            <div class="a11y-card">
              <div class="a11y-card-header">
                <svg viewBox="0 0 24 24"><path d="M12 2L4.5 20h2.5l2-5h6l2 5h2.5L12 2zm-1.88 11L12 5.67 13.88 13h-3.76z"/></svg>
                Font Kerning
              </div>
              <div class="a11y-controls-row">
                <button id="kerningBtn" class="a11y-reset-btn">Desligar</button>
              </div>
            </div>

            <!-- Card 4: Tamanho da fonte -->
            <div class="a11y-card">
              <div class="a11y-card-header">
                <svg viewBox="0 0 24 24"><path d="M2.5 4v3h5v12h3V7h5V4h-13zm19 5h-9v3h3v7h3v-7h3V9z"/></svg>
                Tamanho da fonte
              </div>
              <div class="a11y-slider-container">
                <button class="a11y-reset-btn" id="fontSizeMinus">-</button>
                <input type="range" id="fontSizeRange" min="80" max="200" value="100" step="10">
                <span id="fontSizeVal">1</span>
                <button class="a11y-reset-btn" id="fontSizePlus">+</button>
              </div>
              <button id="resetFontSizeBtn" class="a11y-reset-btn w-full">Redefinir</button>
            </div>

            <!-- Card 5: Visibilidade da Imagem -->
            <div class="a11y-card">
              <div class="a11y-card-header">
                <svg viewBox="0 0 24 24"><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/></svg>
                Visibilidade da Imagem
              </div>
              <div class="a11y-controls-row">
                <button id="hideImagesBtn" class="a11y-reset-btn">Ocultar Imagens</button>
              </div>
            </div>

            <!-- Card 6: Espaçamento entre letras -->
            <div class="a11y-card">
              <div class="a11y-card-header">
                <svg viewBox="0 0 24 24"><path d="M8 11h8v2H8zm13-4h-2V5h-2v2h-4V5H9v2H7V5H5v2H3v2h18V7zm0 8h-2v-2h-2v2h-4v-2H9v2H7v-2H5v2H3v2h18v-2z"/></svg>
                Espaçamento entre letras
              </div>
              <div class="a11y-slider-container">
                <button class="a11y-reset-btn" id="letterSpaceMinus">-</button>
                <input type="range" id="letterSpaceRange" min="0" max="10" value="0" step="1">
                <span id="letterSpaceVal">0</span>
                <button class="a11y-reset-btn" id="letterSpacePlus">+</button>
              </div>
              <button id="resetLetterSpaceBtn" class="a11y-reset-btn w-full">Redefinir</button>
            </div>

            <!-- Card 7: Altura da Linha -->
            <div class="a11y-card">
              <div class="a11y-card-header">
                <svg viewBox="0 0 24 24"><path d="M3 15h18v-2H3v2zm0 4h18v-2H3v2zm0-8h18V9H3v2zm0-6v2h18V5H3z"/></svg>
                Altura da Linha
              </div>
              <div class="a11y-slider-container">
                <button class="a11y-reset-btn" id="lineHeightMinus">-</button>
                <input type="range" id="lineHeightRange" min="10" max="30" value="15" step="1">
                <span id="lineHeightVal">1.5</span>
                <button class="a11y-reset-btn" id="lineHeightPlus">+</button>
              </div>
              <button id="resetLineHeightBtn" class="a11y-reset-btn w-full">Redefinir</button>
            </div>

            <!-- Card 8: Destaque do link -->
            <div class="a11y-card">
              <div class="a11y-card-header">
                <svg viewBox="0 0 24 24"><path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"/></svg>
                Destaque do link
              </div>
              <div class="a11y-controls-row">
                <button id="highlightLinkBtn" class="a11y-reset-btn">Habilitar</button>
              </div>
            </div>
            
          </div>
        </div>
      </sl-dialog>
    `;
  }

  setupListeners() {
    const root = this;
    const body = document.body;
    
    // Wait for sl-dialog to be upgraded before hooking up listeners
    customElements.whenDefined('sl-dialog').then(() => {
      const dialog = root.querySelector('#a11yDialog') as any;

      root.querySelector('#toggleBtn')!.addEventListener('click', () => {
        dialog.show();
      });

      // 1. Cor de fonte
      const colorPicker = root.querySelector('#fontColorPicker') as HTMLInputElement;
      colorPicker.addEventListener('input', (e: any) => {
        body.style.color = e.target.value;
      });
      root.querySelector('#resetColorBtn')!.addEventListener('click', () => {
        body.style.color = '';
        colorPicker.value = '#000000';
      });

      // 2. Tipo de fonte
      root.querySelector('#fontList')!.addEventListener('click', (e: any) => {
        if (e.target.classList.contains('a11y-font-item')) {
          body.style.fontFamily = e.target.dataset.font;
        }
      });

      // 3. Font Kerning
      let kerningOn = true;
      const kerningBtn = root.querySelector('#kerningBtn')!;
      kerningBtn.addEventListener('click', () => {
        kerningOn = !kerningOn;
        kerningBtn.textContent = kerningOn ? 'Desligar' : 'Ligar';
        body.style.fontKerning = kerningOn ? 'normal' : 'none';
      });

      // 4. Tamanho da fonte
      const fsRange = root.querySelector('#fontSizeRange') as HTMLInputElement;
      const fsVal = root.querySelector('#fontSizeVal')!;
      const updateFs = () => {
        const v = parseInt(fsRange.value);
        fsVal.textContent = (v / 100).toString();
        body.style.fontSize = `${v}%`;
      };
      fsRange.addEventListener('input', updateFs);
      root.querySelector('#fontSizeMinus')!.addEventListener('click', () => { fsRange.stepDown(); updateFs(); });
      root.querySelector('#fontSizePlus')!.addEventListener('click', () => { fsRange.stepUp(); updateFs(); });
      root.querySelector('#resetFontSizeBtn')!.addEventListener('click', () => {
        fsRange.value = '100'; updateFs(); body.style.fontSize = '';
      });

      // 5. Visibilidade da Imagem
      let imagesVisible = true;
      const hideImgBtn = root.querySelector('#hideImagesBtn')!;
      hideImgBtn.addEventListener('click', () => {
        imagesVisible = !imagesVisible;
        hideImgBtn.textContent = imagesVisible ? 'Ocultar Imagens' : 'Mostrar Imagens';
        document.querySelectorAll('img, video').forEach(el => {
          (el as HTMLElement).style.visibility = imagesVisible ? 'visible' : 'hidden';
        });
      });

      // 6. Espaçamento entre letras
      const lsRange = root.querySelector('#letterSpaceRange') as HTMLInputElement;
      const lsVal = root.querySelector('#letterSpaceVal')!;
      const updateLs = () => {
        lsVal.textContent = lsRange.value;
        body.style.letterSpacing = `${lsRange.value}px`;
      };
      lsRange.addEventListener('input', updateLs);
      root.querySelector('#letterSpaceMinus')!.addEventListener('click', () => { lsRange.stepDown(); updateLs(); });
      root.querySelector('#letterSpacePlus')!.addEventListener('click', () => { lsRange.stepUp(); updateLs(); });
      root.querySelector('#resetLetterSpaceBtn')!.addEventListener('click', () => {
        lsRange.value = '0'; updateLs(); body.style.letterSpacing = '';
      });

      // 7. Altura da Linha
      const lhRange = root.querySelector('#lineHeightRange') as HTMLInputElement;
      const lhVal = root.querySelector('#lineHeightVal')!;
      const updateLh = () => {
        const v = parseInt(lhRange.value) / 10;
        lhVal.textContent = v.toString();
        body.style.lineHeight = v.toString();
      };
      lhRange.addEventListener('input', updateLh);
      root.querySelector('#lineHeightMinus')!.addEventListener('click', () => { lhRange.stepDown(); updateLh(); });
      root.querySelector('#lineHeightPlus')!.addEventListener('click', () => { lhRange.stepUp(); updateLh(); });
      root.querySelector('#resetLineHeightBtn')!.addEventListener('click', () => {
        lhRange.value = '15'; updateLh(); body.style.lineHeight = '';
      });

      // 8. Destaque do link
      let linksHighlighted = false;
      const hlBtn = root.querySelector('#highlightLinkBtn')!;
      hlBtn.addEventListener('click', () => {
        linksHighlighted = !linksHighlighted;
        hlBtn.textContent = linksHighlighted ? 'Desabilitar' : 'Habilitar';
        if (linksHighlighted) {
          document.documentElement.style.setProperty('--sl-color-primary-500', '#facc15'); // yellow
        } else {
          document.documentElement.style.removeProperty('--sl-color-primary-500');
        }
      });

      // Reset All
      root.querySelector('#resetAllBtn')!.addEventListener('click', () => {
        (root.querySelector('#resetColorBtn') as HTMLElement).click();
        body.style.fontFamily = '';
        if (!kerningOn) (kerningBtn as HTMLElement).click();
        (root.querySelector('#resetFontSizeBtn') as HTMLElement).click();
        if (!imagesVisible) (hideImgBtn as HTMLElement).click();
        (root.querySelector('#resetLetterSpaceBtn') as HTMLElement).click();
        (root.querySelector('#resetLineHeightBtn') as HTMLElement).click();
        if (linksHighlighted) (hlBtn as HTMLElement).click();
      });
    });
}
}

customElements.define('accessibility-widget', AccessibilityWidget);
