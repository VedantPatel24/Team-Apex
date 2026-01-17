import React, { useState, useEffect } from 'react';
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

    const [step, setStep] = useState(1); // 1 = Creds, 2 = OTP
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const [formData, setFormData] = useState({
        phone_number: '',
        password: '',
        otp: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleLoginInit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await api.post('/auth/login-init', {
                phone_number: formData.phone_number,
                password: formData.password
            });

            if (res.data.require_otp) {
                setStep(2);
                toast.info("OTP sent to your email!");
                setLoading(false);
            } else {
                // Unexpected direct login? (Maybe enabled later)
                toast.error("Unexpected response");
                setLoading(false);
            }
        } catch (error) {
            setLoading(false);
            toast.error(error.response?.data?.detail || "Login failed");
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await api.post('/auth/login-verify', null, {
                params: {
                    phone_number: formData.phone_number,
                    otp: formData.otp
                }
            });

            localStorage.setItem('token', res.data.access_token);
            toast.success("Welcome back!");

            if (returnTo) {
                window.location.href = decodeURIComponent(returnTo);
            } else {
                navigate('/dashboard');
            }
        } catch (error) {
            setLoading(false);
            toast.error(error.response?.data?.detail || "Invalid OTP");
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
                            {step === 1 ? 'Farmer Login' : 'Verify Identity'}
                        </Typography>

                        {step === 1 ? (
                            <form onSubmit={handleLoginInit}>
                                <TextField
                                    fullWidth
                                    margin="normal"
                                    label="Phone Number"
                                    name="phone_number"
                                    value={formData.phone_number}
                                    onChange={handleChange}
                                    required
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
                                    {loading ? 'Sending OTP...' : 'Login'}
                                </Button>
                            </form>
                        ) : (
                            <form onSubmit={handleVerifyOtp}>
                                <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                                    Enter the code sent to your email.
                                </Typography>
                                <TextField
                                    fullWidth
                                    margin="normal"
                                    label="Enter OTP"
                                    name="otp"
                                    value={formData.otp}
                                    onChange={handleChange}
                                    required
                                    autoFocus
                                />
                                <Button
                                    fullWidth
                                    type="submit"
                                    variant="contained"
                                    size="large"
                                    disabled={loading}
                                    sx={{ mt: 3, mb: 2, borderRadius: 2 }}
                                >
                                    {loading ? 'Verifying...' : 'Verify Login'}
                                </Button>
                                <Button size="small" onClick={() => setStep(1)}>
                                    Back
                                </Button>
                            </form>
                        )}

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
