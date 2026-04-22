import React from 'react';
import './App.css';
import Navbar from './components/landing/Navbar';
import Hero from './components/landing/Hero';
import StatsSection from './components/landing/StatsSection';
import Partners from './components/landing/Partners';
import FeaturesSection from './components/landing/FeaturesSection';
import UseCases from './components/landing/UseCases';
import NewsSection from './components/landing/NewsSection';
import CommunitySection from './components/landing/CommunitySection';
import BackedBySection from './components/landing/BackedBySection';
import Footer from './components/landing/Footer';

function App() {
  return (
    <div className="caldera-app">
      <div className="dot-pattern" />
      <Navbar />
      <main>
        <Hero />
        <StatsSection />
        <Partners />
        <FeaturesSection />
        <UseCases />
        <NewsSection />
        <CommunitySection />
        <BackedBySection />
        <Footer />
      </main>
    </div>
  );
}

export default App;
