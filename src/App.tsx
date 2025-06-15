import { 
  Route, 
  Navigate,
  createRoutesFromElements,
  createBrowserRouter,
  RouterProvider,
  Outlet
} from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { SignPage } from './pages/SignPage';
import { SuccessPage } from './pages/SuccessPage';
import { OffersPage } from './pages/OffersPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { Header } from './components/Header';
import { Footer } from './components/Footer';

// Root layout component that includes common UI elements
function RootLayout() {
  return (
    <div className="App min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        <Outlet /> {/* This is where nested routes will render */}
      </main>
      
      <Footer />
      
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
  );
}

// Create router with supported future flags to address warnings
const router = createBrowserRouter(
  createRoutesFromElements(
    <Route element={<RootLayout />}>
      {/* Redirect root to offers page */}
      <Route path="/" element={<Navigate to="/offers" replace />} />
      
      {/* Offers page with all available offers */}
      <Route path="/offers" element={<OffersPage />} />
      
      {/* Support old demo route for backward compatibility */}
      <Route path="/demo" element={<Navigate to="/offers" replace />} />
      
      {/* Sign page route */}
      <Route path="/sign/:slug" element={<SignPage />} />
      
      {/* Success page route */}
      <Route path="/success" element={<SuccessPage />} />
      
      {/* Catch all - redirect to offers page */}
      <Route path="*" element={<NotFoundPage />} />
    </Route>
  ),
  {
    // Set compatible future flags for React Router DOM 6.28.0
    future: {
      v7_fetcherPersist: true,
      v7_normalizeFormMethod: true,
      v7_relativeSplatPath: true,
      // v7_partialHydration: true, // Skip as it's likely not needed in this app
    }
  }
);

function App() {
  return (
    <RouterProvider 
      router={router}
      future={{
        v7_startTransition: true,
      }} 
    />
  );
}

export default App;
