import React from 'react';
import ReactDOM from 'react-dom/client';
import '@fortawesome/fontawesome-free/css/all.min.css';
import './index.css';
import App from './App';

// Initialize demo data on first load (only in development mode and if no data exists)
if (process.env.NODE_ENV === 'development') {
  import('./services/demoDataService').then((demoDataServiceModule) => {
    import('./services/api').then((apiServiceModule) => {
      const demoDataService = demoDataServiceModule.default;
      const apiService = apiServiceModule.default;
      
      const initializeDemoData = async (): Promise<void> => {
        try {
          // Check if any data exists
          const hasStudents = await apiService.hasData('students');
          const hasStaff = await apiService.hasData('staff');
          const hasClasses = await apiService.hasData('classes');
          
          // Only seed if no data exists
          if (!hasStudents && !hasStaff && !hasClasses) {
            await demoDataService.seedAll();
          }
        } catch (error) {
          // Silently fail - don't block app loading
        }
      };
      
      initializeDemoData();
      
      // Expose demo data service to window for development debugging
      if (typeof window !== 'undefined') {
        (window as any).demoData = demoDataService;
        
        // Import password generation utility
        import('./utils/generateExistingPasswords').then(({ generatePasswordsForAllExisting }) => {
          (window as any).generatePasswords = generatePasswordsForAllExisting;
        });
      }
    });
  });
}

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
