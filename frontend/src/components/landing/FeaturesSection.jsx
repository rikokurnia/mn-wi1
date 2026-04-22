import React from 'react';
import { ArrowRight, Layers, Network } from 'lucide-react';

const FeaturesSection = () => {
  return (
    <section id="rollups">
      {/* More Is More / Go Horizontal */}
      <div className="more-section">
        <h2 className="more-title">
          More Is More.
          <br />
          <span className="outline-text">Go Horizontal.</span>
        </h2>
      </div>

      {/* Rollup Engine + Metalayer Grid */}
      <div className="features-grid">
        {/* Rollup Engine - Text Card */}
        <div className="feature-card feature-card-text">
          <div>
            <div className="feature-icon">
              <Layers size={28} color="white" />
            </div>
            <h3 className="feature-title">
              The Rollup Engine,<br />For Massive Apps
            </h3>
            <p className="feature-desc">
              With the Rollup Engine, apps and communities build their own fully customizable chains on Caldera, ready for massive scale.
            </p>
          </div>
          <a href="#rollups" className="feature-link">
            Learn More About Rollups <ArrowRight size={16} />
          </a>
        </div>

        {/* Rollup Engine - Visual Card */}
        <div className="feature-card feature-card-visual feature-visual-purple">
          <div className="feature-visual-inner">
            <img
              src="https://framerusercontent.com/images/4s9EzhaZnhhgrWdNWa0KAAM.png"
              alt="Rollup Engine Illustration"
              style={{ objectFit: 'cover', width: '100%', height: '100%' }}
            />
          </div>
        </div>

        {/* Metalayer - Visual Card */}
        <div className="feature-card feature-card-visual feature-visual-orange" id="metalayer">
          <div className="feature-visual-inner">
            <img
              src="https://framerusercontent.com/images/e2KxweboWULbmPYTg5DkZYQURA.png"
              alt="Metalayer Illustration"
              style={{ objectFit: 'cover', width: '100%', height: '100%' }}
            />
          </div>
        </div>

        {/* Metalayer - Text Card */}
        <div className="feature-card feature-card-text">
          <div>
            <div className="feature-icon">
              <Network size={28} color="white" />
            </div>
            <h3 className="feature-title">
              Connected To The World Via Metalayer
            </h3>
            <p className="feature-desc">
              Connect your Caldera rollup to a constellation of chains with Metalayer. Access shared liquidity, enable cross-chain interactions, and reach users across the entire Caldera ecosystem, and beyond.
            </p>
          </div>
          <a href="#metalayer" className="feature-link">
            Learn More About Metalayer <ArrowRight size={16} />
          </a>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
