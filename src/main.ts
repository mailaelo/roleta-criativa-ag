import './components/accessibility-widget';
import './components/auth-modal';
import './components/roulette-wheel';
import './components/media-display';
import './components/mood-tracker';
import './components/analytics-dashboard';
import './components/tutorial-dialog';

import { initI18n, t } from './i18n';
import { subscribe, getState, saveHobbieAnalytics, getHobbieAnalytics, setUser } from './state';
import { finishLogin, observeAuth, logout, saveAnalyticsDoc, getAnalyticsDocs } from './firebase';

async function bootstrap() {
  await initI18n();

  // Translations are handled natively in index.html for static content

  // Tutorial Toggle
  const tutorialBtn = document.getElementById('tutorialBtn');
  if (tutorialBtn) {
    tutorialBtn.addEventListener('click', () => {
      const dialog = document.getElementById('tutorialDialog') as any;
      if (dialog) dialog.show();
    });
  }

  // Theme Toggle
  const themeToggle = document.getElementById('themeToggle') as any;
  const isDark = localStorage.getItem('theme') !== 'light'; // default dark
  if (isDark) {
    document.documentElement.classList.add('sl-theme-dark');
    if (themeToggle) themeToggle.name = 'sun-fill';
  } else {
    document.documentElement.classList.remove('sl-theme-dark');
    if (themeToggle) themeToggle.name = 'moon-fill';
  }

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      document.documentElement.classList.toggle('sl-theme-dark');
      const darkNow = document.documentElement.classList.contains('sl-theme-dark');
      themeToggle.name = darkNow ? 'sun-fill' : 'moon-fill';
      localStorage.setItem('theme', darkNow ? 'dark' : 'light');
    });
  }

  // A11y Toggle
  const a11yToggle = document.getElementById('a11yToggle');
  if (a11yToggle) {
    a11yToggle.addEventListener('click', () => {
      const widget = document.querySelector('accessibility-widget') as any;
      if (widget && typeof widget.toggleDrawer === 'function') {
        widget.toggleDrawer();
      }
    });
  }

  // Firebase Auth Observer
  observeAuth((user) => {
    setUser(user);
  });

  // Handle passwordless login link if present
  try {
    const verifiedUser = await finishLogin();
    if (verifiedUser) {
      // Magic Sync: Tab B (this tab) successfully logged in.
      // Tab A (the original tab) will auto-detect this via onAuthStateChanged.
      document.body.innerHTML = `
        <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;background:#0f172a;color:white;font-family:'Outfit', sans-serif;text-align:center;padding:2rem;">
          <h1 style="font-size:2.5rem;margin-bottom:1rem;background: linear-gradient(to right, #14b8a6, #3b82f6); -webkit-background-clip: text; color: transparent;">🎉 Login Bem-sucedido!</h1>
          <p style="font-size:1.25rem;opacity:0.8;margin-bottom:2rem;max-width:400px;">Você já pode fechar esta aba e voltar para a aba original da Roleta Criativa.</p>
          <button onclick="window.close()" style="padding:12px 32px;border:none;border-radius:999px;background:#3b82f6;color:white;font-size:1.1rem;font-weight:bold;cursor:pointer;box-shadow: 0 10px 15px -3px rgba(59, 130, 246, 0.5);">Fechar Aba</button>
        </div>
      `;
      return; // Stop app execution for this tab
    }
  } catch (e) {
    console.error('Failed to finish login', e);
  }

  const setupView = document.getElementById('setupView')!;
  const wheelView = document.getElementById('wheelView')!;
  const mediaView = document.getElementById('mediaView')!;
  const moodView = document.getElementById('moodView')!;
  const analyticsView = document.getElementById('analyticsView')!;
  const loader = document.getElementById('loader')!;
  
  const setupForm = document.getElementById('setupForm')!;
  const driveUrlInput = document.getElementById('driveUrl') as HTMLInputElement;
  const spinBtn = document.getElementById('spinBtn')!;
  const navHomeBtn = document.getElementById('navHomeBtn')!;
  const navDashboardBtn = document.getElementById('navDashboardBtn')!;
  const userProfile = document.getElementById('userProfile')!;
  const userEmailDisplay = document.getElementById('userEmailDisplay')!;
  const logoutBtn = document.getElementById('logoutBtn')!;
  
  const rouletteWheel = document.createElement('roulette-wheel') as any;
  document.getElementById('wheelCanvasContainer')!.appendChild(rouletteWheel);

  const mediaDisplay = document.createElement('media-display') as any;
  mediaView.appendChild(mediaDisplay);

  const moodTracker = document.createElement('mood-tracker');
  moodView.appendChild(moodTracker);

  const analyticsDashboard = document.createElement('analytics-dashboard') as any;
  analyticsView.appendChild(analyticsDashboard);

  let selectedFile: any = null;
  let currentSessionTimeSpent = 0;

  function showView(view: HTMLElement) {
    [setupView, wheelView, mediaView, moodView, analyticsView].forEach(v => v.classList.add('hidden'));
    view.classList.remove('hidden');
  }

  function showLoader() {
    loader.classList.remove('hidden');
  }

  function hideLoader() {
    loader.classList.add('hidden');
  }

  // Subscribe to state to toggle dashboard button visibility and user profile
  subscribe((state) => {
    if (state.mode === 'Estudo' && state.userId) {
      navDashboardBtn.classList.remove('hidden');
      userProfile.classList.remove('hidden');
      userEmailDisplay.textContent = state.userEmail || '';
    } else {
      navDashboardBtn.classList.add('hidden');
      userProfile.classList.add('hidden');
    }
  });

  logoutBtn.addEventListener('click', async () => {
    await logout();
    window.location.reload();
  });

  navHomeBtn.addEventListener('click', () => {
    showView(setupView);
  });

  navDashboardBtn.addEventListener('click', async () => {
    const { userId } = getState();
    if (!userId) return;

    showLoader();
    try {
      const result = await getAnalyticsDocs(userId);
      analyticsDashboard.setData(result.analytics || []);
      showView(analyticsView);
    } catch (err) {
      console.error('Error fetching dashboard', err);
      alert('Erro ao carregar o progresso.');
    } finally {
      hideLoader();
    }
  });

  setupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const url = driveUrlInput.value;
    
    showLoader();
    try {
      const res = await fetch('/api/drive-files', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || 'Failed to fetch files');
      if (data.files.length === 0) throw new Error('No images or videos found in this folder.');

      rouletteWheel.setFiles(data.files);
      showView(wheelView);
    } catch (err: any) {
      alert(err.message);
    } finally {
      hideLoader();
    }
  });

  spinBtn.addEventListener('click', async () => {
    selectedFile = await rouletteWheel.spin();
    setTimeout(() => {
      mediaDisplay.setMedia(selectedFile);
      showView(mediaView);
    }, 1000);
  });

  mediaDisplay.addEventListener('session-complete', (e: any) => {
    currentSessionTimeSpent = e.detail?.timeSpentMs || 0;
    const { mode } = getState();
    if (mode === 'Hobbie') {
      alert(t('sessionComplete'));
      showView(setupView);
    } else {
      showView(moodView);
    }
  });

  moodTracker.addEventListener('mood-submitted', async (e: any) => {
    const data = e.detail;
    const { mode, userId } = getState();

    const payload = {
      ...data,
      timeSpentMs: currentSessionTimeSpent,
      mediaId: selectedFile?.id,
      mediaName: selectedFile?.name,
      mode,
      userId
    };

    if (mode === 'Hobbie') {
      // Should not be reachable since Hobbie skips mood-tracker
    } else {
      if (!userId) {
        alert('Você precisa estar logado para salvar no modo Estudo!');
        return;
      }
      showLoader();
      try {
        await saveAnalyticsDoc(payload);
        
        // Fetch fresh analytics directly from Firestore
        const result = await getAnalyticsDocs(userId);
        analyticsDashboard.setData(result.analytics || []);
        showView(analyticsView);
      } catch (err) {
        console.error('Error saving data', err);
        alert('Erro ao salvar dados');
      } finally {
        hideLoader();
      }
    }
  });

  analyticsDashboard.addEventListener('restart', () => {
    showView(setupView);
  });
}

bootstrap();

// Add global web components
document.body.appendChild(document.createElement('accessibility-widget'));
document.querySelector('main')!.prepend(document.createElement('auth-modal'));
