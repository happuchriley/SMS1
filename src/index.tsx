import React from 'react';
import ReactDOM from 'react-dom/client';
import '@fortawesome/fontawesome-free/css/all.min.css';
import './index.css';
import App from './App';
import demoDataService from './services/demoDataService';
import apiService from './services/api';

// Initialize demo data on first load (only if no data exists)
const initializeDemoData = async (): Promise<void> => {
  try {
    // Check if any data exists
    const hasStudents = await apiService.hasData('students');
    const hasStaff = await apiService.hasData('staff');
    const hasClasses = await apiService.hasData('classes');
    
    // Only seed if no data exists
    if (!hasStudents && !hasStaff && !hasClasses) {
      console.log('🌱 Initializing demo data for first-time setup...');
      await demoDataService.seedAll();
      console.log('✅ Demo data initialized successfully!');
    }
  } catch (error) {
    console.error('❌ Error initializing demo data:', error);
    // Don't block app loading if demo data fails
  }
};

// Initialize demo data before rendering
initializeDemoData();

// Expose demo data service to window for easy access in browser console
// Usage in console: window.demoData.seedAll() or window.demoData.clearAll()
if (typeof window !== 'undefined') {
  (window as any).demoData = demoDataService;
  console.log('💡 Demo Data Service available at window.demoData');
  console.log('   - window.demoData.seedAll() - Seed all demo data');
  console.log('   - window.demoData.clearAll() - Clear all data');
  console.log('   - window.demoData.seedStudents() - Seed only students');
  console.log('   - window.demoData.seedStaff() - Seed only staff');
  console.log('   - And more...');
}

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
