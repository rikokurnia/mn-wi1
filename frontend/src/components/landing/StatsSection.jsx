import React, { useEffect, useRef, useState } from 'react';
import { stats } from '../../data/mockData';

const StatsSection = () => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section className="stats-section" ref={sectionRef}>
      <h2 className="stats-heading">
        DePIN For The<br />Service Economy
      </h2>
      <a href="#protocol" className="stats-explore-btn">
        Explore The Protocol
      </a>
      <div className="stats-grid">
        {stats.map((stat, index) => (
          <div
            key={stat.label}
            className="stat-card"
            style={{
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
              transition: `opacity 0.6s ease ${index * 0.1}s, transform 0.6s ease ${index * 0.1}s`,
            }}
          >
            <div className="stat-card-label">{stat.label}</div>
            <div className="stat-card-value">{stat.value}</div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default StatsSection;
