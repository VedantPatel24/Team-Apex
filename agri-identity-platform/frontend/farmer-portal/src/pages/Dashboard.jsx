import React, { useEffect, useState } from 'react';
import { Box, Typography, Container, Paper, Grid, Button, Divider, List, ListItem, ListItemText, Chip, Avatar, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../services/api';
import SecurityIcon from '@mui/icons-material/Security';
import HistoryIcon from '@mui/icons-material/History';
import GppGoodIcon from '@mui/icons-material/GppGood';
import FolderSpecialIcon from '@mui/icons-material/FolderSpecial';

const Dashboard = () => {
    const navigate = useNavigate();
    const [userData, setUserData] = useState(null);
    const [logs, setLogs] = useState([]);
    const [consents, setConsents] = useState([]);
    const [loanApps, setLoanApps] = useState([]);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        // 1. Fetch Profile Data (My Attributes) - CRITICAL
        try {
            const resProfile = await api.get('/user/data');
            setUserData(resProfile.data);
            console.log("Dashboard - User Data:", resProfile.data);
        } catch (error) {
            console.error("Failed to fetch user data", error);
            if (error.response?.status === 401) {
                localStorage.removeItem('token');
                navigate('/login');
                return; // Stop here if auth fails
            }
        }

        // 2. Fetch Access Logs - Independent
        try {
            const resLogs = await api.get('/user/logs');
            setLogs(resLogs.data);
        } catch (error) {
            console.error("Failed to fetch logs", error);
        }

        // 3. Fetch Active Consents - Independent
        try {
            const resConsents = await api.get('/oauth/active');
            setConsents(resConsents.data);
        } catch (error) {
            console.error("Failed to fetch consents", error);
        }

        // 4. Fetch Loan Apps - Independent
        try {
            const resLoans = await api.get('/loan/my-applications');
            setLoanApps(resLoans.data);
            console.log("Dashboard - Loans:", resLoans.data);
        } catch (error) {
            console.error("Failed to fetch loan applications", error);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    const handleRevoke = async (serviceId) => {
        try {
            await api.post('/oauth/revoke', { service_id: serviceId });
            // Refresh list
            setConsents(consents.filter(c => c.service_id !== serviceId));
        } catch (error) {
            console.error("Revoke failed", error);
        }
    };

    return (
        <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default', pt: 4, pb: 8 }}>
            <Container maxWidth="lg">
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ bgcolor: 'secondary.main', width: 56, height: 56 }}>
                            {userData?.full_name?.charAt(0) || 'U'}
                        </Avatar>
                        <Box>
                            <Typography variant="h4" component="h1" sx={{ color: 'primary.dark', fontWeight: 700 }}>
                                Farmer Dashboard
                            </Typography>
                            <Typography variant="subtitle1" color="textSecondary">
                                Welcome back, {userData?.full_name}
                            </Typography>
                        </Box>
                    </Box>
                    <Button variant="outlined" color="error" onClick={handleLogout} sx={{ borderRadius: '20px' }}>
                        Logout
                    </Button>
                </Box>

                <Grid container spacing={3}>
                    {/* Welcome / Status Card */}
                    <Grid item xs={12}>
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                            <Paper sx={{ p: 4, background: 'linear-gradient(45deg, #2E7D32 30%, #4CAF50 90%)', color: 'white', borderRadius: 4 }}>
                                <Grid container alignItems="center">
                                    <Grid item xs={12} md={8}>
                                        <Typography variant="h5" gutterBottom fontWeight="bold">
                                            Your Digital Identity is Secure
                                        </Typography>
                                        <Typography variant="body1" sx={{ opacity: 0.9 }}>
                                            You are in full control. You have granted access to <strong>{consents.length} apps</strong>.
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={12} md={4} sx={{ textAlign: 'right', display: { xs: 'none', md: 'block' } }}>
                                        <GppGoodIcon sx={{ fontSize: 80, opacity: 0.8 }} />
                                    </Grid>
                                </Grid>
                            </Paper>
                        </motion.div>
                    </Grid>

                    {/* Left Column: Identity & Consents */}
                    <Grid item xs={12} md={7}>
                        {/* Identity Attributes */}
                        <Paper sx={{ p: 3, mb: 3, borderRadius: 3 }}>
                            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <SecurityIcon color="primary" /> My Identity Attributes
                            </Typography>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                <Typography variant="body2" color="textSecondary">
                                    There are the details stored in your secure vault.
                                </Typography>
                                <Button size="small" variant="outlined" startIcon={<FolderSpecialIcon />} onClick={() => navigate('/documents')}>
                                    My Documents
                                </Button>
                            </Box>
                            <Divider sx={{ mb: 2 }} />

                            <Grid container spacing={2}>
                                {userData && Object.entries(userData).map(([key, value]) => {
                                    if (key === 'attributes') return null; // Handle separately
                                    return (
                                        <Grid item xs={6} key={key}>
                                            <Typography variant="caption" color="textSecondary" sx={{ textTransform: 'uppercase' }}>
                                                {key.replace(/_/g, ' ')}
                                            </Typography>
                                            <Typography variant="body1" fontWeight="500">
                                                {value || 'N/A'}
                                            </Typography>
                                        </Grid>
                                    );
                                })}
                                {/* Dynamic Attributes */}
                                {userData?.attributes && Object.entries(userData.attributes).map(([key, value]) => (
                                    <Grid item xs={6} key={key}>
                                        <Typography variant="caption" color="textSecondary" sx={{ textTransform: 'uppercase' }}>
                                            {key.replace(/_/g, ' ')}
                                        </Typography>
                                        <Typography variant="body1" fontWeight="500">
                                            {value}
                                        </Typography>
                                    </Grid>
                                ))}
                            </Grid>
                        </Paper>

                        {/* Connected Apps */}
                        <Paper sx={{ p: 3, borderRadius: 3, mb: 3 }}>
                            <Typography variant="h6" gutterBottom>Connected Apps</Typography>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <Typography variant="body2" color="textSecondary">
                                    Services you have granted access to.
                                </Typography>
                                <Button variant="text" onClick={() => navigate('/marketplace')}>
                                    + Browse Services
                                </Button>
                            </Box>
                            <Divider />
                            {consents.length === 0 ? (
                                <Box sx={{ p: 3, textAlign: 'center' }}>
                                    <Typography color="textSecondary">No connected apps yet.</Typography>
                                </Box>
                            ) : (
                                <List>
                                    {consents.map((consent) => (
                                        <ListItem key={consent.id} sx={{ borderBottom: '1px solid #eee' }}>
                                            <ListItemText
                                                primary={consent.service_name}
                                                secondary={`Granted: ${consent.granted_scopes.join(', ')}`}
                                            />
                                            <Button
                                                size="small"
                                                color="error"
                                                variant="outlined"
                                                onClick={() => handleRevoke(consent.service_id)}
                                            >
                                                Revoke
                                            </Button>
                                        </ListItem>
                                    ))}
                                </List>
                            )}
                        </Paper>

                        {/* Active Loans */}
                        <Paper sx={{ p: 3, borderRadius: 3 }}>
                            <Typography variant="h6" gutterBottom>My Loans</Typography>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <Typography variant="body2" color="textSecondary">
                                    Track status of your applications.
                                </Typography>
                                <Button variant="text" onClick={() => navigate('/loan/apply')}>
                                    + Apply New
                                </Button>
                            </Box>
                            <Divider />
                            {loanApps.length === 0 ? (
                                <Box sx={{ p: 3, textAlign: 'center' }}>
                                    <Typography color="textSecondary">No active loan applications.</Typography>
                                </Box>
                            ) : (
                                <List>
                                    {loanApps.map((app) => (
                                        <ListItem key={app.id} sx={{ borderBottom: '1px solid #eee', display: 'block' }}>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <ListItemText
                                                    primary={`Application #${app.id}`}
                                                    secondary={new Date(app.created_at).toLocaleDateString()}
                                                />
                                                <Chip
                                                    label={app.status.replace(/_/g, " ")}
                                                    size="small"
                                                    color={
                                                        app.status === 'APPROVED' ? 'success' :
                                                            app.status === 'REJECTED' ? 'error' :
                                                                app.status === 'REQUEST_DOC' ? 'warning' :
                                                                    'default'
                                                    }
                                                />
                                            </Box>
                                            {/* Admin Feedback Section */}
                                            {app.admin_notes && (
                                                <Alert severity={app.status === 'REJECTED' ? 'error' : 'info'} sx={{ mt: 1, py: 0 }}>
                                                    <Typography variant="caption" fontWeight="bold">Admin Feedback:</Typography>
                                                    <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                                                        "{app.admin_notes}"
                                                    </Typography>
                                                </Alert>
                                            )}
                                        </ListItem>
                                    ))}
                                </List>
                            )}
                        </Paper>
                    </Grid>

                    {/* Right Column: Access Logs */}
                    <Grid item xs={12} md={5}>
                        <Paper sx={{ p: 3, height: '100%', borderRadius: 3 }}>
                            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <HistoryIcon color="primary" /> Recent Activity
                            </Typography>
                            <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                                Audit trail of who accessed your data.
                            </Typography>
                            <Divider />

                            <List sx={{ maxHeight: '500px', overflow: 'auto' }}>
                                {logs.map((log) => (
                                    <ListItem key={log.id} alignItems="flex-start">
                                        <ListItemText
                                            primary={
                                                <Box component="span" sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                    <Typography variant="subtitle2">{log.service_name}</Typography>
                                                    <Typography variant="caption" color="textSecondary">
                                                        {new Date(log.timestamp).toLocaleTimeString()}
                                                    </Typography>
                                                </Box>
                                            }
                                            secondary={
                                                <React.Fragment>
                                                    <Typography component="span" variant="body2" color="textPrimary">
                                                        {log.action}
                                                    </Typography>
                                                    {" — " + log.resource}
                                                </React.Fragment>
                                            }
                                        />
                                    </ListItem>
                                ))}
                                {logs.length === 0 && (
                                    <ListItem>
                                        <ListItemText secondary="No activity logs found." />
                                    </ListItem>
                                )}
                            </List>
                        </Paper>
                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
};

export default Dashboard;
