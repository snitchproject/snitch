import './About.css';

const CONTENT = {
  about: (
    <>
      <p>Snitch tells you what apps really collect. No legal jargon, no 50-page privacy policies. Just a score and plain English explanation.</p>
      <p>Type an app name, get the truth in seconds.</p>
    </>
  ),
  why: (
    <>
      <p>Most people don't read privacy policies. They're long, confusing, and written by lawyers.</p>
      <p>Snitch does the reading for you and translates it into something actually useful: a score and a quick explanation of what the app collects.</p>
    </>
  ),
  support: (
    <>
      <p>Snitch is free and runs on AI API costs. If you find it useful, consider supporting development.</p>
      <div className="crypto-addresses">
        <div className="crypto-item">
          <div className="crypto-label">Bitcoin (BTC)</div>
          <div className="crypto-address">bc1qd9vj66400x7qyw8crqq2neampek20fwv733sfx</div>
        </div>
        <div className="crypto-item">
          <div className="crypto-label">Liquid Bitcoin (L-BTC)</div>
          <div className="crypto-address">VJL8PTb8kpMKKh74T84sFeKr2jU8DHHRtCSJCr6ZSGBcodSEHw8PT11XQifoPQ1fJ5WtfLnDmpLyKuW5</div>
        </div>
        <div className="crypto-item">
          <div className="crypto-label">Litecoin (LTC)</div>
          <div className="crypto-address">LP93S7VPdoUqG2hSDwvcP99R3DnzLpEzwQ</div>
        </div>
        <div className="crypto-item">
          <div className="crypto-label">Ethereum (ETH)</div>
          <div className="crypto-address">0x94bfe4eEBB859d5AFB8251cC08daf63D4Fd4B633</div>
        </div>

        </div>
    </>
  )
};

function InfoSection({ type }) {
  return (
    <div className="about">
      <div className="about-content">
        {CONTENT[type]}
      </div>
    </div>
  );
}

export default InfoSection;
