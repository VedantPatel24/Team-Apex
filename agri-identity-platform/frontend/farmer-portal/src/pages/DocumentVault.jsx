import React, { useEffect, useState } from 'react';
import { Box, Container, Typography, Paper, Button, List, ListItem, ListItemIcon, ListItemText, Divider, IconButton, CircularProgress, TextField, FormControlLabel, Checkbox, Dialog, DialogTitle, DialogContent, DialogActions, Alert } from '@mui/material';
import api from '../services/api';
import FolderSpecialIcon from '@mui/icons-material/FolderSpecial';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import DownloadIcon from '@mui/icons-material/Download';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import AddIcon from '@mui/icons-material/Add';
import { toast } from 'react-toastify';

const DocumentVault = () => {
    const [documents, setDocuments] = useState([]);
    const [uploading, setUploading] = useState(false);

    // Form State
    const [open, setOpen] = useState(false);
    const [docName, setDocName] = useState("");
    const [docType, setDocType] = useState("OTHER");
    const [isSensitive, setIsSensitive] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [validationError, setValidationError] = useState("");

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

    const handleOpen = () => {
        setDocName("");
        setDocType("OTHER");
        setIsSensitive(false);
        setSelectedFile(null);
        setValidationError("");
        setOpen(true);
    };

    const handleClose = () => {
        if (!uploading) setOpen(false);
    };

    const handleFileChange = (event) => {
        if (event.target.files && event.target.files[0]) {
            const file = event.target.files[0];
            setSelectedFile(file);
            // Auto-fill name if empty
            if (!docName) {
                setDocName(file.name);
            }
        }
    };

    const handleUpload = async () => {
        // Validation
        if (!docName.trim()) {
            setValidationError("Document Name is required.");
            return;
        }
        if (!selectedFile) {
            setValidationError("Please select a file.");
            return;
        }

        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('title', docName);
        formData.append('doc_type', docType);
        formData.append('is_sensitive', isSensitive);

        setUploading(true);
        setValidationError("");

        try {
            await api.post('/documents/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast.success("Document Uploaded Successfully!");
            fetchDocuments();
            handleClose();
        } catch (err) {
            console.error(err);
            toast.error("Upload failed. Please try again.");
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
                                    Manage your sensitive documents securely.
                                </Typography>
                            </Box>
                        </Box>

                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={handleOpen}
                        >
                            Upload Document
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
                                        <InsertDriveFileIcon color={doc.is_sensitive ? "error" : "action"} />
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={doc.title}
                                        secondary={`${doc.doc_type} • ${new Date(doc.created_at).toLocaleString()} ${doc.is_sensitive ? "• Encrypted" : ""}`}
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

            {/* Upload Dialog */}
            <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
                <DialogTitle>Upload New Document</DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {validationError && (
                            <Alert severity="error">{validationError}</Alert>
                        )}

                        <TextField
                            label="Document Name"
                            variant="outlined"
                            fullWidth
                            required
                            value={docName}
                            onChange={(e) => setDocName(e.target.value)}
                            placeholder="e.g., My Aadhaar Card"
                        />

                        <TextField
                            select
                            label="Document Type"
                            fullWidth
                            required
                            value={docType}
                            onChange={(e) => setDocType(e.target.value)}
                            SelectProps={{
                                native: true,
                            }}
                        >
                            <option value="OTHER">Other / General</option>
                            <option value="IDENTITY">Identity Proof (Aadhaar/PAN)</option>
                            <option value="LAND_RECORD">Land Ownership Record</option>
                            <option value="CROP_DETAILS">Crop Details / Season</option>
                            <option value="BANK_STATEMENT">Bank Statement</option>
                            <option value="LOAN_HISTORY">Previous Loan History</option>
                            <option value="SOIL_CARD">Soil Health Card</option>
                        </TextField>

                        <Button
                            variant="outlined"
                            component="label"
                            startIcon={<UploadFileIcon />}
                            fullWidth
                            sx={{ height: 56, justifyContent: 'flex-start', px: 2, borderColor: selectedFile ? 'primary.main' : 'rgba(0, 0, 0, 0.23)', color: selectedFile ? 'primary.main' : 'text.secondary' }}
                        >
                            {selectedFile ? selectedFile.name : "Select File *"}
                            <input
                                type="file"
                                hidden
                                onChange={handleFileChange}
                            />
                        </Button>

                        <FormControlLabel
                            control={<Checkbox checked={isSensitive} onChange={(e) => setIsSensitive(e.target.checked)} />}
                            label="Is this document sensitive? (Will be encrypted)"
                        />
                    </Box>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={handleClose} disabled={uploading}>Cancel</Button>
                    <Button
                        onClick={handleUpload}
                        variant="contained"
                        disabled={uploading}
                        startIcon={uploading ? <CircularProgress size={20} color="inherit" /> : null}
                    >
                        {uploading ? "Uploading..." : "Submit & Upload"}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default DocumentVault;
