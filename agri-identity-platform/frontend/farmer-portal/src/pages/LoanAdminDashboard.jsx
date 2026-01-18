import React, { useState, useEffect } from 'react';
import { Box, Container, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, Chip, Dialog, DialogTitle, DialogContent, DialogActions, Avatar, IconButton } from '@mui/material';
import api from '../services/api';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import LogoutIcon from '@mui/icons-material/Logout';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import DescriptionIcon from '@mui/icons-material/Description';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import RefreshIcon from '@mui/icons-material/Refresh';
import { motion } from 'framer-motion';

/* --- Premium Theme Constants --- */
const glassStyle = {
    background: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(20px)',
    borderRadius: '16px',
    boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
    border: '1px solid rgba(255, 255, 255, 0.18)',
    overflow: 'hidden'
};

const gradientBg = 'linear-gradient(135deg, #1b5e20 0%, #43a047 100%)';

const LoanAdminDashboard = () => {
    const navigate = useNavigate();
    const [loanApps, setLoanApps] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const loanRes = await api.get('/loan/admin/applications');
            setLoanApps(loanRes.data);
        } catch (error) {
            if (error.response?.status === 403) {
                toast.error("Access Denied: You are not authorized for Loan Services.");
                navigate('/');
            } else {
                toast.error("Failed to fetch loan applications");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleLoanDecide = async (id, status) => {
        try {
            await api.post(`/loan/admin/decide/${id}`, {
                status: status,
                feedback_message: `Admin decision: ${status}`
            });
            toast.success(`Application ${status}`);
            fetchData();
        } catch (error) {
            toast.error("Action failed");
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/');
    };

    // --- Docs Logic ---
    const [selectedDocs, setSelectedDocs] = useState([]);
    const [viewDocOpen, setViewDocOpen] = useState(false);

    const handleViewDocs = async (appId) => {
        try {
            const res = await api.get(`/loan/admin/application/${appId}/documents`);
            setSelectedDocs(res.data);
            setViewDocOpen(true);
        } catch (error) {
            toast.error("Failed to fetch documents.");
        }
    };

    return (
        <Box sx={{ minHeight: '100vh', background: gradientBg, pt: 4, pb: 8 }}>
            <Container maxWidth="lg">
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ bgcolor: 'white', color: '#1b5e20', width: 56, height: 56, boxShadow: 3 }}>
                            <AccountBalanceIcon fontSize="large" />
                        </Avatar>
                        <Box>
                            <Typography variant="h4" fontWeight="800" sx={{ color: 'white' }}>
                                Loan Admin Portal
                            </Typography>
                            <Typography variant="subtitle1" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                                Manage agricultural loan applications
                            </Typography>
                        </Box>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton onClick={fetchData} sx={{ bgcolor: 'white', '&:hover': { bgcolor: '#f1f8e9' } }}>
                            <RefreshIcon color="primary" />
                        </IconButton>
                        <Button
                            variant="contained"
                            startIcon={<LogoutIcon />}
                            onClick={handleLogout}
                            color="error"
                            sx={{ borderRadius: '24px', fontWeight: 'bold', bgcolor: '#ffebee', color: '#d32f2f', '&:hover': { bgcolor: '#ffcdd2' } }}
                        >
                            Logout
                        </Button>
                    </Box>
                </Box>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                    <TableContainer component={Paper} sx={glassStyle}>
                        <Table>
                            <TableHead sx={{ bgcolor: '#2e7d32' }}>
                                <TableRow>
                                    <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '1rem' }}>Farmer Details</TableCell>
                                    <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '1rem' }}>Status</TableCell>
                                    <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '1rem' }}>Submission Date</TableCell>
                                    <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '1rem' }}>Documents</TableCell>
                                    <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '1rem' }}>Decision</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {loanApps.map((app) => (
                                    <TableRow key={app.id} hover sx={{ '&:hover': { bgcolor: 'rgba(46, 125, 50, 0.08)' } }}>
                                        <TableCell>
                                            <Typography variant="subtitle1" fontWeight="bold" color="#1b5e20">
                                                {app.farmer_name || 'Unknown Farmer'}
                                            </Typography>
                                            <Typography variant="caption" color="textSecondary">
                                                App ID: #{app.id}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={app.status.replace(/_/g, " ")}
                                                sx={{
                                                    fontWeight: 'bold',
                                                    color: app.status === 'APPROVED' ? '#1b5e20' : app.status === 'REJECTED' ? '#c62828' : '#ef6c00',
                                                    bgcolor: app.status === 'APPROVED' ? '#e8f5e9' : app.status === 'REJECTED' ? '#ffebee' : '#fff3e0'
                                                }}
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell sx={{ color: '#555' }}>{new Date(app.created_at).toLocaleDateString()}</TableCell>
                                        <TableCell>
                                            <Button
                                                size="small"
                                                variant="outlined"
                                                startIcon={<DescriptionIcon />}
                                                onClick={() => handleViewDocs(app.id)}
                                                sx={{ borderRadius: 2, borderColor: '#2e7d32', color: '#2e7d32' }}
                                            >
                                                Review Docs
                                            </Button>
                                        </TableCell>
                                        <TableCell>
                                            {(app.status === 'PENDING' || app.status === 'REQUEST_DOC') ? (
                                                <Box sx={{ display: 'flex', gap: 1 }}>
                                                    <Button
                                                        size="small"
                                                        variant="contained"
                                                        color="success"
                                                        onClick={() => handleLoanDecide(app.id, 'APPROVED')}
                                                        startIcon={<CheckCircleIcon />}
                                                        sx={{ borderRadius: 2 }}
                                                    >
                                                        Approve
                                                    </Button>
                                                    <Button
                                                        size="small"
                                                        variant="contained"
                                                        color="error"
                                                        onClick={() => handleLoanDecide(app.id, 'REJECTED')}
                                                        startIcon={<CancelIcon />}
                                                        sx={{ borderRadius: 2 }}
                                                    >
                                                        Reject
                                                    </Button>
                                                </Box>
                                            ) : (
                                                <Typography variant="caption" color="textSecondary" sx={{ fontStyle: 'italic' }}>
                                                    Processed
                                                </Typography>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {loanApps.length === 0 && !loading && (
                                    <TableRow>
                                        <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                                            <Typography color="textSecondary">No active loan applications found.</Typography>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </motion.div>

                {/* DOCS DIALOG */}
                <Dialog
                    open={viewDocOpen}
                    onClose={() => setViewDocOpen(false)}
                    fullWidth
                    maxWidth="sm"
                    PaperProps={{ sx: { borderRadius: 3 } }}
                >
                    <DialogTitle sx={{ bgcolor: '#e8f5e9', color: '#1b5e20', fontWeight: 'bold' }}>
                        Application Documents
                    </DialogTitle>
                    <DialogContent sx={{ mt: 2 }}>
                        {selectedDocs.length === 0 ? <Typography align="center" color="textSecondary">No documents attached.</Typography> : (
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                {selectedDocs.map((doc) => (
                                    <Paper key={doc.id} variant="outlined" sx={{ p: 2, borderRadius: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Box>
                                            <Typography variant="subtitle2" fontWeight="bold" color="#2e7d32">{doc.doc_type}</Typography>
                                            <Typography variant="caption" color="textSecondary">{doc.filename}</Typography>
                                        </Box>
                                        <Button
                                            variant="contained"
                                            size="small"
                                            onClick={() => {
                                                const actualFilename = doc.storage_path.split(/[/\\]/).pop();
                                                window.open(`http://localhost:8000/uploads/${actualFilename}`, '_blank');
                                            }}
                                            sx={{ borderRadius: 4, bgcolor: '#2e7d32' }}
                                        >
                                            View
                                        </Button>
                                    </Paper>
                                ))}
                            </Box>
                        )}
                    </DialogContent>
                    <DialogActions sx={{ p: 2 }}>
                        <Button onClick={() => setViewDocOpen(false)} color="inherit">Close</Button>
                    </DialogActions>
                </Dialog>
            </Container>
        </Box>
    );
};

export default LoanAdminDashboard;
