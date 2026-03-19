import { useState } from 'react';
import { getScoreColor, groupCategories } from '../utils/privacy';
import { SCORE_DESCRIPTIONS } from '../utils/constants';
import './Results.css';

function Results({ data }) {
  const [showDetails, setShowDetails] = useState(false);

  if (data.error) {
    return (
      <div className="results fade-in">
        <div className="error-message">{data.message}</div>
      </div>
    );
  }

  const scoreColor = getScoreColor(data.score);
  const { sensitive, moderate, basic } = groupCategories(data.dataCategories);

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
        <button 
          className="score-info-toggle"
          onClick={() => setShowDetails(!showDetails)}
        >
          {showDetails ? 'Hide details' : 'Why this score?'}
        </button>
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
    </div>
  );
}

export default Results;
