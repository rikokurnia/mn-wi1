import React from 'react';
import { backers } from '../../data/mockData';

const BackedBySection = () => {
  return (
    <section className="backedby-section">
      <h2 className="backedby-heading">Backed By The Best</h2>
      <div className="backedby-grid">
        {backers.map((backer) => (
          <div key={backer.name} className="backer-card">
            <img src={backer.logo} alt={backer.name} />
          </div>
        ))}
      </div>
    </section>
  );
};

export default BackedBySection;
