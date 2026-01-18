
import React, { useState } from 'react';
import {
    Box, Container, Typography, TextField, Button, Paper, Grid, SvgIcon,
    Stepper, Step, StepLabel, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import AgricultureIcon from '@mui/icons-material/Agriculture';
import { toast } from 'react-toastify';

const RegisterPage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    // Form Data
    const [formData, setFormData] = useState({
        full_name: '',
        phone_number: '',
        email: '',
        password: '',
    });

    // OTP State
    const [showOtpDialog, setShowOtpDialog] = useState(false);
    const [otp, setOtp] = useState('');
    const [verifying, setVerifying] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const payload = {
                full_name: formData.full_name,
                phone_number: formData.phone_number,
                email: formData.email,
                password: formData.password
            };

            // 1. Register -> Sends OTP
            const res = await api.post('/auth/register', payload);
            setLoading(false);
            toast.success("Account created! Please check your email for OTP.");
            setShowOtpDialog(true);

        } catch (error) {
            setLoading(false);
            toast.error(error.response?.data?.detail || "Registration failed");
        }
    };

    const handleVerifyOtp = async () => {
        setVerifying(true);
        try {
            // Using correct query parameters as expected by Backend
            await api.post('/auth/verify-registration-otp', null, {
                params: {
                    phone_number: formData.phone_number,
                    otp: otp
                }
            });
            // Result is Token
            // Login successful
            toast.success("Verification successful! Please Login.");
            // We can also auto-login, but typically we redirect to login for security or clarity
            navigate('/login');
        } catch (error) {
            setVerifying(false);
            toast.error(error.response?.data?.detail || "Invalid OTP");
        }
    };

    return (
        <>
            <Box sx={{
                minHeight: '100vh',
                background: 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                py: 4
            }}>
                <Container maxWidth="sm">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                        <Paper sx={{ p: 4, borderRadius: 4, boxShadow: '0 8px 32px rgba(46, 125, 50, 0.1)' }}>
                            <Box sx={{ textAlign: 'center', mb: 3 }}>
                                <AgricultureIcon sx={{ fontSize: 50, color: 'primary.main', mb: 1 }} />
                                <Typography variant="h3" fontWeight="800" color="primary.main" gutterBottom>
                                    KhetiSahay
                                </Typography>
                                <Typography variant="h5" fontWeight="600" color="primary.dark">
                                    Join AgriID (Agri-Identity)
                                </Typography>
                                <Typography variant="body1" color="textSecondary">
                                    Create your secure farmer identity
                                </Typography>
                            </Box>

                            <form onSubmit={handleSubmit}>
                                <Grid container spacing={2}>
                                    {/* Basic Info */}
                                    <Grid item xs={12}>
                                        <TextField fullWidth label="Full Name" name="full_name" required onChange={handleChange} />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField fullWidth label="Phone Number" name="phone_number" required onChange={handleChange} />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField fullWidth label="Email Address" name="email" type="email" required onChange={handleChange} />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <TextField fullWidth label="Password" name="password" type="password" required onChange={handleChange} />
                                    </Grid>

                                    <Grid item xs={12} sx={{ mt: 2 }}>
                                        <Button
                                            type="submit"
                                            fullWidth
                                            variant="contained"
                                            size="large"
                                            disabled={loading}
                                            sx={{ borderRadius: 2, height: 48, fontSize: '1.1rem' }}
                                        >
                                            {loading ? <CircularProgress size={24} color="inherit" /> : 'Create Account'}
                                        </Button>
                                    </Grid>
                                </Grid>
                            </form>

                            <Box sx={{ textAlign: 'center', mt: 3 }}>
                                <Link to="/login" style={{ textDecoration: 'none' }}>
                                    <Typography variant="body2" color="primary" sx={{ fontWeight: 500 }}>
                                        Already have an account? Sign in
                                    </Typography>
                                </Link>
                            </Box>
                        </Paper>
                    </motion.div>
                </Container>
            </Box>

            {/* OTP Dialog */}
            <Dialog open={showOtpDialog} disableEscapeKeyDown>
                <DialogTitle>Verify Email</DialogTitle>
                <DialogContent>
                    <Typography variant="body2" sx={{ mb: 2 }}>
                        We sent a code to {formData.email}. Please enter it below.
                    </Typography>
                    <TextField
                        autoFocus
                        fullWidth
                        label="OTP Code from Email"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleVerifyOtp} disabled={verifying} variant="contained">
                        {verifying ? 'Verifying...' : 'Verify & Login'}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default RegisterPage;
