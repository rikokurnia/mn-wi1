import React from 'react';
import { partnerLogos } from '../../data/mockData';

const Partners = () => {
  const duplicatedLogos = [...partnerLogos, ...partnerLogos, ...partnerLogos];

  return (
    <section className="partners-section">
      <div className="partners-track">
        {duplicatedLogos.map((logo, index) => (
          <div key={`${logo}-${index}`} className="partner-item">
            {logo}
          </div>
        ))}
      </div>
    </section>
  );
};

export default Partners;
