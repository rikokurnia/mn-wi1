import React, { useState } from 'react';
import { useCaseTabs } from '../../data/mockData';

const UseCases = () => {
  const [activeTab, setActiveTab] = useState('delivery');
  const activeCase = useCaseTabs.find((tab) => tab.id === activeTab);

  return (
    <section className="usecases-section" id="agencies">
      <h2 className="usecases-heading">
        Built For Indonesia's<br />Service Economy
      </h2>

      <div className="usecases-tabs">
        {useCaseTabs.map((tab) => (
          <button
            key={tab.id}
            className={`usecase-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeCase && (
        <div className="usecase-content">
          <div className="usecase-content-inner">
            <div className="usecase-text-side">
              <p className="usecase-tagline">{activeCase.tagline}</p>
              <p className="usecase-description">{activeCase.description}</p>
            </div>
            <div className="usecase-image-side">
              <img
                src={activeCase.image}
                alt={activeCase.label}
                className="usecase-image"
              />
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default UseCases;
