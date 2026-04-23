import React from 'react';
import { ArrowRight, MapPin, Zap } from 'lucide-react';

const FeaturesSection = () => {
  return (
    <section id="protocol">
      {/* Tap. Verify. Get Paid. */}
      <div className="more-section">
        <h2 className="more-title">
          Tap. Verify.
          <br />
          <span className="outline-text">Get Paid.</span>
        </h2>
      </div>

      {/* Geofenced Escrow + Instant Settlement Grid */}
      <div className="features-grid">
        {/* Geofenced Escrow - Text Card */}
        <div className="feature-card feature-card-text">
          <div>
            <div className="feature-icon">
              <MapPin size={28} color="white" />
            </div>
            <h3 className="feature-title">
              Geofenced Escrow,<br />Zero Fraud
            </h3>
            <p className="feature-desc">
              Agencies lock IDRX bounties into smart contracts that only release when GPS geofencing and photo-hash proofs confirm the worker was on-site and completed the task. No more spoofed locations or fake reports.
            </p>
          </div>
          <a href="#protocol" className="feature-link">
            Learn About The Protocol <ArrowRight size={16} />
          </a>
        </div>

        {/* Geofenced Escrow - Visual Card */}
        <div className="feature-card feature-card-visual feature-visual-purple">
          <div className="feature-visual-inner">
            <img
              src="https://images.unsplash.com/photo-1764347923709-fc48487f2486?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjY2NzF8MHwxfHNlYXJjaHw0fHxHUFMlMjBsb2NhdGlvbiUyMHRlY2hub2xvZ3l8ZW58MHx8fHwxNzc2OTc2ODQxfDA&ixlib=rb-4.1.0&q=85"
              alt="GPS Geofencing Technology"
              style={{ objectFit: 'cover', width: '100%', height: '100%' }}
            />
          </div>
        </div>

        {/* Instant Settlement - Visual Card */}
        <div className="feature-card feature-card-visual feature-visual-orange" id="workers">
          <div className="feature-visual-inner">
            <img
              src="https://images.unsplash.com/photo-1772734645633-5bfbbb87da88?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjY2NzV8MHwxfHNlYXJjaHwzfHxtb2JpbGUlMjBwYXltZW50JTIwcGhvbmV8ZW58MHx8fHwxNzc2OTc2ODM3fDA&ixlib=rb-4.1.0&q=85"
              alt="Instant Mobile Payment"
              style={{ objectFit: 'cover', width: '100%', height: '100%' }}
            />
          </div>
        </div>

        {/* Instant Settlement - Text Card */}
        <div className="feature-card feature-card-text">
          <div>
            <div className="feature-icon">
              <Zap size={28} color="white" />
            </div>
            <h3 className="feature-title">
              400ms Settlement,<br />No Bank Needed
            </h3>
            <p className="feature-desc">
              Programmatic execution on Solana clears payments in IDRX in under 400ms. Workers receive funds directly to their phone wallet — no HR overhead, no minimum bank balances, no 3-5 day waiting periods.
            </p>
          </div>
          <a href="#workers" className="feature-link">
            How Workers Get Paid <ArrowRight size={16} />
          </a>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
