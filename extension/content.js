// Content script to inject privacy badge on app store pages
const API_URL = 'https://snitchh.onrender.com';

function getScoreColor(score) {
  if (score >= 8) return '#00b300';
  if (score >= 6) return '#66cc00';
  if (score >= 4) return '#ffaa00';
  if (score >= 2) return '#ff6600';
  return '#ff0000';
}

async function checkPrivacy(appName) {
  try {
    const response = await fetch(`${API_URL}/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ app: appName }),
    });

    if (!response.ok) {
      throw new Error('Failed to analyze');
    }

    return await response.json();
  } catch (error) {
    return null;
  }
}

function createBadge(data) {
  const badge = document.createElement('div');
  badge.id = 'snitch-badge';
  badge.innerHTML = `
    <div class="snitch-score" style="color: ${getScoreColor(data.score)}">
      ${data.score}/10
    </div>
    <div class="snitch-label">Privacy Score by Snitch</div>
    <div class="snitch-summary">${data.summary.substring(0, 150)}...</div>
  `;
  return badge;
}

function injectBadge() {
  const url = window.location.href;
  let appName = null;
  let targetElement = null;
  
  if (url.includes('apps.apple.com')) {
    const match = url.match(/\/app\/([^\/]+)/);
    if (match) {
      appName = match[1].replace(/-/g, ' ');
      targetElement = document.querySelector('.product-header');
    }
  } else if (url.includes('play.google.com')) {
    const match = url.match(/id=([^&]+)/);
    if (match) {
      appName = match[1].split('.').pop();
      targetElement = document.querySelector('[itemprop="name"]')?.parentElement;
    }
  }
  
  if (!appName || !targetElement || document.getElementById('snitch-badge')) {
    return;
  }
  
  checkPrivacy(appName).then(data => {
    if (data && targetElement) {
      const badge = createBadge(data);
      targetElement.appendChild(badge);
    }
  });
}

// Run on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', injectBadge);
} else {
  injectBadge();
}
