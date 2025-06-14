import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { SignPage } from './pages/SignPage';
import { SuccessPage } from './pages/SuccessPage';
import { DemoPage } from './pages/DemoPage';
import { NotFoundPage } from './pages/NotFoundPage';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Redirect root to demo page */}
          <Route path="/" element={<Navigate to="/demo" replace />} />
          
          {/* Demo page with all offers */}
          <Route path="/demo" element={<DemoPage />} />
          
          {/* Sign page route */}
          <Route path="/sign/:slug" element={<SignPage />} />
          
          {/* Success page route */}
          <Route path="/success" element={<SuccessPage />} />
          
          {/* Catch all - redirect to demo */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
        
        {/* Global toast notifications */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#ffffff',
              color: '#1f2937',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
              border: '1px solid #e5e7eb',
              borderRadius: '12px',
              padding: '16px',
            },
            success: {
              iconTheme: {
                primary: '#10b981',
                secondary: '#ffffff',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#ffffff',
              },
            },
          }}
        />
      </div>
    </Router>
  );
}

export default App;
