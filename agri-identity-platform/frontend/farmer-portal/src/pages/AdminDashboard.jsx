
import React, { useState, useEffect } from 'react';
import { Box, Container, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, Chip, Dialog, DialogTitle, DialogContent, TextField, DialogActions } from '@mui/material';
import api from '../services/api';
import { toast } from 'react-toastify';

const AdminDashboard = () => {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchApplications();
    }, []);

    const fetchApplications = async () => {
        try {
            // Note: In real app, this calls /loan/admin/applications with Admin Token
            // Here we might need to mock or ensure we have admin token.
            // For hackathon, we assume the backend allows it or we logged in as admin.
            // Wait, we need an admin login page.

            // Re-using the same api instance (which sends Bearer token).
            // If we are logged in as Farmer, this will fail (401/403).
            // So we need a way to switch to Admin mode.
            // For simplicity, let's assume we are just viewing specific endpoint that allows testing
            // OR I should build an AdminLogin page.

            // Let's assume there is a separate route for admin.
            const res = await api.get('/loan/admin/applications');
            setApplications(res.data);
            setLoading(false);
        } catch (error) {
            console.error("Fetch failed", error);
            // toast.error("Failed to load applications");
            setLoading(false);
        }
    };

    const handleDecide = async (id, status) => {
        try {
            await api.post(`/loan/admin/decide/${id}`, {
                status: status,
                feedback_message: `Admin deciding: ${status}` // Simple default message
            });
            toast.success(`Application ${status}`);
            fetchApplications();
        } catch (error) {
            console.error(error);
            toast.error("Action failed");
        }
    };

    const [selectedDocs, setSelectedDocs] = useState([]);
    const [viewDocOpen, setViewDocOpen] = useState(false);
    const [viewingAppId, setViewingAppId] = useState(null);

    const handleViewDocs = async (appId) => {
        setViewingAppId(appId);
        try {
            const res = await api.get(`/loan/admin/application/${appId}/documents`);
            setSelectedDocs(res.data);
            setViewDocOpen(true);
            // This fetch triggers the backend log
        } catch (error) {
            console.error("Fetch docs failed", error);
            toast.error("Failed to fetch documents. Consent may be expired.");
        }
    };

    const handleCloseDocs = () => {
        setViewDocOpen(false);
        setSelectedDocs([]);
    };

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Typography variant="h4" gutterBottom>Loan Officer Dashboard</Typography>
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>App ID</TableCell>
                            <TableCell>Farmer ID</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Date</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {applications.map((app) => (
                            <TableRow key={app.id}>
                                <TableCell>{app.id}</TableCell>
                                <TableCell>{app.farmer_id}</TableCell>
                                <TableCell>
                                    <Chip
                                        label={app.status}
                                        color={app.status === 'APPROVED' ? 'success' : app.status === 'REJECTED' ? 'error' : 'warning'}
                                    />
                                </TableCell>
                                <TableCell>{new Date(app.created_at).toLocaleDateString()}</TableCell>
                                <TableCell>
                                    <Button size="small" variant="outlined" sx={{ mr: 1 }} onClick={() => handleViewDocs(app.id)}>
                                        View Docs
                                    </Button>
                                    {app.status === 'PENDING' && (
                                        <>
                                            <Button size="small" color="success" onClick={() => handleDecide(app.id, 'APPROVED')} sx={{ mr: 1 }}>Approve</Button>
                                            <Button size="small" color="error" onClick={() => handleDecide(app.id, 'REJECTED')}>Reject</Button>
                                        </>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Documents Dialog */}
            <Dialog open={viewDocOpen} onClose={handleCloseDocs} fullWidth maxWidth="sm">
                <DialogTitle>Application #{viewingAppId} Documents</DialogTitle>
                <DialogContent>
                    {selectedDocs.length === 0 ? (
                        <Typography>No documents found.</Typography>
                    ) : (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                            {selectedDocs.map((doc) => (
                                <Paper key={doc.id} variant="outlined" sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Box>
                                        <Typography variant="subtitle2">{doc.doc_type}</Typography>
                                        <Typography variant="body2" color="textSecondary">{doc.filename}</Typography>
                                    </Box>
                                    <Button variant="contained" size="small" onClick={() => {
                                        // Extract filename from storage_path (handles both / and \)
                                        const actualFilename = doc.storage_path.split(/[/\\]/).pop();
                                        window.open(`http://localhost:8000/uploads/${actualFilename}`, '_blank');
                                    }}>
                                        View
                                    </Button>
                                </Paper>
                            ))}
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDocs}>Close</Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default AdminDashboard;
