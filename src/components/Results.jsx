import { useState } from 'react';
import { getScoreColor, groupCategories } from '../utils/privacy';
import { SCORE_DESCRIPTIONS } from '../utils/constants';
import './Results.css';

function Results({ data }) {
  const [showDetails, setShowDetails] = useState(false);
  const [copied, setCopied] = useState(false);

  if (data.error) {
    return (
      <div className="results fade-in">
        <div className="error-message">{data.message}</div>
      </div>
    );
  }

  const scoreColor = getScoreColor(data.score);
  const { sensitive, moderate, basic } = groupCategories(data.dataCategories);

  const handleShare = async () => {
    const shareText = `${data.appName} privacy score: ${data.score}/10\n\n${data.explanation}\n\nCheck it out on Snitch:`;
    const shareUrl = window.location.href;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${data.appName} Privacy Score`,
          text: shareText,
          url: shareUrl
        });
      } catch (err) {
        // User cancelled or error - fall back to copy
        copyToClipboard(shareText + ' ' + shareUrl);
      }
    } else {
      copyToClipboard(shareText + ' ' + shareUrl);
    }
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="results fade-in">
      <div className="score-section">
        <div className="score-display" style={{ color: scoreColor }}>
          {data.score}/10
        </div>
        <div className="score-bar">
          <div 
            className="score-fill" 
            style={{ 
              width: `${data.score * 10}%`,
              background: scoreColor
            }}
          />
        </div>
        <div className="score-actions">
          <button 
            className="score-info-toggle"
            onClick={() => setShowDetails(!showDetails)}
          >
            {showDetails ? 'Hide details' : 'Why this score?'}
          </button>
          <button 
            className="share-button"
            onClick={handleShare}
          >
            {copied ? 'Copied!' : 'Share'}
          </button>
        </div>
        {showDetails && (
          <div className="score-details">
            {SCORE_DESCRIPTIONS[data.score]}
          </div>
        )}
      </div>

      <h2 className="app-name">{data.appName}</h2>

      <p className="explanation">{data.explanation}</p>

      <div className="data-categories">
        <h3 className="categories-title">Data collected:</h3>
        
        {sensitive.length > 0 && (
          <div className="category-group">
            <div className="category-group-label">High Risk</div>
            <div className="tags">
              {sensitive.map((category, index) => (
                <span key={index} className="tag sensitive">
                  {category}
                </span>
              ))}
            </div>
          </div>
        )}

        {moderate.length > 0 && (
          <div className="category-group">
            <div className="category-group-label">Moderate Risk</div>
            <div className="tags">
              {moderate.map((category, index) => (
                <span key={index} className="tag moderate">
                  {category}
                </span>
              ))}
            </div>
          </div>
        )}

        {basic.length > 0 && (
          <div className="category-group">
            <div className="category-group-label">Basic Data</div>
            <div className="tags">
              {basic.map((category, index) => (
                <span key={index} className="tag">
                  {category}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {data.alternatives && data.alternatives.length > 0 && (
        <div className="alternatives">
          <h3 className="alternatives-title">Privacy-focused alternatives:</h3>
          <div className="alternatives-list">
            {data.alternatives.map((alt, index) => (
              <div key={index} className="alternative-item">
                {alt}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default Results;
