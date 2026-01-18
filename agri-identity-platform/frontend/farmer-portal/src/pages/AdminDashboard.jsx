
import React, { useState, useEffect } from 'react';
import { Box, Container, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, Chip, Dialog, DialogTitle, DialogContent, TextField, DialogActions, Tabs, Tab } from '@mui/material';
import api from '../services/api';
import { toast } from 'react-toastify';

const AdminDashboard = () => {
    const [tabIndex, setTabIndex] = useState(0); // 0: Loans, 1: Advisory

    // Loan State
    const [loanApps, setLoanApps] = useState([]);
    // Advisory State
    const [advisoryReqs, setAdvisoryReqs] = useState([]);

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Fetch Loans
            const loanRes = await api.get('/loan/admin/applications').catch(() => ({ data: [] }));
            setLoanApps(loanRes.data);

            // Fetch Advisory
            // Note: In real app, we'd check which admin is logged in. 
            // For hackathon simplicity, we try to fetch both if backend allows, or just ignore 403.
            try {
                const advRes = await api.get('/crop-advisory/admin/requests');
                setAdvisoryReqs(advRes.data);
            } catch (e) {
                console.warn("Could not fetch advisory requests (maybe not admin for it)");
            }

        } catch (error) {
            console.error("Fetch failed", error);
        } finally {
            setLoading(false);
        }
    };

    // --- Loan Actions ---
    const handleLoanDecide = async (id, status) => {
        try {
            await api.post(`/loan/admin/decide/${id}`, {
                status: status,
                feedback_message: `Admin deciding: ${status}`
            });
            toast.success(`Application ${status}`);
            fetchData();
        } catch (error) {
            toast.error("Action failed");
        }
    };

    // --- Advisory Actions ---
    const [advDialogOpen, setAdvDialogOpen] = useState(false);
    const [selectedAdvId, setSelectedAdvId] = useState(null);
    const [adviceForm, setAdviceForm] = useState({ recommendation: '', fertilizer: '', schedule: '' });

    const openAdviceDialog = (id) => {
        setSelectedAdvId(id);
        const req = advisoryReqs.find(r => r.id === id);
        // Pre-fill if already advised?
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

    // --- View Docs Logic (Shared) ---
    const [selectedDocs, setSelectedDocs] = useState([]);
    const [viewDocOpen, setViewDocOpen] = useState(false);
    const [viewingAppId, setViewingAppId] = useState(null);

    const handleViewLoanDocs = async (appId) => {
        setViewingAppId(appId);
        try {
            const res = await api.get(`/loan/admin/application/${appId}/documents`);
            setSelectedDocs(res.data);
            setViewDocOpen(true);
        } catch (error) {
            toast.error("Failed to fetch documents.");
        }
    };

    const handleCloseDocs = () => {
        setViewDocOpen(false);
        setSelectedDocs([]);
    };

    const handleViewAdvisoryDoc = async (docId) => {
        try {
            const res = await api.get(`/crop-advisory/admin/document/${docId}`);
            // Wrap single doc in array to reuse existing list dialog
            setSelectedDocs([res.data]);
            setViewDocOpen(true);
        } catch (error) {
            toast.error("Failed to fetch document");
        }
    };

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Typography variant="h4" gutterBottom>Admin Dashboard</Typography>

            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                <Tabs value={tabIndex} onChange={(e, v) => setTabIndex(v)}>
                    <Tab label="Loan Applications" />
                    <Tab label="Crop Advisory Requests" />
                </Tabs>
            </Box>

            {/* TAB 0: LOANS */}
            {tabIndex === 0 && (
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>App ID</TableCell>
                                <TableCell>Farmer</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell>Date</TableCell>
                                <TableCell>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loanApps.map((app) => (
                                <TableRow key={app.id}>
                                    <TableCell>{app.id}</TableCell>
                                    <TableCell>{app.farmer_id}</TableCell>
                                    <TableCell>
                                        <Chip label={app.status} color={app.status === 'APPROVED' ? 'success' : app.status === 'REJECTED' ? 'error' : 'warning'} />
                                    </TableCell>
                                    <TableCell>{new Date(app.created_at).toLocaleDateString()}</TableCell>
                                    <TableCell>
                                        <Button size="small" variant="outlined" sx={{ mr: 1 }} onClick={() => handleViewLoanDocs(app.id)}>Docs</Button>
                                        {app.status === 'PENDING' && (
                                            <>
                                                <Button size="small" color="success" onClick={() => handleLoanDecide(app.id, 'APPROVED')}>Approve</Button>
                                                <Button size="small" color="error" onClick={() => handleLoanDecide(app.id, 'REJECTED')}>Reject</Button>
                                            </>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            {/* TAB 1: ADVISORY */}
            {tabIndex === 1 && (
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>ID</TableCell>
                                <TableCell>Location</TableCell>
                                <TableCell>Crop & Season</TableCell>
                                <TableCell>Soil Health</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {advisoryReqs.map((req) => (
                                <TableRow key={req.id}>
                                    <TableCell>{req.id}</TableCell>
                                    <TableCell>{req.location}</TableCell>
                                    <TableCell>
                                        <Typography variant="body2" fontWeight="bold">{req.crop_name}</Typography>
                                        <Typography variant="caption">{req.season}</Typography>
                                    </TableCell>
                                    <TableCell>
                                        {req.soil_health_doc_id ? (
                                            <Button
                                                size="small"
                                                variant="outlined"
                                                color="info"
                                                onClick={() => handleViewAdvisoryDoc(req.soil_health_doc_id)}
                                            >
                                                View Doc
                                            </Button>
                                        ) : "N/A"}
                                    </TableCell>
                                    <TableCell>
                                        <Chip label={req.status} color={req.status === 'ADVISED' ? 'success' : 'default'} />
                                    </TableCell>
                                    <TableCell>
                                        <Button
                                            variant="contained"
                                            size="small"
                                            color="primary"
                                            onClick={() => openAdviceDialog(req.id)}
                                        >
                                            {req.status === 'ADVISED' ? 'Update Advice' : 'Provide Advice'}
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {advisoryReqs.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={6} align="center">No advisory requests found.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            {/* DOCS DIALOG */}
            <Dialog open={viewDocOpen} onClose={handleCloseDocs} fullWidth maxWidth="sm">
                <DialogTitle>Documents</DialogTitle>
                <DialogContent>
                    {selectedDocs.length === 0 ? <Typography>No documents found.</Typography> : (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                            {selectedDocs.map((doc) => (
                                <Paper key={doc.id} variant="outlined" sx={{ p: 2, display: 'flex', justifyContent: 'space-between' }}>
                                    <Box>
                                        <Typography variant="subtitle2">{doc.doc_type}</Typography>
                                        <Typography variant="body2">{doc.filename}</Typography>
                                    </Box>
                                    <Button variant="contained" size="small" onClick={() => {
                                        const actualFilename = doc.storage_path.split(/[/\\]/).pop();
                                        window.open(`http://localhost:8000/uploads/${actualFilename}`, '_blank');
                                    }}>View</Button>
                                </Paper>
                            ))}
                        </Box>
                    )}
                </DialogContent>
                <DialogActions><Button onClick={handleCloseDocs}>Close</Button></DialogActions>
            </Dialog>

            {/* ADVICE DIALOG */}
            <Dialog open={advDialogOpen} onClose={() => setAdvDialogOpen(false)} fullWidth maxWidth="sm">
                <DialogTitle>Provide Expert Advice</DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                        <TextField
                            label="Crop Recommendation"
                            multiline rows={2}
                            fullWidth
                            value={adviceForm.recommendation}
                            onChange={(e) => setAdviceForm({ ...adviceForm, recommendation: e.target.value })}
                        />
                        <TextField
                            label="Fertilizer Plan"
                            multiline rows={2}
                            fullWidth
                            value={adviceForm.fertilizer}
                            onChange={(e) => setAdviceForm({ ...adviceForm, fertilizer: e.target.value })}
                        />
                        <TextField
                            label="Sowing Schedule"
                            fullWidth
                            value={adviceForm.schedule}
                            onChange={(e) => setAdviceForm({ ...adviceForm, schedule: e.target.value })}
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setAdvDialogOpen(false)}>Cancel</Button>
                    <Button variant="contained" onClick={submitAdvice}>Send Advice</Button>
                </DialogActions>
            </Dialog>

        </Container>
    );
};

export default AdminDashboard;


