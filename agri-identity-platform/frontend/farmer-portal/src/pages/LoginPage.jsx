
import React, { useState } from 'react';
import { Box, Container, Typography, TextField, Button, Paper, Avatar, InputAdornment, IconButton } from '@mui/material';
import { motion } from 'framer-motion';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import api from '../services/api';
import LockIcon from '@mui/icons-material/Lock';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { toast } from 'react-toastify';

const LoginPage = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const returnTo = searchParams.get('return_to');

    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const [formData, setFormData] = useState({
        phone_number: '',
        password: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Backend expects 'username' and 'password' in x-www-form-urlencoded
            const params = new URLSearchParams();
            params.append('username', formData.phone_number);
            params.append('password', formData.password);

            const res = await api.post('/auth/login', params, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });

            // Store Token
            localStorage.setItem('token', res.data.access_token);
            toast.success("Welcome back!");

            if (returnTo) {
                window.location.href = decodeURIComponent(returnTo);
            } else {
                navigate('/dashboard');
            }
        } catch (error) {
            setLoading(false);
            console.error("Login Error:", error);
            toast.error(error.response?.data?.detail || "Invalid phone number or password");
        }
    };

    return (
        <Box sx={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        }}>
            <Container maxWidth="xs">
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                    <Paper sx={{ p: 4, borderRadius: 4, boxShadow: '0 8px 32px rgba(46, 125, 50, 0.1)', textAlign: 'center' }}>
                        <Avatar sx={{ width: 56, height: 56, bgcolor: 'primary.main', margin: '0 auto', mb: 2 }}>
                            <LockIcon />
                        </Avatar>

                        <Typography variant="h5" fontWeight="700" color="primary.dark" gutterBottom>
                            Farmer Login
                        </Typography>

                        <form onSubmit={handleLogin}>
                            <TextField
                                fullWidth
                                margin="normal"
                                label="Phone Number"
                                name="phone_number"
                                value={formData.phone_number}
                                onChange={handleChange}
                                required
                                autoFocus
                            />
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
                                sx={{ mt: 3, mb: 2, borderRadius: 2 }}
                            >
                                {loading ? 'Logging in...' : 'Login'}
                            </Button>
                        </form>

                        <Box sx={{ mt: 2 }}>
                            <Link to="/register" style={{ textDecoration: 'none' }}>
                                <Typography variant="body2" color="primary">
                                    New here? Create an Account
                                </Typography>
                            </Link>
                        </Box>

                    </Paper>
                </motion.div>
            </Container>
        </Box>
    );
};

export default LoginPage;
