import { Link } from 'react-router-dom';
import logo from '../assets/logo.svg';
import './home.css';

export default function Home() {
  return (
    <div className="container">
      <div className="home-hero">
        <img src={logo} alt="HLT RONICS Logo" className="home-logo" />
        <h1>Welcome to Your BOM Assembly Assistant</h1>
        <p className="lead">Upload BOM files, validate components, and generate automated assembly quotations.</p>

        <div className="cta-row">
          <Link to="/config" className="cta-button">Start Process you files</Link>
          {/* <Link to="/review" className="cta-ghost">Review Uploaded Files</Link> */}
        </div>
      </div>

      <section className="features-slider">
        <div className="slider-content">
          <div className="slider-item">
            <span className="slider-icon">⚡</span>
            <p>Automated BOM processing with intelligent component validation</p>
          </div>
          <div className="slider-item">
            <span className="slider-icon">📊</span>
            <p>Real-time quotation generation and cost analysis</p>
          </div>
          <div className="slider-item">
            <span className="slider-icon">🔄</span>
            <p>Smart database learning from past component data</p>
          </div>
          <div className="slider-item">
            <span className="slider-icon">✅</span>
            <p>Seamless workflow from upload to final assembly quotation</p>
          </div>
        </div>
      </section>


      {/* <section className="features-section">
        <h2>✨ Key Features</h2>
        <div className="features-list">
          <div className="feature-item">
            <span className="feature-mark">✓</span>
            <div>
              <h4>Multi-Format Support</h4>
              <p>Works with Excel, CSV, JSON, and more</p>
            </div>
          </div>
          <div className="feature-item">
            <span className="feature-mark">✓</span>
            <div>
              <h4>Intelligent Validation</h4>
              <p>Automatically verifies components against our database</p>
            </div>
          </div>
          <div className="feature-item">
            <span className="feature-mark">✓</span>
            <div>
              <h4>Accurate Costing</h4>
              <p>Real-time pricing calculations based on pin counts</p>
            </div>
          </div>
          <div className="feature-item">
            <span className="feature-mark">✓</span>
            <div>
              <h4>Quick Processing</h4>
              <p>Get your assembly quotations in minutes, not days</p>
            </div>
          </div>
          <div className="feature-item">
            <span className="feature-mark">✓</span>
            <div>
              <h4>Learning System</h4>
              <p>Our system learns from your data for better accuracy</p>
            </div>
          </div>
          <div className="feature-item">
            <span className="feature-mark">✓</span>
            <div>
              <h4>Easy Export</h4>
              <p>Download your quotations in standard formats</p>
            </div>
          </div>
        </div>
      </section> */}
    </div>
  );
}