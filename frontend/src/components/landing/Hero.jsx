import React from 'react';

const Hero = () => {
  return (
    <section className="hero-section">
      <h1 className="hero-title">
        The
        <br />
        Internet
        <br />
        Of Chains
      </h1>
      <div className="hero-bottom">
        <div>
          <p className="hero-description">
            Caldera is a network of interconnected, purpose-built blockchains, settling on Ethereum.
          </p>
          <div className="hero-buttons">
            <a href="https://portal.caldera.xyz/" className="btn-primary" target="_blank" rel="noopener noreferrer">
              Explore Chains
            </a>
            <a href="#book-call" className="btn-secondary">
              Book A Call
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
