import React from 'react';
import { Box, Container, Typography, Grid, Paper, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import AgricultureIcon from '@mui/icons-material/Agriculture';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import ScienceIcon from '@mui/icons-material/Science';

const LandingPage = () => {
    const navigate = useNavigate();

    const portals = [
        {
            title: "Farmer Portal",
            desc: "Access your digital identity, loans, and advisory services.",
            icon: <AgricultureIcon sx={{ fontSize: 60, color: 'primary.main' }} />,
            action: () => navigate('/login'),
            color: '#e8f5e9'
        },
        {
            title: "Agricultural Loan Auth",
            desc: "Admin portal for Loan Officers to review applications.",
            icon: <AccountBalanceIcon sx={{ fontSize: 60, color: 'orange' }} />,
            action: () => navigate('/admin/login?service=LOAN'),
            color: '#fff3e0'
        },
        {
            title: "Crop Advisory Expert",
            desc: "Admin portal for Agronomists to provide crop advice.",
            icon: <ScienceIcon sx={{ fontSize: 60, color: 'teal' }} />,
            action: () => navigate('/admin/login?service=ADVISORY'),
            color: '#e0f2f1'
        }
    ];

    return (
        <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', background: 'linear-gradient(135deg, #1b5e20 0%, #43a047 100%)' }}>
            <Container maxWidth="lg">
                <Box sx={{ textAlign: 'center', mb: 8, color: 'white' }}>
                    <Typography variant="h2" fontWeight="bold" gutterBottom>
                        Agri-Identity Platform
                    </Typography>
                    <Typography variant="h5">
                        Secure, Consent-Based Agricultural Services
                    </Typography>
                </Box>

                <Grid container spacing={4} justifyContent="center">
                    {portals.map((p, index) => (
                        <Grid item xs={12} md={4} key={index}>
                            <Paper
                                elevation={6}
                                sx={{
                                    p: 4,
                                    height: '100%',
                                    textAlign: 'center',
                                    borderRadius: 4,
                                    cursor: 'pointer',
                                    transition: 'transform 0.2s',
                                    backgroundColor: p.color,
                                    '&:hover': { transform: 'scale(1.05)' }
                                }}
                                onClick={p.action}
                            >
                                <Box sx={{ mb: 3 }}>{p.icon}</Box>
                                <Typography variant="h5" fontWeight="bold" gutterBottom color="textPrimary">
                                    {p.title}
                                </Typography>
                                <Typography variant="body1" color="textSecondary" sx={{ mb: 3 }}>
                                    {p.desc}
                                </Typography>
                                <Button variant="contained" color="primary" fullWidth size="large" sx={{ borderRadius: 2 }}>
                                    Enter Portal
                                </Button>
                            </Paper>
                        </Grid>
                    ))}
                </Grid>
            </Container>
        </Box>
    );
};

export default LandingPage;
