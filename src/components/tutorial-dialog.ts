export class TutorialDialog extends HTMLElement {
  private currentStep = 0;
  private totalSteps = 4;

  constructor() {
    super();
    // Light DOM to allow Shoelace styling and autoloader
  }

  connectedCallback() {
    this.render();
    this.setupListeners();
    
    // Auto-open on first load
    const seen = localStorage.getItem('rc-tutorial-seen');
    if (!seen) {
      setTimeout(() => {
        this.show();
      }, 800); // Small delay for nice loading experience
    }
  }

  show() {
    this.currentStep = 0;
    this.updateStepContent();
    const dialog = this.querySelector('#tutorialDialogEl') as any;
    if (dialog) {
      dialog.show();
    }
  }

  render() {
    this.innerHTML = `
      <style>
        .tutorial-dialog-body {
          display: flex;
          flex-direction: column;
          gap: 20px;
          padding: 8px 4px;
        }

        .tutorial-step-card {
          min-height: 180px;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          justify-content: center;
          padding: 24px;
          border-radius: 12px;
          background: var(--sl-color-neutral-0);
          border: 1px solid var(--sl-color-neutral-200);
          transition: all 0.3s ease;
        }

        .sl-theme-dark .tutorial-step-card {
          background: var(--sl-color-neutral-950);
          border-color: var(--sl-color-neutral-800);
        }

        .tutorial-step-title {
          font-size: 20px;
          font-weight: 800;
          color: var(--sl-color-neutral-900);
          margin-bottom: 16px;
          letter-spacing: -0.5px;
        }
        .sl-theme-dark .tutorial-step-title {
          color: var(--sl-color-neutral-50);
        }

        .tutorial-step-text {
          font-size: 15px;
          line-height: 1.6;
          color: var(--sl-color-neutral-800);
        }
        .sl-theme-dark .tutorial-step-text {
          color: var(--sl-color-neutral-200);
        }

        .tutorial-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 16px;
        }

        .tutorial-stepper {
          display: flex;
          gap: 8px;
        }

        .tutorial-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--sl-color-neutral-300);
          transition: all 0.3s;
        }

        .sl-theme-dark .tutorial-dot {
          background: var(--sl-color-neutral-700);
        }

        .tutorial-dot.active {
          background: var(--sl-color-primary-600);
          transform: scale(1.3);
        }
        .sl-theme-dark .tutorial-dot.active {
          background: var(--sl-color-primary-400);
        }

        .tutorial-nav-buttons {
          display: flex;
          gap: 12px;
        }

        .highlight-accent {
          color: var(--sl-color-amber-800);
          font-weight: 700;
        }
        .sl-theme-dark .highlight-accent {
          color: var(--sl-color-amber-400);
        }

        code.mock-badge {
          background: var(--sl-color-neutral-100);
          color: var(--sl-color-neutral-900);
          padding: 2px 6px;
          border-radius: 4px;
          font-weight: 600;
          font-family: monospace;
          border: 1px solid var(--sl-color-neutral-300);
        }
        .sl-theme-dark code.mock-badge {
          background: var(--sl-color-neutral-800);
          color: var(--sl-color-neutral-100);
          border-color: var(--sl-color-neutral-700);
        }
      </style>

      <sl-dialog id="tutorialDialogEl" label="Como Funciona?" style="--width: 90vw; --max-width: 500px;">
        <div class="tutorial-dialog-body">
          <div class="tutorial-step-card" id="stepCard">
            <!-- Step content dynamically rendered here -->
          </div>

          <div class="tutorial-footer">
            <!-- Steps Progress Dots -->
            <div class="tutorial-stepper" id="stepperContainer">
              <span class="tutorial-dot active"></span>
              <span class="tutorial-dot"></span>
              <span class="tutorial-dot"></span>
              <span class="tutorial-dot"></span>
            </div>

            <!-- Stepper Actions -->
            <div class="tutorial-nav-buttons">
              <sl-button size="small" id="prevBtn" outline pill disabled>Voltar</sl-button>
              <sl-button size="small" id="nextBtn" variant="primary" pill>Avançar</sl-button>
            </div>
          </div>
        </div>
      </sl-dialog>
    `;
  }

  updateStepContent() {
    const card = this.querySelector('#stepCard')!;
    const prevBtn = this.querySelector('#prevBtn') as any;
    const nextBtn = this.querySelector('#nextBtn') as any;
    const dots = this.querySelectorAll('.tutorial-dot');

    // Update Dots
    dots.forEach((dot, idx) => {
      if (idx === this.currentStep) {
        dot.classList.add('active');
      } else {
        dot.classList.remove('active');
      }
    });

    // Update buttons
    prevBtn.disabled = this.currentStep === 0;
    if (this.currentStep === this.totalSteps - 1) {
      nextBtn.textContent = 'Concluir';
      nextBtn.setAttribute('variant', 'success');
    } else {
      nextBtn.textContent = 'Avançar';
      nextBtn.setAttribute('variant', 'primary');
    }

    // Step descriptions
    const steps = [
      {
        title: '1. Conecte seu Drive',
        text: `Cole o link público de uma pasta do Google Drive com referências de imagens ou vídeos.<br><br>
               <span class="highlight-accent">Atenção:</span> A pasta do Google Drive deve ser pública 
               (configurada para "Qualquer pessoa com o link pode ler") para que o aplicativo consiga acessar as mídias. 
               Se preferir testar imediatamente sem conectar um link, digite <code class="mock-badge">mock</code>.`
      },
      {
        title: '2. Gire a Roleta',
        text: `Uma vez importada a pasta, você verá a Roleta Criativa pronta para uso.<br><br>
               Clique em "Girar a Roleta" para sortear aleatoriamente um arquivo de referência artística 
               para o seu estudo, ajudando a evitar a paralisia de escolha e estimulando o seu improviso.`
      },
      {
        title: '3. Foco e Prática',
        text: `A referência selecionada será exibida junto com um temporizador de sessão.<br><br>
               Clique em "Iniciar Sessão" e dedique esse tempo para desenhar, pintar ou estudar 
               a pose ou cor sorteada. Ao terminar a prática, clique em "Parar Sessão".`
      },
      {
        title: '4. Evolução e Ofensiva',
        text: `Se estiver no Modo Estudo (após realizar o login), você poderá registrar tags da habilidade praticada 
               (como anatomia ou gestual) e o seu nível de humor pós-sessão.<br><br>
               Isso alimenta o seu Painel de Analytics com métricas de ofensivas diárias, 
               gráficos de humor e estatísticas de seus estudos.`
      }
    ];

    const cur = steps[this.currentStep];
    card.innerHTML = `
      <h3 class="tutorial-step-title">${cur.title}</h3>
      <p class="tutorial-step-text">${cur.text}</p>
    `;
  }

  setupListeners() {
    const prevBtn = this.querySelector('#prevBtn')!;
    const nextBtn = this.querySelector('#nextBtn')!;
    const dialog = this.querySelector('#tutorialDialogEl') as any;

    prevBtn.addEventListener('click', () => {
      if (this.currentStep > 0) {
        this.currentStep--;
        this.updateStepContent();
      }
    });

    nextBtn.addEventListener('click', () => {
      if (this.currentStep < this.totalSteps - 1) {
        this.currentStep++;
        this.updateStepContent();
      } else {
        // Finished
        localStorage.setItem('rc-tutorial-seen', 'true');
        if (dialog) dialog.hide();
      }
    });

    dialog.addEventListener('sl-after-hide', () => {
      // Ensure that closing via overlay/close button also records it as seen
      localStorage.setItem('rc-tutorial-seen', 'true');
    });
  }
}

customElements.define('tutorial-dialog', TutorialDialog);
