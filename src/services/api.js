const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
const CACHE_DURATION = 1000 * 60 * 30; // 30 minutes
const cache = new Map();

export const fetchAppPrivacy = async (appName) => {
  const cacheKey = appName.toLowerCase();
  const cached = cache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  
  const response = await fetch(`${API_URL}/analyze`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ app: appName }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || 'Analysis failed');
  }

  const data = await response.json();
  
  const result = {
    appName,
    score: data.score,
    explanation: data.summary,
    dataCategories: data.categories
  };
  
  cache.set(cacheKey, {
    data: result,
    timestamp: Date.now()
  });
  
  return result;
};

export const getRecentSearches = () => {
  try {
    const recent = localStorage.getItem('recentSearches');
    return recent ? JSON.parse(recent) : [];
  } catch {
    return [];
  }
};

export const addRecentSearch = (appName) => {
  try {
    const recent = getRecentSearches();
    const filtered = recent.filter(name => name.toLowerCase() !== appName.toLowerCase());
    const updated = [appName, ...filtered].slice(0, 10);
    localStorage.setItem('recentSearches', JSON.stringify(updated));
  } catch {
    // Ignore localStorage errors
  }
};
