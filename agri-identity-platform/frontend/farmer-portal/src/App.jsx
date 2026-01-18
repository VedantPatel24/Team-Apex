import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Dashboard from './pages/Dashboard';
import AuthorizePage from './pages/AuthorizePage';
import Marketplace from './pages/Marketplace';
import DocumentVault from './pages/DocumentVault';
import LoanApplicationPage from './pages/LoanApplicationPage';
import LoanAdminDashboard from './pages/LoanAdminDashboard';
import AdvisoryAdminDashboard from './pages/AdvisoryAdminDashboard';
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

                {/* Unified Login */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/" element={<Navigate to="/login" replace />} />

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

                {/* Distinct Admin Dashboards */}
                <Route
                    path="/admin/loan/dashboard"
                    element={
                        <ProtectedRoute>
                            <LoanAdminDashboard />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/admin/advisory/dashboard"
                    element={
                        <ProtectedRoute>
                            <AdvisoryAdminDashboard />
                        </ProtectedRoute>
                    }
                />

                {/* Farmer Dashboard */}
                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute>
                            <Dashboard />
                        </ProtectedRoute>
                    }
                />

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    );
};

export default App;
