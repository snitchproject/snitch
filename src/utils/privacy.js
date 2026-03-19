import { SENSITIVE_CATEGORIES, MODERATE_CATEGORIES } from './constants';

export const getScoreColor = (score) => {
  if (score >= 8) return '#00b300';
  if (score >= 6) return '#66cc00';
  if (score >= 4) return '#ffaa00';
  if (score >= 2) return '#ff6600';
  return '#ff0000';
};

export const getSensitivityClass = (category) => {
  const categoryLower = category.toLowerCase();
  
  const isSensitive = SENSITIVE_CATEGORIES.some(cat => 
    categoryLower.includes(cat.toLowerCase())
  );
  
  const isModerate = MODERATE_CATEGORIES.some(cat => 
    categoryLower.includes(cat.toLowerCase())
  );
  
  if (isSensitive) return 'sensitive';
  if (isModerate) return 'moderate';
  return '';
};

export const groupCategories = (categories) => {
  const sensitive = [];
  const moderate = [];
  const basic = [];
  
  categories.forEach(cat => {
    const sensitivity = getSensitivityClass(cat);
    if (sensitivity === 'sensitive') sensitive.push(cat);
    else if (sensitivity === 'moderate') moderate.push(cat);
    else basic.push(cat);
  });
  
  return { sensitive, moderate, basic };
};
