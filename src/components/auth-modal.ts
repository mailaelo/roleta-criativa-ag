import { t } from '../i18n';
import { setMode, setUser, getState, subscribe } from '../state';
import { sendLoginLink, logout, loginWithGoogle } from '../firebase';

export class AuthModal extends HTMLElement {
  private unsubscribe: (() => void) | null = null;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.unsubscribe = subscribe(() => {
      this.render();
      this.setupListeners();
    });
  }

  disconnectedCallback() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }

  render() {
    const { userEmail, mode } = getState();
    
    this.shadowRoot!.innerHTML = `
      <style>
        :host {
          display: block;
          margin-bottom: 24px;
        }
        .container {
          background: rgba(30, 41, 59, 0.7);
          border: 1px solid #334155;
          border-radius: 16px;
          padding: 24px;
          text-align: center;
        }
        .mode-selector {
          display: flex;
          gap: 16px;
          justify-content: center;
          margin-bottom: 24px;
        }
        .mode-btn {
          flex: 1;
          padding: 12px;
          border-radius: 8px;
          border: 1px solid #475569;
          background: #0f172a;
          color: #cbd5e1;
          cursor: pointer;
          transition: all 0.2s;
        }
        .mode-btn.active {
          border-color: #3b82f6;
          background: #1e3a8a;
          color: white;
        }
        .auth-form {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        input {
          padding: 12px;
          border-radius: 8px;
          border: 1px solid #475569;
          background: #0f172a;
          color: white;
        }
        button.primary {
          padding: 12px;
          border-radius: 8px;
          border: none;
          background: #3b82f6;
          color: white;
          font-weight: bold;
          cursor: pointer;
        }
        .status {
          margin-top: 12px;
          font-size: 14px;
          color: #94a3b8;
        }
      </style>
      <div class="container">
        <div class="mode-selector">
          <button class="mode-btn ${mode === 'Hobbie' ? 'active' : ''}" id="hobbieBtn">
            <strong>${t('hobbieMode')}</strong><br>
            <small>${t('hobbieDesc')}</small>
          </button>
          <button class="mode-btn ${mode === 'Estudo' ? 'active' : ''}" id="estudoBtn">
            <strong>${t('estudoMode')}</strong><br>
            <small>${t('estudoDesc')}</small>
          </button>
        </div>
        
        <div id="authArea">
          ${mode === 'Hobbie' ? `
            <p class="status">Você está no Modo Hobbie.</p>
          ` : userEmail ? `
            <p class="status">Logado como: <strong>${userEmail}</strong></p>
            <button class="primary" id="logoutBtn">${t('logout')}</button>
          ` : `
            <button type="button" class="primary" id="googleLoginBtn" style="background:#ea4335; margin-bottom:8px; width:100%; display:flex; align-items:center; justify-content:center; gap:8px;">
              <sl-icon name="google"></sl-icon> Entrar com Google
            </button>
            <div style="display:flex;align-items:center;margin:12px 0;opacity:0.5;font-size:12px;">
              <hr style="flex:1;border-color:#475569;"><span style="padding:0 8px;">ou</span><hr style="flex:1;border-color:#475569;">
            </div>
            <form class="auth-form" id="loginForm">
              <input type="email" id="emailInput" placeholder="${t('emailPlaceholder')}" required>
              <button type="submit" class="primary" style="background:#475569;">${t('loginEmail')}</button>
            </form>
            <p class="status" id="loginStatus"></p>
          `}
        </div>
      </div>
    `;
  }

  setupListeners() {
    const shadow = this.shadowRoot!;
    
    shadow.getElementById('hobbieBtn')?.addEventListener('click', () => {
      setMode('Hobbie');
      this.render();
      this.setupListeners();
    });

    shadow.getElementById('estudoBtn')?.addEventListener('click', () => {
      setMode('Estudo');
      this.render();
      this.setupListeners();
    });

    const loginForm = shadow.getElementById('loginForm');
    if (loginForm) {
      loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = (shadow.getElementById('emailInput') as HTMLInputElement).value;
        const status = shadow.getElementById('loginStatus')!;
        try {
          status.textContent = 'Enviando link...';
          await sendLoginLink(email);
          status.textContent = t('checkEmail');
        } catch (error: any) {
          status.textContent = 'Erro: ' + error.message;
        }
      });
    }

    const googleLoginBtn = shadow.getElementById('googleLoginBtn');
    if (googleLoginBtn) {
      googleLoginBtn.addEventListener('click', async () => {
        const status = shadow.getElementById('loginStatus')!;
        try {
          status.textContent = 'Autenticando...';
          await loginWithGoogle();
        } catch (error: any) {
          status.textContent = 'Erro no Google: ' + error.message;
        }
      });
    }

    const logoutBtn = shadow.getElementById('logoutBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', async () => {
        await logout();
        setUser(null);
        this.render();
        this.setupListeners();
      });
    }
  }
}

customElements.define('auth-modal', AuthModal);
