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
    throw error;
  }
}

function extractDomain(url) {
  try {
    const hostname = new URL(url).hostname;
    // Remove www. and get main domain
    const parts = hostname.replace('www.', '').split('.');
    // Get the main name (e.g., 'discord' from 'discord.com')
    return parts[0];
  } catch {
    return null;
  }
}

function showResult(data) {
  const content = document.getElementById('content');
  const color = getScoreColor(data.score);
  
  content.innerHTML = `
    <div class="result">
      <div class="score" style="color: ${color}">${data.score}/10</div>
      <div class="app-name">${data.appName || 'This Site'}</div>
      <div class="summary">${data.summary}</div>
      <a href="https://snitch-qyiy.onrender.com" target="_blank" class="link">
        View Full Details
      </a>
    </div>
  `;
}

function showError(message) {
  const content = document.getElementById('content');
  content.innerHTML = `<div class="error">${message}</div>`;
}

function showLoading() {
  const content = document.getElementById('content');
  content.innerHTML = `<div class="loading">Checking...</div>`;
}

// Get current tab and check privacy
chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
  const tab = tabs[0];
  const url = tab.url;
  
  // Extract app name from URL or domain
  let appName = null;
  
  if (url.includes('apps.apple.com')) {
    const match = url.match(/\/app\/([^\/]+)/);
    if (match) {
      appName = match[1].replace(/-/g, ' ');
    }
  } else if (url.includes('play.google.com')) {
    const match = url.match(/id=([^&]+)/);
    if (match) {
      appName = match[1].split('.').pop();
    }
  } else if (url.includes('chrome.google.com/webstore')) {
    appName = tab.title.split(' - ')[0];
  } else {
    // For any other website, use the domain name
    appName = extractDomain(url);
  }
  
  if (!appName) {
    showError('Could not identify site');
    return;
  }
  
  showLoading();
  
  try {
    const result = await checkPrivacy(appName);
    showResult(result);
  } catch (error) {
    showError('Could not analyze this site');
  }
});
