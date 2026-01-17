import React, { useEffect, useState } from 'react';
import { Box, Container, Typography, Grid, Paper, Button, List, ListItem, ListItemIcon, ListItemText, Divider, IconButton, CircularProgress } from '@mui/material';
import api from '../services/api';
import FolderSpecialIcon from '@mui/icons-material/FolderSpecial';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import DownloadIcon from '@mui/icons-material/Download';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import { toast } from 'react-toastify';

const DocumentVault = () => {
    const [documents, setDocuments] = useState([]);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        fetchDocuments();
    }, []);

    const fetchDocuments = async () => {
        try {
            const res = await api.get('/documents/');
            setDocuments(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);
        formData.append('title', file.name); // Simple title

        setUploading(true);
        try {
            await api.post('/documents/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast.success("Document Encrypted & Uploaded!");
            fetchDocuments();
        } catch (err) {
            console.error(err);
            toast.error("Upload failed");
        } finally {
            setUploading(false);
        }
    };

    const handleDownload = async (doc) => {
        try {
            const response = await api.get(`/documents/${doc.id}/download`, {
                responseType: 'blob'
            });

            // Create Blob URL and trigger download
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', doc.filename);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
        } catch (err) {
            console.error(err);
            toast.error("Download failed");
        }
    };

    return (
        <Box sx={{ minHeight: '100vh', backgroundColor: '#f5f5f5', py: 4 }}>
            <Container maxWidth="md">
                <Paper sx={{ p: 4, borderRadius: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <FolderSpecialIcon color="primary" sx={{ fontSize: 40 }} />
                            <Box>
                                <Typography variant="h5" fontWeight="bold">
                                    Secure Document Vault
                                </Typography>
                                <Typography variant="body2" color="textSecondary">
                                    Upload confidential documents. They are encrypted on storage.
                                </Typography>
                            </Box>
                        </Box>

                        <Button
                            variant="contained"
                            component="label"
                            startIcon={uploading ? <CircularProgress size={20} color="inherit" /> : <UploadFileIcon />}
                            disabled={uploading}
                        >
                            Upload Document
                            <input
                                type="file"
                                hidden
                                onChange={handleUpload}
                            />
                        </Button>
                    </Box>

                    <Divider sx={{ mb: 2 }} />

                    {documents.length === 0 ? (
                        <Box sx={{ textAlign: 'center', py: 5 }}>
                            <InsertDriveFileIcon sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
                            <Typography color="textSecondary">
                                Your vault is empty. Upload your Land Record or Aadhaar card securely.
                            </Typography>
                        </Box>
                    ) : (
                        <List>
                            {documents.map((doc) => (
                                <ListItem key={doc.id} sx={{ mb: 1, bgcolor: '#f9f9f9', borderRadius: 2 }}>
                                    <ListItemIcon>
                                        <InsertDriveFileIcon color="action" />
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={doc.title}
                                        secondary={new Date(doc.created_at).toLocaleString()}
                                    />
                                    <IconButton onClick={() => handleDownload(doc)} color="primary">
                                        <DownloadIcon />
                                    </IconButton>
                                </ListItem>
                            ))}
                        </List>
                    )}
                </Paper>
            </Container>
        </Box>
    );
};

export default DocumentVault;
