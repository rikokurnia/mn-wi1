import React, { useState } from 'react';
import { useCaseTabs } from '../../data/mockData';

const UseCases = () => {
  const [activeTab, setActiveTab] = useState('gaming');
  const activeCase = useCaseTabs.find((tab) => tab.id === activeTab);

  return (
    <section className="usecases-section">
      <h2 className="usecases-heading">
        Bringing The World<br />Onchain
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
          <p className="usecase-tagline">{activeCase.tagline}</p>
          <p className="usecase-description">{activeCase.description}</p>
          <p className="usecase-projects-label">Projects built with Caldera</p>
          <div className="usecase-projects">
            {activeCase.projects.map((project) => (
              <a
                key={project.name}
                href={project.url}
                target="_blank"
                rel="noopener noreferrer"
                className="usecase-project"
              >
                <img src={project.logo} alt={project.name} />
              </a>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};

export default UseCases;
