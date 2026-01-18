
import React, { useState, useEffect } from 'react';
import { Box, Container, Typography, TextField, Button, Paper, Avatar } from '@mui/material';
import { motion } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import { toast } from 'react-toastify';

const AdminLoginPage = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const serviceType = searchParams.get('service') || 'LOAN'; // Default to LOAN

    const [formData, setFormData] = useState({ username: '', password: '' });
    const [loading, setLoading] = useState(false);

    const isAdvisory = serviceType === 'ADVISORY';

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Using the same endpoint for now, assuming shared Admin table or Logic in backend
            // In a real microservice, endpoints would differ. 
            // Our backend `loan.py` has the admin login endpoint.
            const res = await api.post('/loan/admin/login', formData);

            localStorage.setItem('token', res.data.access_token);
            // Optionally store service type to help generic underlying components
            localStorage.setItem('admin_service_type', serviceType);

            toast.success(`${isAdvisory ? 'Advisory' : 'Loan'} Admin Login Successful`);

            if (isAdvisory) {
                navigate('/admin/advisory/dashboard');
            } else {
                navigate('/admin/loan/dashboard');
            }

        } catch (error) {
            setLoading(false);
            toast.error("Invalid Admin Credentials");
        }
    };

    return (
        <Box sx={{
            minHeight: '100vh',
            // Match Farmer Theme as requested
            background: 'linear-gradient(135deg, #1b5e20 0%, #43a047 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        }}>
            <Container maxWidth="xs">
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                    <Paper sx={{ p: 4, borderRadius: 4, textAlign: 'center' }}>
                        <Avatar sx={{ width: 56, height: 56, bgcolor: 'primary.main', margin: '0 auto', mb: 2 }}>
                            <SupervisorAccountIcon />
                        </Avatar>

                        <Typography variant="h5" fontWeight="700" color="primary.main" gutterBottom>
                            {isAdvisory ? 'Crop Advisory Admin' : 'Loan Officer Portal'}
                        </Typography>
                        <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
                            Please sign in to access your dashboard.
                        </Typography>

                        <form onSubmit={handleLogin}>
                            <TextField
                                fullWidth
                                margin="normal"
                                label="Username"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                required
                            />
                            <TextField
                                fullWidth
                                margin="normal"
                                label="Password"
                                name="password"
                                type="password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                            />
                            <Button
                                fullWidth
                                type="submit"
                                variant="contained"
                                color="primary"
                                size="large"
                                disabled={loading}
                                sx={{ mt: 3, mb: 2, borderRadius: 2 }}
                            >
                                {loading ? 'Logging in...' : 'Sign In'}
                            </Button>
                        </form>
                        <Button onClick={() => navigate('/')} sx={{ mt: 1 }}>
                            Back to Home
                        </Button>
                    </Paper>
                </motion.div>
            </Container>
        </Box>
    );
};

export default AdminLoginPage;
