import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Booking from './pages/Booking';
import Contact from './pages/Contact';
import Admin from './pages/Admin';
import StaffDashboard from './pages/StaffDashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import ClientDashboard from './pages/ClientDashboard';
import { AuthProvider } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <AuthProvider>
      <Router>
        <ScrollToTop />
        <div className="flex flex-col min-h-screen bg-[#0F0F0F]">
          <Toaster 
            position="top-center"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#1A1A1A',
                color: '#FFD700',
                border: '1px solid #FFD700'
              }
            }}
          />
          <Navbar />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/booking" element={<Booking />} />
              <Route path="/contact" element={<Contact />} />
              
              {/* Admin & Manager Dashboard */}
              <Route 
                path="/admin" 
                element={
                  <ProtectedRoute allowedRoles={['admin', 'manager']}>
                    <Admin />
                  </ProtectedRoute>
                } 
              />
              
              {/* Staff Dashboard */}
              <Route 
                path="/staff" 
                element={
                  <ProtectedRoute allowedRoles={['staff', 'admin', 'manager']}>
                    <StaffDashboard />
                  </ProtectedRoute>
                } 
              />
              
              {/* Client Dashboard */}
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute allowedRoles={['client', 'admin', 'manager', 'staff']}>
                    <ClientDashboard />
                  </ProtectedRoute>
                } 
              />
              
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
