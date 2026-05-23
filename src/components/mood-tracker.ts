import { t } from '../i18n';

export class MoodTracker extends HTMLElement {
  private selectedMood: number = 4; // Default to 4 (🙂)
  private selectedTags: Set<string> = new Set();
  
  private popularTags = [
    'anatomia', 'cores', 'sombreamento', 'perspectiva', 
    'esboço', 'lineart', 'composição', 'gesto'
  ];

  constructor() {
    super();
    // Light DOM to allow Shoelace elements to render and inherit styles
  }

  connectedCallback() {
    this.render();
    this.setupListeners();
    this.updateTagsList();
  }

  render() {
    this.innerHTML = `
      <style>
        .mood-tracker-container {
          width: 100%;
          max-width: 640px;
          margin: 0 auto;
          text-align: left;
          padding: 24px;
          border-radius: 16px;
        }

        .mood-tracker-title {
          font-size: 24px;
          font-weight: 800;
          text-align: center;
          margin-bottom: 8px;
          color: var(--sl-color-neutral-950);
        }
        .sl-theme-dark .mood-tracker-title {
          color: var(--sl-color-neutral-0);
        }

        .mood-tracker-desc {
          font-size: 15px;
          color: var(--sl-color-neutral-500);
          text-align: center;
          margin-bottom: 32px;
        }

        .form-section {
          margin-bottom: 28px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .form-section-title {
          font-size: 16px;
          font-weight: 600;
          color: var(--sl-color-primary-600);
        }
        .sl-theme-dark .form-section-title {
          color: var(--sl-color-primary-300);
        }

        /* Practice toggle styling */
        .practice-switch-container {
          background: var(--glass-bg);
          border: 1px solid var(--glass-border);
          padding: 16px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        /* Mood selection grid */
        .mood-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 12px;
        }

        .mood-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 16px 8px;
          border-radius: 12px;
          background: var(--glass-bg);
          border: 1px solid var(--glass-border);
          cursor: pointer;
          transition: all 0.25s ease;
          color: var(--text-color);
        }

        .mood-btn:hover {
          transform: translateY(-4px);
          background: rgba(255, 255, 255, 0.08);
          border-color: var(--sl-color-primary-400);
        }

        .mood-btn.active[data-mood="1"] { border-color: #ef4444; background: rgba(239, 68, 68, 0.12); box-shadow: 0 0 12px rgba(239, 68, 68, 0.25); }
        .mood-btn.active[data-mood="2"] { border-color: #f97316; background: rgba(249, 115, 22, 0.12); box-shadow: 0 0 12px rgba(249, 115, 22, 0.25); }
        .mood-btn.active[data-mood="3"] { border-color: #eab308; background: rgba(234, 179, 8, 0.12); box-shadow: 0 0 12px rgba(234, 179, 8, 0.25); }
        .mood-btn.active[data-mood="4"] { border-color: #22c55e; background: rgba(34, 197, 94, 0.12); box-shadow: 0 0 12px rgba(34, 197, 94, 0.25); }
        .mood-btn.active[data-mood="5"] { border-color: #06b6d4; background: rgba(6, 182, 212, 0.12); box-shadow: 0 0 12px rgba(6, 182, 212, 0.25); }

        .mood-emoji {
          font-size: 32px;
          margin-bottom: 6px;
          transition: transform 0.2s ease;
        }

        .mood-btn:hover .mood-emoji {
          transform: scale(1.15);
        }

        .mood-label {
          font-size: 12px;
          font-weight: 600;
          opacity: 0.8;
          text-align: center;
        }

        /* Tags section */
        .tags-wrapper {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .tags-container {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          min-height: 38px;
          padding: 8px 12px;
          border-radius: 8px;
          background: rgba(0, 0, 0, 0.15);
          border: 1px solid var(--glass-border);
        }

        .tags-container:empty::before {
          content: 'Nenhuma tag selecionada ainda...';
          color: var(--sl-color-neutral-400);
          font-size: 14px;
          font-style: italic;
          display: flex;
          align-items: center;
        }

        .popular-tags-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }

        .popular-tag-chip {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--glass-border);
          border-radius: 20px;
          padding: 4px 12px;
          font-size: 13px;
          cursor: pointer;
          transition: all 0.2s;
          color: var(--text-color);
        }

        .popular-tag-chip:hover {
          background: rgba(255, 255, 255, 0.15);
          border-color: var(--sl-color-primary-400);
        }

        .popular-tag-chip.active {
          background: var(--sl-color-primary-500);
          color: white;
          border-color: var(--sl-color-primary-400);
        }

        .custom-tag-input-group {
          display: flex;
          gap: 8px;
        }

        .custom-tag-input-group sl-input {
          flex: 1;
        }

        .submit-btn-container {
          margin-top: 16px;
        }
      </style>

      <div class="mood-tracker-container">
        <h2 class="mood-tracker-title">${t('sessionComplete')}</h2>
        <p class="mood-tracker-desc">${t('reflectionDesc')}</p>

        <form id="moodForm" style="display: flex; flex-direction: column; gap: 8px;">
          <!-- Goal / Objective -->
          <div class="form-section">
            <span class="form-section-title">Meu objetivo hoje era:</span>
            <sl-input id="goalInput" placeholder="Ex: Praticar perspectiva, estudar cores..." clearable></sl-input>
          </div>

          <!-- 1. Practice check-in -->
          <div class="form-section">
            <span class="form-section-title">${t('practicedQuestion')}</span>
            <div class="practice-switch-container">
              <span style="font-weight: 500;">Pratiquei minhas habilidades</span>
              <sl-switch id="practicedSwitch" checked size="large"></sl-switch>
            </div>
          </div>

          <!-- 2. Mood check-in -->
          <div class="form-section">
            <span class="form-section-title">${t('moodQuestion')}</span>
            <div class="mood-grid">
              <button type="button" class="mood-btn ${this.selectedMood === 1 ? 'active' : ''}" data-mood="1">
                <span class="mood-emoji">😢</span>
                <span class="mood-label">Muito Ruim</span>
              </button>
              <button type="button" class="mood-btn ${this.selectedMood === 2 ? 'active' : ''}" data-mood="2">
                <span class="mood-emoji">😕</span>
                <span class="mood-label">Ruim</span>
              </button>
              <button type="button" class="mood-btn ${this.selectedMood === 3 ? 'active' : ''}" data-mood="3">
                <span class="mood-emoji">😐</span>
                <span class="mood-label">Ok</span>
              </button>
              <button type="button" class="mood-btn ${this.selectedMood === 4 ? 'active' : ''}" data-mood="4">
                <span class="mood-emoji">🙂</span>
                <span class="mood-label">Bom</span>
              </button>
              <button type="button" class="mood-btn ${this.selectedMood === 5 ? 'active' : ''}" data-mood="5">
                <span class="mood-emoji">🤩</span>
                <span class="mood-label">Excelente</span>
              </button>
            </div>
          </div>

          <!-- 3. Tags check-in -->
          <div class="form-section">
            <span class="form-section-title">${t('tagsQuestion')}</span>
            
            <div class="tags-wrapper">
              <!-- Selected tags container -->
              <div class="tags-container" id="selectedTagsContainer"></div>

              <!-- Predefined Quick Tags -->
              <div style="font-size: 13px; font-weight: 600; opacity: 0.7; margin-top: 4px;">Temas frequentes:</div>
              <div class="popular-tags-grid" id="popularTagsGrid">
                ${this.popularTags.map(tag => `
                  <button type="button" class="popular-tag-chip" data-tag="${tag}">+ ${tag}</button>
                `).join('')}
              </div>

              <!-- Custom tag input -->
              <div class="custom-tag-input-group">
                <sl-input 
                  id="customTagInput" 
                  placeholder="Ou digite outra tag..." 
                  pill 
                  clearable
                ></sl-input>
                <sl-button id="addTagBtn" variant="neutral" pill>Adicionar</sl-button>
              </div>
            </div>
          </div>

          <!-- Submit -->
          <div class="submit-btn-container">
            <sl-button type="submit" variant="primary" size="large" pill style="width: 100%;">
              ${t('saveAndAnalytics')}
            </sl-button>
          </div>
        </form>
      </div>
    `;
  }

  setupListeners() {
    const form = this.querySelector('#moodForm') as HTMLFormElement;
    const moodBtns = this.querySelectorAll('.mood-btn');
    const popularChips = this.querySelectorAll('.popular-tag-chip');
    const customInput = this.querySelector('#customTagInput') as any;
    const addBtn = this.querySelector('#addTagBtn') as any;
    const practicedSwitch = this.querySelector('#practicedSwitch') as any;
    const goalInput = this.querySelector('#goalInput') as any;

    // Mood button clicks
    moodBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        moodBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.selectedMood = parseInt(btn.getAttribute('data-mood') || '4');
      });
    });

    // Popular tag chips click
    popularChips.forEach(chip => {
      chip.addEventListener('click', () => {
        const tag = chip.getAttribute('data-tag') || '';
        if (this.selectedTags.has(tag)) {
          this.selectedTags.delete(tag);
          chip.classList.remove('active');
        } else {
          this.selectedTags.add(tag);
          chip.classList.add('active');
        }
        this.updateTagsList();
      });
    });

    // Custom tag entry
    const handleAddCustomTag = () => {
      const val = customInput.value.trim().toLowerCase();
      if (val) {
        // Split by commas if they entered multiple
        const parts = val.split(',').map((p: string) => p.trim()).filter((p: string) => p.length > 0);
        parts.forEach((part: string) => {
          this.selectedTags.add(part);
          // Highlight popular chip if it matches
          const matchingChip = this.querySelector(`.popular-tag-chip[data-tag="${part}"]`);
          if (matchingChip) {
            matchingChip.classList.add('active');
          }
        });
        customInput.value = '';
        this.updateTagsList();
      }
    };

    addBtn.addEventListener('click', handleAddCustomTag);
    customInput.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleAddCustomTag();
      }
    });

    // Form submission
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const detail = {
        goal: goalInput.value.trim(),
        practiced: practicedSwitch.checked,
        tags: Array.from(this.selectedTags),
        mood: this.selectedMood
      };

      this.dispatchEvent(new CustomEvent('mood-submitted', {
        detail,
        bubbles: true,
        composed: true
      }));
    });
  }

  updateTagsList() {
    const container = this.querySelector('#selectedTagsContainer')!;
    container.innerHTML = '';

    this.selectedTags.forEach(tag => {
      const slTag = document.createElement('sl-tag');
      slTag.setAttribute('variant', 'primary');
      slTag.setAttribute('size', 'medium');
      slTag.setAttribute('pill', '');
      slTag.setAttribute('removable', '');
      slTag.textContent = tag;
      slTag.style.margin = '2px';

      slTag.addEventListener('sl-remove', () => {
        this.selectedTags.delete(tag);
        // Unhighlight popular chip if it matches
        const matchingChip = this.querySelector(`.popular-tag-chip[data-tag="${tag}"]`);
        if (matchingChip) {
          matchingChip.classList.remove('active');
        }
        this.updateTagsList();
      });

      container.appendChild(slTag);
    });
  }
}

customElements.define('mood-tracker', MoodTracker);
