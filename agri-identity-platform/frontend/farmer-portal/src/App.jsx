import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Dashboard from './pages/Dashboard';
import AuthorizePage from './pages/AuthorizePage';
import Marketplace from './pages/Marketplace';
import DocumentVault from './pages/DocumentVault';
import LoanApplicationPage from './pages/LoanApplicationPage';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminDashboard from './pages/AdminDashboard';
import CropAdvisoryPage from './pages/CropAdvisoryPage';

// Simple Protected Route
const ProtectedRoute = ({ children }) => {
    const token = localStorage.getItem('token');
    if (!token) {
        return <Navigate to="/login" replace />;
    }
    return children;
};

const App = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/authorize" element={<AuthorizePage />} />

                <Route
                    path="/marketplace"
                    element={
                        <ProtectedRoute>
                            <Marketplace />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/documents"
                    element={
                        <ProtectedRoute>
                            <DocumentVault />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/loan/apply"
                    element={
                        <ProtectedRoute>
                            <LoanApplicationPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/crop-advisory/apply"
                    element={
                        <ProtectedRoute>
                            <CropAdvisoryPage />
                        </ProtectedRoute>
                    }
                />

                {/* Admin Routes */}
                <Route path="/admin/login" element={<AdminLoginPage />} />
                <Route
                    path="/admin/dashboard"
                    element={
                        <ProtectedRoute>
                            <AdminDashboard />
                        </ProtectedRoute>
                    }
                />

                {/* Protected Routes */}
                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute>
                            <Dashboard />
                        </ProtectedRoute>
                    }
                />

                {/* Default Redirect */}
                <Route path="/" element={<Navigate to="/login" replace />} />
            </Routes>
        </BrowserRouter>
    );
};

export default App;
