
import React, { useState } from 'react';
import { Box, Container, Typography, TextField, Button, Paper, Avatar } from '@mui/material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import { toast } from 'react-toastify';

const AdminLoginPage = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ username: '', password: '' });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await api.post('/loan/admin/login', formData);

            // Store Admin Token (maybe use a different key or handle consistently)
            // For hackathon simplicity, we might just use 'token' but that overwrites farmer token.
            // Let's use 'admin_token' and make sure API client handles it?
            // Or just overwrite 'token' and assume user is now Admin.
            // The API logic checks scopes usually.
            localStorage.setItem('token', res.data.access_token);

            toast.success("Admin Login Successful");
            navigate('/admin/dashboard');
        } catch (error) {
            setLoading(false);
            toast.error("Invalid Admin Credentials");
        }
    };

    return (
        <Box sx={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #1a237e 0%, #283593 100%)', // Different color for Admin
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        }}>
            <Container maxWidth="xs">
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                    <Paper sx={{ p: 4, borderRadius: 4, textAlign: 'center' }}>
                        <Avatar sx={{ width: 56, height: 56, bgcolor: 'secondary.main', margin: '0 auto', mb: 2 }}>
                            <SupervisorAccountIcon />
                        </Avatar>

                        <Typography variant="h5" fontWeight="700" color="secondary.main" gutterBottom>
                            Loan Officer Login
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
                                color="secondary"
                                size="large"
                                disabled={loading}
                                sx={{ mt: 3, mb: 2, borderRadius: 2 }}
                            >
                                {loading ? 'Logging in...' : 'Login'}
                            </Button>
                        </form>
                    </Paper>
                </motion.div>
            </Container>
        </Box>
    );
};

export default AdminLoginPage;
