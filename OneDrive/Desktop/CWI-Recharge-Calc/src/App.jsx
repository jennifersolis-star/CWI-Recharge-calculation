// src/App.jsx
import React from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import InfoSections from './components/InfoSections';
import RechargeCalculator from './components/RechargeCalculator';
import './App.css'; 

function App() {
  return (
    <div className="app-container">
      <Header />
      <main className="app-main">
        <InfoSections />
        <RechargeCalculator />
      </main>
      <Footer />
    </div>
  );
}

export default App;