// src/App.js
import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import AppShell from './AppShell';
import { Web3Provider } from './Web3Provider';

function App() {
  return (
    <Web3Provider>
      <Router>
        <AppShell />
      </Router>
    </Web3Provider>
  );
}

export default App;