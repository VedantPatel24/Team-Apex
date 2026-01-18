import React, { useState } from 'react';
import { Box, Container, Typography, TextField, Button, Paper, Avatar, InputAdornment, IconButton, Tabs, Tab, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { motion } from 'framer-motion';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import api from '../services/api';
import LockIcon from '@mui/icons-material/Lock';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { toast } from 'react-toastify';

const LoginPage = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const returnTo = searchParams.get('return_to');

    const [tabIndex, setTabIndex] = useState(0); // 0 = Farmer, 1 = Admin
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // Form Data
    const [formData, setFormData] = useState({
        username: '', // Phone for farmer
        password: '',
        serviceType: 'LOAN' // For Admin: LOAN or ADVISORY
    });

    const isFarmer = tabIndex === 0;

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (isFarmer) {
                // --- FARMER LOGIN ---
                const params = new URLSearchParams();

                // Simple validation for farmer phone
                if (!formData.username) {
                    toast.error("Please enter your Phone Number");
                    setLoading(false);
                    return;
                }

                params.append('username', formData.username); // Phone number
                params.append('password', formData.password);

                const res = await api.post('/auth/login', params, {
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
                });

                localStorage.setItem('token', res.data.access_token);
                localStorage.setItem('user_type', 'farmer');

                toast.success("Welcome back, Farmer!");

                if (returnTo) {
                    window.location.href = decodeURIComponent(returnTo);
                } else {
                    navigate('/dashboard');
                }

            } else {
                // --- ADMIN LOGIN ---
                // Auto-map username based on selected domain
                const adminUsername = formData.serviceType === 'ADVISORY' ? 'AGRI_ADVISOR_001' : 'loan_admin';

                const res = await api.post('/loan/admin/login', {
                    username: adminUsername,
                    password: formData.password
                });

                localStorage.setItem('token', res.data.access_token);
                localStorage.setItem('user_type', 'admin');

                // Determine redirect based on Selected Service Type
                if (formData.serviceType === 'ADVISORY') {
                    toast.success("Welcome to Advisory Portal");
                    navigate('/admin/advisory/dashboard');
                } else {
                    toast.success("Welcome to Loan Portal");
                    navigate('/admin/loan/dashboard');
                }
            }

        } catch (error) {
            setLoading(false);
            console.error("Login Error:", error);
            const msg = error.response?.data?.detail || "Invalid credentials";
            toast.error(msg);
        }
    };

    return (
        <Box sx={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #1b5e20 0%, #43a047 100%)', // Premium Green Gradient
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        }}>
            <Container maxWidth="xs">
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                    <Paper sx={{
                        p: 4,
                        borderRadius: 4,
                        boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
                        textAlign: 'center',
                        background: 'rgba(255, 255, 255, 0.95)',
                        backdropFilter: 'blur(10px)'
                    }}>

                        <Avatar sx={{
                            width: 64,
                            height: 64,
                            bgcolor: isFarmer ? '#2e7d32' : '#00695c',
                            margin: '0 auto',
                            mb: 2,
                            boxShadow: 2
                        }}>
                            {isFarmer ? <LockIcon fontSize="large" /> : <SupervisorAccountIcon fontSize="large" />}
                        </Avatar>

                        <Typography variant="h4" fontWeight="800" sx={{ color: '#2e7d32', mb: 0 }}>
                            KhetiSahay
                        </Typography>
                        <Typography variant="h6" fontWeight="bold" sx={{ color: isFarmer ? '#1b5e20' : '#004d40' }} gutterBottom>
                            {isFarmer ? 'Farmer Portal' : 'Admin Console'}
                        </Typography>

                        {/* TABS */}
                        <Tabs
                            value={tabIndex}
                            onChange={(e, v) => setTabIndex(v)}
                            centered
                            variant="fullWidth"
                            sx={{
                                mb: 3,
                                borderBottom: 1,
                                borderColor: 'divider',
                                '& .MuiTab-root': { fontWeight: 'bold' },
                                '& .Mui-selected': { color: isFarmer ? '#2e7d32' : '#00695c' },
                                '& .MuiTabs-indicator': { backgroundColor: isFarmer ? '#2e7d32' : '#00695c' }
                            }}
                        >
                            <Tab label="Farmer Login" />
                            <Tab label="Admin Access" />
                        </Tabs>

                        <form onSubmit={handleLogin}>

                            {/* Admin Service Selector */}
                            {!isFarmer && (
                                <FormControl fullWidth margin="normal" size="small" variant="outlined">
                                    <InputLabel>Select Domain</InputLabel>
                                    <Select
                                        label="Select Domain"
                                        name="serviceType"
                                        value={formData.serviceType}
                                        onChange={handleChange}
                                        sx={{ borderRadius: 2 }}
                                    >
                                        <MenuItem value="LOAN">Agricultural Loans</MenuItem>
                                        <MenuItem value="ADVISORY">Crop Advisory Services</MenuItem>
                                    </Select>
                                </FormControl>
                            )}

                            {/* Username Field - Only for Farmer */}
                            {isFarmer && (
                                <TextField
                                    fullWidth
                                    margin="normal"
                                    label="Phone Number"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleChange}
                                    required
                                    autoFocus
                                    InputProps={{ sx: { borderRadius: 2 } }}
                                />
                            )}

                            <TextField
                                fullWidth
                                margin="normal"
                                label="Password"
                                name="password"
                                type={showPassword ? 'text' : 'password'}
                                value={formData.password}
                                onChange={handleChange}
                                required
                                InputProps={{
                                    sx: { borderRadius: 2 },
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                onClick={() => setShowPassword(!showPassword)}
                                                edge="end"
                                            >
                                                {showPassword ? <VisibilityOff /> : <Visibility />}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                            />

                            <Button
                                fullWidth
                                type="submit"
                                variant="contained"
                                size="large"
                                disabled={loading}
                                sx={{
                                    mt: 3,
                                    mb: 2,
                                    borderRadius: 3,
                                    height: 48,
                                    bgcolor: isFarmer ? '#2e7d32' : '#00695c',
                                    '&:hover': { bgcolor: isFarmer ? '#1b5e20' : '#004d40' },
                                    fontWeight: 'bold',
                                    fontSize: '1rem'
                                }}
                            >
                                {loading ? 'Authenticating...' : (isFarmer ? 'Login Securely' : 'Access Dashboard')}
                            </Button>
                        </form>

                        {isFarmer && (
                            <Box sx={{ mt: 2 }}>
                                <Link to="/register" style={{ textDecoration: 'none' }}>
                                    <Typography variant="body2" color="primary" sx={{ fontWeight: 500 }}>
                                        New here? Create an Account
                                    </Typography>
                                </Link>
                            </Box>
                        )}

                    </Paper>
                </motion.div>
            </Container>
        </Box>
    );
};

export default LoginPage;
