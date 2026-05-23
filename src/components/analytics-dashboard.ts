import { t } from '../i18n';
import { calculateStreaks } from '../utils/streak';
import { renderTagsChart, renderMoodChart } from '../utils/charts';

export class AnalyticsDashboard extends HTMLElement {
  private analyticsData: any[] = [];
  private chartInstanceTags: any = null;
  private chartInstanceMood: any = null;

  constructor() {
    super();
    // Light DOM to allow Shoelace elements to render and inherit styles
  }

  connectedCallback() {
    this.render();
  }

  setData(data: any[]) {
    this.analyticsData = data;
    this.render();
  }

  formatTime(ms: number) {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
    const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
    const seconds = String(totalSeconds % 60).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  }

  destroyCharts() {
    if (this.chartInstanceTags) {
      this.chartInstanceTags.destroy();
      this.chartInstanceTags = null;
    }
    if (this.chartInstanceMood) {
      this.chartInstanceMood.destroy();
      this.chartInstanceMood = null;
    }
  }

  render() {
    // 1. Calculate Streaks using utility
    const { currentStreak, maxStreak } = calculateStreaks(this.analyticsData);

    // 2. Count Tags
    const tagCounts: Record<string, number> = {};
    this.analyticsData.forEach(item => {
      if (item.tags && Array.isArray(item.tags)) {
        item.tags.forEach((tag: string) => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
      }
    });
    const uniqueTagsCount = Object.keys(tagCounts).length;
    const totalSessions = this.analyticsData.length;

    this.innerHTML = `
      <style>
        .analytics-dashboard-container {
          width: 100%;
          max-width: 1000px;
          margin: 0 auto;
          text-align: left;
        }
        .dashboard-header-block {
          text-align: center;
          margin-bottom: 32px;
        }
        .dashboard-header-block h2 {
          font-size: 32px;
          font-weight: 800;
          color: #fff;
          margin: 0 0 8px 0;
        }
        .dashboard-header-block p {
          color: var(--sl-color-neutral-400);
          margin: 0;
          font-size: 16px;
        }
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
          margin-bottom: 32px;
        }
        @media (max-width: 768px) {
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        .stat-card::part(base) {
          background: var(--glass-bg);
          border: 1px solid var(--glass-border);
          border-radius: 16px;
          box-shadow: var(--glass-shadow);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .stat-card::part(base):hover {
          transform: translateY(-4px);
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
        }
        .stat-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 8px;
        }
        .stat-icon {
          font-size: 36px;
          margin-bottom: 8px;
        }
        .stat-label {
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--sl-color-neutral-400);
          margin-bottom: 6px;
        }
        .stat-value {
          font-size: 32px;
          font-weight: 800;
          color: #fff;
        }
        .charts-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 24px;
          margin-bottom: 32px;
        }
        @media (min-width: 768px) {
          .charts-grid {
            grid-template-columns: 1fr 1fr;
          }
        }
        .chart-card {
          background: var(--glass-bg);
          border: 1px solid var(--glass-border);
          border-radius: 16px;
          padding: 24px;
          box-shadow: var(--glass-shadow);
          display: flex;
          flex-direction: column;
        }
        .chart-card h3 {
          margin: 0 0 16px 0;
          font-size: 18px;
          font-weight: 700;
          color: #fff;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          padding-bottom: 8px;
        }
        .chart-canvas-wrapper {
          position: relative;
          height: 250px;
          width: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
        }
        .no-data-msg {
          color: var(--sl-color-neutral-400);
          font-style: italic;
          font-size: 14px;
        }
        .table-card {
          background: var(--glass-bg);
          border: 1px solid var(--glass-border);
          border-radius: 16px;
          padding: 24px;
          box-shadow: var(--glass-shadow);
          margin-bottom: 32px;
          overflow-x: auto;
        }
        .table-card h3 {
          margin: 0 0 16px 0;
          font-size: 18px;
          font-weight: 700;
          color: #fff;
        }
        .history-table {
          width: 100%;
          border-collapse: collapse;
          min-width: 600px;
        }
        .history-table th {
          text-align: left;
          padding: 12px 16px;
          color: var(--sl-color-neutral-400);
          font-weight: 600;
          font-size: 13px;
          border-bottom: 1px solid var(--glass-border);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .history-table td {
          padding: 16px;
          font-size: 14px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          color: #fff;
          vertical-align: middle;
        }
        .history-table tr:last-child td {
          border-bottom: none;
        }
        .history-table tr:hover td {
          background: rgba(255, 255, 255, 0.02);
        }
        .tag-badge {
          margin-right: 4px;
          margin-bottom: 4px;
        }
        .restart-btn-container {
          display: flex;
          justify-content: center;
          margin-top: 16px;
        }
      </style>

      <div class="analytics-dashboard-container">
        <div class="dashboard-header-block">
          <h2>${t('creativeJourney')}</h2>
          <p>${t('journeyDesc')}</p>
        </div>

        <div class="stats-grid">
          <!-- Card 1: Total Sessions -->
          <sl-card class="stat-card">
            <div class="stat-content">
              <span class="stat-icon">🎨</span>
              <span class="stat-label">${t('totalSessions')}</span>
              <span class="stat-value">${totalSessions}</span>
            </div>
          </sl-card>

          <!-- Card 2: Active Tags -->
          <sl-card class="stat-card">
            <div class="stat-content">
              <span class="stat-icon">🏷️</span>
              <span class="stat-label">${t('activeTags')}</span>
              <span class="stat-value" style="color: var(--sl-color-cyan-400);">${uniqueTagsCount}</span>
            </div>
          </sl-card>

          <!-- Card 3: Current Streak -->
          <sl-card class="stat-card">
            <div class="stat-content">
              <span class="stat-icon">🔥</span>
              <span class="stat-label">${t('currentStreak')}</span>
              <span class="stat-value" style="color: var(--sl-color-rose-500);">${currentStreak}</span>
            </div>
          </sl-card>

          <!-- Card 4: Longest Streak -->
          <sl-card class="stat-card">
            <div class="stat-content">
              <span class="stat-icon">🏆</span>
              <span class="stat-label">${t('longestStreak')}</span>
              <span class="stat-value" style="color: var(--sl-color-amber-400);">${maxStreak}</span>
            </div>
          </sl-card>
        </div>

        <div class="charts-grid">
          <!-- Chart 1: Tag Distribution -->
          <div class="chart-card">
            <h3>Distribuição de Habilidades</h3>
            <div class="chart-canvas-wrapper">
              ${Object.keys(tagCounts).length > 0 
                ? '<canvas id="tagsChart"></canvas>' 
                : '<div class="no-data-msg">Pratique e adicione tags para ver a distribuição.</div>'}
            </div>
          </div>

          <!-- Chart 2: Mood History -->
          <div class="chart-card">
            <h3>Evolução do Humor</h3>
            <div class="chart-canvas-wrapper">
              ${this.analyticsData.length > 0 
                ? '<canvas id="moodChart"></canvas>' 
                : '<div class="no-data-msg">Complete sessões para ver a evolução de humor.</div>'}
            </div>
          </div>
        </div>

        <!-- History Log Table -->
        <div class="table-card">
          <h3>Histórico Recente</h3>
          <table class="history-table">
            <thead>
              <tr>
                <th>${t('date')}</th>
                <th>${t('media')}</th>
                <th>${t('tags')}</th>
                <th>${t('practiced')}</th>
                <th>${t('time')}</th>
              </tr>
            </thead>
            <tbody>
              ${this.analyticsData.length === 0 ? `
                <tr>
                  <td colspan="5" style="text-align: center; color: var(--sl-color-neutral-400); font-style: italic;">
                    Nenhuma sessão realizada ainda.
                  </td>
                </tr>
              ` : this.analyticsData.map(item => `
                <tr>
                  <td>${new Date(item.createdAt).toLocaleDateString()}</td>
                  <td style="max-width: 160px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${item.mediaName || ''}">
                    ${item.mediaId ? `<a href="https://drive.google.com/file/d/${item.mediaId}/view" target="_blank" style="color: var(--sl-color-primary-500); text-decoration: none;">${item.mediaName || 'Ver Arquivo'}</a>` : (item.mediaName || '-')}
                  </td>
                  <td>
                    ${(item.tags || []).map((tag: string) => `
                      <sl-tag size="small" pill style="margin-right: 4px; margin-bottom: 4px;">${tag}</sl-tag>
                    `).join('')}
                  </td>
                  <td>${item.practiced ? '✅' : '❌'}</td>
                  <td style="color: var(--sl-color-cyan-400); font-family: monospace; font-weight: 600;">
                    ${this.formatTime(item.timeSpentMs || 0)}
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <div class="restart-btn-container">
          <sl-button variant="neutral" pill size="large" id="restartBtn">
            ${t('startNewSession')}
          </sl-button>
        </div>
      </div>
    `;

    this.querySelector('#restartBtn')!.addEventListener('click', () => {
      this.dispatchEvent(new CustomEvent('restart', { bubbles: true, composed: true }));
    });

    this.destroyCharts();
    this.renderCharts(tagCounts);
  }

  renderCharts(tagCounts: Record<string, number>) {
    const isDark = document.documentElement.classList.contains('sl-theme-dark');

    // Render Tag Distribution Doughnut Chart
    const tagsCanvas = this.querySelector('#tagsChart') as HTMLCanvasElement;
    if (tagsCanvas && Object.keys(tagCounts).length > 0) {
      this.chartInstanceTags = renderTagsChart(tagsCanvas, tagCounts, isDark);
    }

    // Render Mood History Line Chart
    const moodCanvas = this.querySelector('#moodChart') as HTMLCanvasElement;
    if (moodCanvas && this.analyticsData.length > 0) {
      this.chartInstanceMood = renderMoodChart(moodCanvas, this.analyticsData, isDark);
    }
  }
}

customElements.define('analytics-dashboard', AnalyticsDashboard);
