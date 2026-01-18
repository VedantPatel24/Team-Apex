import React, { useState, useEffect } from 'react';
import { Box, Container, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, Chip, Dialog, DialogTitle, DialogContent, TextField, DialogActions, Avatar, IconButton } from '@mui/material';
import api from '../services/api';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import LogoutIcon from '@mui/icons-material/Logout';
import AgricultureIcon from '@mui/icons-material/Agriculture';
import RefreshIcon from '@mui/icons-material/Refresh';
import EditIcon from '@mui/icons-material/Edit';
import SendIcon from '@mui/icons-material/Send';
import DescriptionIcon from '@mui/icons-material/Description';
import { motion } from 'framer-motion';

/* --- Premium Theme Constants --- */
const glassStyle = {
    background: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(20px)',
    borderRadius: '16px',
    boxShadow: '0 8px 32px 0 rgba(0, 105, 92, 0.15)',
    border: '1px solid rgba(255, 255, 255, 0.18)',
    overflow: 'hidden'
};

const gradientBg = 'linear-gradient(135deg, #00695c 0%, #00897b 100%)';

const AdvisoryAdminDashboard = () => {
    const navigate = useNavigate();
    const [advisoryReqs, setAdvisoryReqs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const advRes = await api.get('/crop-advisory/admin/requests');
            setAdvisoryReqs(advRes.data);
        } catch (error) {
            if (error.response?.status === 403) {
                toast.error("Access Denied: Domain Mismatch.");
                navigate('/');
            } else {
                toast.error("Failed to fetch requests");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/');
    };

    // --- Advisory Actions ---
    const [advDialogOpen, setAdvDialogOpen] = useState(false);
    const [selectedAdvId, setSelectedAdvId] = useState(null);
    const [adviceForm, setAdviceForm] = useState({ recommendation: '', fertilizer: '', schedule: '' });

    const openAdviceDialog = (id) => {
        setSelectedAdvId(id);
        const req = advisoryReqs.find(r => r.id === id);
        setAdviceForm({
            recommendation: req.recommendation || '',
            fertilizer: req.fertilizer_plan || '',
            schedule: req.sowing_schedule || ''
        });
        setAdvDialogOpen(true);
    };

    const submitAdvice = async () => {
        try {
            await api.post(`/crop-advisory/admin/advise/${selectedAdvId}`, {
                recommendation: adviceForm.recommendation,
                fertilizer_plan: adviceForm.fertilizer,
                sowing_schedule: adviceForm.schedule
            });
            toast.success("Advice Sent!");
            setAdvDialogOpen(false);
            fetchData();
        } catch (error) {
            toast.error("Failed to send advice");
        }
    };

    // --- Doc View ---
    const handleViewDoc = async (docId) => {
        try {
            const res = await api.get(`/crop-advisory/admin/document/${docId}`);
            const actualFilename = res.data.storage_path.split(/[/\\]/).pop();
            window.open(`http://localhost:8000/uploads/${actualFilename}`, '_blank');
        } catch (error) {
            toast.error("Failed to fetch document");
        }
    };

    return (
        <Box sx={{ minHeight: '100vh', background: gradientBg, pt: 4, pb: 8 }}>
            <Container maxWidth="xl">
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ bgcolor: 'white', color: '#00695c', width: 56, height: 56, boxShadow: 3 }}>
                            <AgricultureIcon fontSize="large" />
                        </Avatar>
                        <Box>
                            <Typography variant="h4" fontWeight="800" sx={{ color: 'white' }}>
                                Advisory Admin
                            </Typography>
                            <Typography variant="subtitle1" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                                Expert guidance for farmers
                            </Typography>
                        </Box>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton onClick={fetchData} sx={{ bgcolor: 'white', '&:hover': { bgcolor: '#e0f2f1' } }}>
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
                            <TableHead sx={{ bgcolor: '#00695c' }}>
                                <TableRow>
                                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Farmer</TableCell>
                                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Location</TableCell>
                                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Crop Info</TableCell>
                                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Soil Report</TableCell>
                                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Advice Given</TableCell>
                                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Status</TableCell>
                                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Action</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {advisoryReqs.map((req) => (
                                    <TableRow key={req.id} hover sx={{ '&:hover': { bgcolor: 'rgba(0, 105, 92, 0.08)' } }}>
                                        <TableCell>
                                            <Typography variant="subtitle2" fontWeight="bold" color="#00695c">
                                                {req.farmer_name || 'Unknown Farmer'}
                                            </Typography>
                                            {/* ID removed as requested, using name primary */}
                                        </TableCell>
                                        <TableCell>{req.location}</TableCell>
                                        <TableCell>
                                            <Box>
                                                <Typography variant="body2" fontWeight="bold">{req.crop_name}</Typography>
                                                <Typography variant="caption" color="textSecondary">{req.season}</Typography>
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            {req.soil_health_doc_id ? (
                                                <Button
                                                    size="small"
                                                    variant="outlined"
                                                    color="info"
                                                    startIcon={<DescriptionIcon />}
                                                    onClick={() => handleViewDoc(req.soil_health_doc_id)}
                                                    sx={{ borderRadius: 2 }}
                                                >
                                                    Report
                                                </Button>
                                            ) : (
                                                <Typography variant="caption" color="textSecondary">Not Provided</Typography>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {req.status === 'ADVISED' ? (
                                                <Typography variant="body2" sx={{ fontStyle: 'italic', color: '#555' }}>
                                                    "{req.recommendation?.slice(0, 50)}{req.recommendation?.length > 50 ? '...' : ''}"
                                                </Typography>
                                            ) : (
                                                <Typography variant="caption" color="textSecondary">-</Typography>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={req.status}
                                                sx={{
                                                    fontWeight: 'bold',
                                                    color: req.status === 'ADVISED' ? '#004d40' : '#e65100',
                                                    bgcolor: req.status === 'ADVISED' ? '#b2dfdb' : '#ffe0b2'
                                                }}
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Button
                                                variant="contained"
                                                size="small"
                                                color="primary"
                                                startIcon={req.status === 'ADVISED' ? <EditIcon /> : <SendIcon />}
                                                onClick={() => openAdviceDialog(req.id)}
                                                sx={{ borderRadius: 2, bgcolor: '#00695c' }}
                                            >
                                                {req.status === 'ADVISED' ? 'Update' : 'Advise'}
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {advisoryReqs.length === 0 && !loading && (
                                    <TableRow>
                                        <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                                            <Typography color="textSecondary">No pending advisory requests.</Typography>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </motion.div>

                {/* ADVICE DIALOG */}
                <Dialog
                    open={advDialogOpen}
                    onClose={() => setAdvDialogOpen(false)}
                    fullWidth
                    maxWidth="sm"
                    PaperProps={{ sx: { borderRadius: 3 } }}
                >
                    <DialogTitle sx={{ bgcolor: '#e0f2f1', color: '#00695c', fontWeight: 'bold' }}>
                        Expert Advisory Form
                    </DialogTitle>
                    <DialogContent sx={{ mt: 2 }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 1 }}>
                            <TextField
                                label="Key Recommendation"
                                multiline rows={3}
                                fullWidth
                                variant="outlined"
                                value={adviceForm.recommendation}
                                onChange={(e) => setAdviceForm({ ...adviceForm, recommendation: e.target.value })}
                                InputProps={{ sx: { borderRadius: 2 } }}
                            />
                            <TextField
                                label="Fertilizer Plan"
                                multiline rows={2}
                                fullWidth
                                variant="outlined"
                                value={adviceForm.fertilizer}
                                onChange={(e) => setAdviceForm({ ...adviceForm, fertilizer: e.target.value })}
                                InputProps={{ sx: { borderRadius: 2 } }}
                            />
                            <TextField
                                label="Sowing Schedule"
                                fullWidth
                                variant="outlined"
                                value={adviceForm.schedule}
                                onChange={(e) => setAdviceForm({ ...adviceForm, schedule: e.target.value })}
                                InputProps={{ sx: { borderRadius: 2 } }}
                            />
                        </Box>
                    </DialogContent>
                    <DialogActions sx={{ p: 2 }}>
                        <Button onClick={() => setAdvDialogOpen(false)} color="inherit" sx={{ borderRadius: 2 }}>Cancel</Button>
                        <Button
                            variant="contained"
                            onClick={submitAdvice}
                            sx={{ bgcolor: '#00695c', borderRadius: 2, px: 3 }}
                            startIcon={<SendIcon />}
                        >
                            Send Advice
                        </Button>
                    </DialogActions>
                </Dialog>
            </Container>
        </Box>
    );
};

export default AdvisoryAdminDashboard;
