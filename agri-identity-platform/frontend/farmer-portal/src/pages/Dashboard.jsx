import React, { useEffect, useState } from 'react';
import { Box, Typography, Container, Paper, Grid, Button, Divider, List, ListItem, ListItemText, Chip, Avatar, Alert, IconButton } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../services/api';
import SecurityIcon from '@mui/icons-material/Security';
import HistoryIcon from '@mui/icons-material/History';
import GppGoodIcon from '@mui/icons-material/GppGood';
import FolderSpecialIcon from '@mui/icons-material/FolderSpecial';
import RefreshIcon from '@mui/icons-material/Refresh';
import AgricultureIcon from '@mui/icons-material/Agriculture';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';

/* --- Premium Theme Constants --- */
const glassStyle = {
    background: 'rgba(255, 255, 255, 0.9)',
    backdropFilter: 'blur(20px)',
    borderRadius: '16px',
    boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
    border: '1px solid rgba(255, 255, 255, 0.18)',
    overflow: 'hidden',
    transition: 'transform 0.2s ease-in-out',
    '&:hover': {
        transform: 'translateY(-2px)'
    }
};

const gradientBg = 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)';
const cardHeaderBg = 'linear-gradient(90deg, #2E7D32 0%, #43A047 100%)';

const Dashboard = () => {
    const navigate = useNavigate();
    const [userData, setUserData] = useState(null);
    const [logs, setLogs] = useState([]);
    const [consents, setConsents] = useState([]);
    const [loanApps, setLoanApps] = useState([]);
    const [advisoryReqs, setAdvisoryReqs] = useState([]);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            // Parallel Fetch where possible, but safely
            const userRes = await api.get('/user/data').catch(err => {
                if (err.response?.status === 401) {
                    localStorage.removeItem('token');
                    navigate('/login');
                }
                return null;
            });
            if (userRes) setUserData(userRes.data);

            const [logsRes, consentsRes, loanRes, advRes] = await Promise.all([
                api.get('/user/logs').catch(() => ({ data: [] })),
                api.get('/oauth/active').catch(() => ({ data: [] })),
                api.get('/loan/my-applications').catch(() => ({ data: [] })),
                api.get('/crop-advisory/my-requests').catch(() => ({ data: [] }))
            ]);

            setLogs(logsRes.data);
            setConsents(consentsRes.data);
            setLoanApps(loanRes.data);
            setAdvisoryReqs(advRes.data);

        } catch (error) {
            console.error("Dashboard Fetch Error", error);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    const handleRevoke = async (id, type) => {
        if (!window.confirm("Are you sure you want to revoke access? This action cannot be undone.")) return;

        try {
            if (type === 'LOAN') {
                await api.post(`/loan/revoke/${id}?doc_id=ALL`);
                setLoanApps(prev => prev.filter(l => l.id !== id)); // Optimistic UI update
                fetchDashboardData(); // Refresh to ensure sync
            } else if (type === 'ADVISORY') {
                await api.post(`/crop-advisory/revoke/${id}`);
                setAdvisoryReqs(prev => prev.filter(r => r.id !== id));
                fetchDashboardData();
            } else if (type === 'CONSENT') {
                await api.post('/oauth/revoke', { service_id: id });
                setConsents(prev => prev.filter(c => c.service_id !== id));
            }
        } catch (error) {
            console.error("Revoke failed", error);
            alert("Failed to revoke: " + (error.response?.data?.detail || "Unknown error"));
        }
    };

    // Animation Variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 }
    };

    return (
        <Box sx={{ minHeight: '100vh', background: gradientBg, pt: 4, pb: 8 }}>
            <Container maxWidth="lg">

                {/* Header Section */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                            <Avatar sx={{ bgcolor: '#1b5e20', width: 64, height: 64, boxShadow: 3, fontSize: '1.5rem' }}>
                                {userData?.full_name?.charAt(0) || 'U'}
                            </Avatar>
                        </motion.div>
                        <Box>
                            <Typography variant="h4" component="h1" sx={{ color: '#1b5e20', fontWeight: 800 }}>
                                Farmer Portal
                            </Typography>
                            <Typography variant="subtitle1" sx={{ color: '#2e7d32', fontWeight: 500 }}>
                                Welcome back, {userData?.full_name || 'Partner'}
                            </Typography>
                        </Box>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton onClick={fetchDashboardData} color="primary" sx={{ bgcolor: 'white' }}>
                            <RefreshIcon />
                        </IconButton>
                        <Button variant="contained" color="error" onClick={handleLogout} sx={{ borderRadius: '24px', px: 3, fontWeight: 'bold' }}>
                            Logout
                        </Button>
                    </Box>
                </Box>

                <motion.div variants={containerVariants} initial="hidden" animate="visible">
                    <Grid container spacing={4}>

                        {/* Status Hero Card */}
                        <Grid item xs={12}>
                            <motion.div variants={itemVariants}>
                                <Paper sx={{
                                    p: 4,
                                    background: 'linear-gradient(120deg, #1b5e20 0%, #004d40 100%)',
                                    color: 'white',
                                    borderRadius: 4,
                                    boxShadow: '0 12px 24px rgba(27, 94, 32, 0.3)',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}>
                                    <Box>
                                        <Typography variant="h5" fontWeight="bold" gutterBottom>
                                            Secure Digital Identity Vault
                                        </Typography>
                                        <Typography variant="body1" sx={{ opacity: 0.9 }}>
                                            You are in full control. Active consents: <strong>{consents.length}</strong>.
                                        </Typography>
                                    </Box>
                                    <GppGoodIcon sx={{ fontSize: 80, opacity: 0.8 }} />
                                </Paper>
                            </motion.div>
                        </Grid>

                        {/* Identity Attributes (Full Width) */}
                        <Grid item xs={12}>
                            <motion.div variants={itemVariants}>
                                <Paper sx={{ ...glassStyle, p: 3 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                        <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#1b5e20', fontWeight: 'bold' }}>
                                            <SecurityIcon /> My Attributes
                                        </Typography>
                                        <Button
                                            size="small"
                                            variant="outlined"
                                            color="primary"
                                            startIcon={<FolderSpecialIcon />}
                                            onClick={() => navigate('/documents')}
                                            sx={{ borderRadius: 2 }}
                                        >
                                            Document Vault
                                        </Button>
                                    </Box>
                                    <Divider sx={{ mb: 2 }} />
                                    <Grid container spacing={2}>
                                        {userData && Object.entries(userData).map(([key, value]) => {
                                            if (['attributes', 'id', 'hashed_password'].includes(key)) return null;
                                            return (
                                                <Grid item xs={12} sm={6} md={3} key={key}>
                                                    <Box sx={{ p: 1.5, bgcolor: '#f1f8e9', borderRadius: 2 }}>
                                                        <Typography variant="caption" color="textSecondary" sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>
                                                            {key.replace(/_/g, ' ')}
                                                        </Typography>
                                                        <Typography variant="body1" fontWeight="600" color="#2e7d32">
                                                            {value || 'N/A'}
                                                        </Typography>
                                                    </Box>
                                                </Grid>
                                            );
                                        })}
                                    </Grid>
                                </Paper>
                            </motion.div>
                        </Grid>

                        {/* Services Grid: Loans & Advisory Side-by-Side */}
                        <Grid item xs={12} md={6}>
                            <motion.div variants={itemVariants} style={{ height: '100%' }}>
                                <Paper sx={{ ...glassStyle, p: 0, height: '100%' }}>
                                    <Box sx={{ p: 2, background: cardHeaderBg, color: 'white' }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <AccountBalanceIcon /> My Loans
                                            </Typography>
                                            <Button
                                                variant="contained"
                                                color="warning"
                                                sx={{ fontWeight: 'bold', px: 3, boxShadow: 2 }}
                                                size="small"
                                                onClick={() => navigate('/loan/apply')}
                                            >
                                                + Apply
                                            </Button>
                                        </Box>
                                    </Box>

                                    <List sx={{ p: 0 }}>
                                        {loanApps.length === 0 ? (
                                            <Box sx={{ p: 4, textAlign: 'center' }}>
                                                <Typography color="textSecondary">No active applications.</Typography>
                                            </Box>
                                        ) : loanApps.map((app) => (
                                            <ListItem key={app.id} sx={{ borderBottom: '1px solid #eee', flexDirection: 'column', alignItems: 'stretch', p: 2 }}>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', mb: 1 }}>
                                                    <Typography fontWeight="bold" color="#333">Loan Application #{app.id}</Typography>
                                                    <Chip
                                                        label={app.status}
                                                        size="small"
                                                        color={app.status === 'APPROVED' ? 'success' : app.status === 'REJECTED' ? 'error' : 'warning'}
                                                        sx={{ fontWeight: 'bold' }}
                                                    />
                                                </Box>
                                                <Typography variant="caption" color="textSecondary">{new Date(app.created_at).toLocaleDateString()}</Typography>

                                                {(app.status === 'PENDING' || app.status === 'REQUEST_DOC') && (
                                                    <Button size="small" color="error" variant="outlined" sx={{ mt: 1, alignSelf: 'flex-start' }} onClick={() => handleRevoke(app.id, 'LOAN')}>
                                                        Withraw Application
                                                    </Button>
                                                )}
                                            </ListItem>
                                        ))}
                                    </List>
                                </Paper>
                            </motion.div>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <motion.div variants={itemVariants} style={{ height: '100%' }}>
                                <Paper sx={{ ...glassStyle, p: 0, height: '100%' }}>
                                    <Box sx={{ p: 2, background: 'linear-gradient(90deg, #00695c 0%, #00897b 100%)', color: 'white' }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <AgricultureIcon /> Crop Advisory
                                            </Typography>
                                            <Button
                                                variant="contained"
                                                color="warning"
                                                sx={{ fontWeight: 'bold', px: 3, boxShadow: 2 }}
                                                size="small"
                                                onClick={() => navigate('/crop-advisory/apply')}
                                            >
                                                + New Request
                                            </Button>
                                        </Box>
                                    </Box>

                                    <List sx={{ p: 0 }}>
                                        {advisoryReqs.length === 0 ? (
                                            <Box sx={{ p: 4, textAlign: 'center' }}>
                                                <Typography color="textSecondary">No advisory requests.</Typography>
                                            </Box>
                                        ) : advisoryReqs.map((req) => (
                                            <ListItem key={req.id} sx={{ borderBottom: '1px solid #eee', flexDirection: 'column', alignItems: 'stretch', p: 2 }}>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', mb: 1 }}>
                                                    <Typography fontWeight="bold" color="#333">{req.crop_name} <Typography component="span" variant="caption">({req.season})</Typography></Typography>
                                                    <Chip
                                                        label={req.status}
                                                        size="small"
                                                        sx={{ bgcolor: req.status === 'ADVISED' ? '#e0f2f1' : '#fff3e0', color: req.status === 'ADVISED' ? '#00695c' : '#e65100', fontWeight: 'bold' }}
                                                    />
                                                </Box>

                                                {req.status === 'PENDING' && (
                                                    <Button size="small" color="error" variant="outlined" sx={{ mt: 1, alignSelf: 'flex-start' }} onClick={() => handleRevoke(req.id, 'ADVISED')}>
                                                        Withraw Request
                                                    </Button>
                                                )}

                                                {req.status === 'ADVISED' && (
                                                    <Alert severity="success" icon={<AgricultureIcon />} sx={{ mt: 1 }}>
                                                        <Typography variant="subtitle2" fontWeight="bold">Expert Advice:</Typography>
                                                        <Typography variant="body2">{req.recommendation}</Typography>
                                                    </Alert>
                                                )}
                                            </ListItem>
                                        ))}
                                    </List>
                                </Paper>
                            </motion.div>
                        </Grid>

                        {/* Recent Activity Logs */}
                        <Grid item xs={12}>
                            <motion.div variants={itemVariants}>
                                <Paper sx={{ ...glassStyle, p: 3 }}>
                                    <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#1565c0', fontWeight: 'bold' }}>
                                        <HistoryIcon /> Recent Activity Log
                                    </Typography>
                                    <List>
                                        {logs.slice(0, 5).map((log) => (
                                            <ListItem key={log.id} sx={{ py: 1, px: 0 }}>
                                                <ListItemText
                                                    primary={<Typography variant="subtitle2" fontWeight="bold">{log.service_name} <span style={{ fontWeight: 'normal', color: '#666' }}>— {log.action}</span></Typography>}
                                                    secondary={`${new Date(log.timestamp).toLocaleString()} • ${log.details}`}
                                                />
                                            </ListItem>
                                        ))}
                                        {logs.length === 0 && <Typography variant="body2" color="textSecondary">No recent activity.</Typography>}
                                    </List>
                                </Paper>
                            </motion.div>
                        </Grid>

                    </Grid>
                </motion.div>
            </Container>
        </Box>
    );
};

export default Dashboard;
