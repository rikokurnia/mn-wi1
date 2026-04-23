import React from 'react';

const Hero = () => {
  return (
    <section className="hero-section">
      <h1 className="hero-title">
        Instant
        <br />
        Pay For
        <br />
        Every Worker
      </h1>
      <div className="hero-bottom">
        <div>
          <p className="hero-description">
            Mandora uses GPS geofencing and photo-hash proofs on Solana to settle gig worker payments in 400ms — directly to their phone, no bank account needed.
          </p>
          <div className="hero-buttons">
            <a href="/login" className="btn-primary">
              Launch App
            </a>
            <a href="#agencies" className="btn-secondary">
              For Agencies
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
