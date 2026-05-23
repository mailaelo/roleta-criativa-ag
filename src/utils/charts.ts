import Chart from 'chart.js/auto';

export function renderTagsChart(canvas: HTMLCanvasElement, tagCounts: Record<string, number>, isDark: boolean): Chart {
  const labelColor = isDark ? '#cbd5e1' : '#1e293b';
  const labels = Object.keys(tagCounts);
  const data = Object.values(tagCounts);
  const colors = labels.map((_, i) => `hsl(${(i * 360) / labels.length}, 75%, 60%)`);

  return new Chart(canvas, {
    type: 'doughnut',
    data: {
      labels: labels,
      datasets: [{
        data: data,
        backgroundColor: colors,
        borderWidth: 0
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'right',
          labels: {
            color: labelColor,
            font: { family: 'Outfit', size: 12 }
          }
        }
      }
    }
  });
}

export function renderMoodChart(canvas: HTMLCanvasElement, analyticsData: any[], isDark: boolean): Chart {
  const labelColor = isDark ? '#cbd5e1' : '#1e293b';
  const gridColor = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)';

  // Sort analytics data by timestamp ascending to show evolution left-to-right
  const sortedData = [...analyticsData]
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  // Limit to last 7 sessions for clear view
  const displayData = sortedData.slice(-7);

  const labels = displayData.map(item => {
    const d = new Date(item.createdAt);
    return `${d.getDate()}/${d.getMonth() + 1}`;
  });

  const moodValues = displayData.map(item => item.moodCheckIn || item.mood);

  return new Chart(canvas, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: 'Humor',
        data: moodValues,
        borderColor: isDark ? '#d946ef' : '#14b8a6',
        backgroundColor: isDark ? 'rgba(217, 70, 239, 0.1)' : 'rgba(20, 184, 166, 0.1)',
        fill: true,
        tension: 0.3,
        borderWidth: 3,
        pointBackgroundColor: isDark ? '#d946ef' : '#14b8a6',
        pointRadius: 5,
        pointHoverRadius: 7
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          min: 1,
          max: 5,
          ticks: {
            stepSize: 1,
            callback: function(value) {
              const emojis = ['', '😢', '😕', '😐', '🙂', '🤩'];
              return emojis[Number(value)] || value;
            },
            color: labelColor,
            font: { size: 14 }
          },
          grid: {
            color: gridColor
          }
        },
        x: {
          ticks: {
            color: labelColor,
            font: { family: 'Outfit', size: 11 }
          },
          grid: {
            display: false
          }
        }
      },
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              const val = context.raw as number;
              const labels = ['', 'Muito Ruim 😢', 'Ruim 😕', 'Ok 😐', 'Bom 🙂', 'Excelente 🤩'];
              return `Humor: ${labels[val] || val}`;
            }
          }
        }
      }
    }
  });
}
