
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
            await api.post(`/loan/admin/decide/${id}`, null, {
                params: { status }
            });
            toast.success(`Application ${status}`);
            fetchApplications();
        } catch (error) {
            toast.error("Action failed");
        }
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
                                    {app.status === 'PENDING' && (
                                        <>
                                            <Button color="success" onClick={() => handleDecide(app.id, 'APPROVED')}>Approve</Button>
                                            <Button color="error" onClick={() => handleDecide(app.id, 'REJECTED')}>Reject</Button>
                                        </>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Container>
    );
};

export default AdminDashboard;
