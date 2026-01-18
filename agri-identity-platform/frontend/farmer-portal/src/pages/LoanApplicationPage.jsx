
import React, { useState, useEffect } from 'react';
import { Box, Container, Typography, Paper, Button, Grid, Checkbox, FormControlLabel, Stepper, Step, StepLabel, LinearProgress, Alert, Divider, List, ListItem, ListItemText, ListItemIcon } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { motion } from 'framer-motion';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import DescriptionIcon from '@mui/icons-material/Description';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { toast } from 'react-toastify';

// Mapping of DB Types to Friendly Names
const DOC_TYPE_LABELS = {
    "IDENTITY": "Identity Proof (Aadhaar/PAN)",
    "LAND_RECORD": "Land Ownership Record",
    "CROP_DETAILS": "Crop Details & Season",
    "BANK_STATEMENT": "Bank Statement",
    "LOAN_HISTORY": "Loan History",
    "SOIL_CARD": "Soil Health Card",
    "OTHER": "Other Document"
};

const LoanApplicationPage = () => {
    const navigate = useNavigate();
    const [activeStep, setActiveStep] = useState(0);
    const [loading, setLoading] = useState(true);
    const [documents, setDocuments] = useState([]);

    // Requirements from Backend
    const [requirements, setRequirements] = useState({ mandatory: [], optional: [] });
    const [missingMandatory, setMissingMandatory] = useState([]);

    // Selected Docs (ID -> Boolean)
    const [selectedDocs, setSelectedDocs] = useState({});

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            // 1. Get Requirements
            const reqRes = await api.get('/loan/requirements');
            const reqs = reqRes.data; // { mandatory: [...], optional: [...] }
            setRequirements(reqs);

            // 2. Get User Docs
            const docRes = await api.get('/documents/');
            const userDocs = docRes.data;
            setDocuments(userDocs);

            // 3. Check Compliance
            const uploadedTypes = userDocs.map(d => d.doc_type);

            // Find which mandatory types are missing
            const missing = reqs.mandatory.filter(type => !uploadedTypes.includes(type));
            setMissingMandatory(missing);

            // 4. Pre-select docs
            // For each requirement (mandatory OR optional), try to find a matching doc
            const newSelection = {};
            [...reqs.mandatory, ...reqs.optional].forEach(type => {
                const match = userDocs.find(d => d.doc_type === type);
                if (match) {
                    newSelection[match.id] = true;
                }
            });
            setSelectedDocs(newSelection);

            setLoading(false);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load loan requirements.");
            setLoading(false);
        }
    };

    const handleToggleDoc = (docId) => {
        setSelectedDocs(prev => ({ ...prev, [docId]: !prev[docId] }));
    };

    const handleApply = async () => {
        setLoading(true);
        try {
            const docIds = Object.keys(selectedDocs)
                .filter(id => selectedDocs[id])
                .map(id => parseInt(id));

            await api.post('/loan/apply', {
                service_id: 1, // Hardcoded for demo
                document_ids: docIds
            });

            toast.success("Loan Application Submitted!");
            setActiveStep(3);
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.detail || "Application failed");
        } finally {
            setLoading(false);
        }
    };

    const steps = ['Check Requirements', 'Select Documents', 'Grant Consent', 'Status'];

    if (loading) return <LinearProgress sx={{ mt: 4 }} />;

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Paper sx={{ p: 4, borderRadius: 4 }}>
                <Typography variant="h4" fontWeight="bold" color="primary" gutterBottom>
                    Agricultural Loan Application
                </Typography>

                <Stepper activeStep={activeStep} sx={{ mb: 4, display: { xs: 'none', sm: 'flex' } }}>
                    {steps.map((label) => (
                        <Step key={label}><StepLabel>{label}</StepLabel></Step>
                    ))}
                </Stepper>

                {/* --- step 0: REQUIREMENT CHECK --- */}
                {activeStep === 0 && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <Typography variant="h6" gutterBottom>
                            Step 1: Document Verification
                        </Typography>

                        {missingMandatory.length > 0 ? (
                            <Alert severity="error" sx={{ mb: 3 }} icon={<WarningIcon fontSize="inherit" />}>
                                <Typography fontWeight="bold">Missing Mandatory Documents</Typography>
                                You must upload the following documents to your Vault before applying.
                            </Alert>
                        ) : (
                            <Alert severity="success" sx={{ mb: 3 }} icon={<CheckCircleIcon fontSize="inherit" />}>
                                <Typography fontWeight="bold">Verification Successful</Typography>
                                You have all the necessary documents to proceed.
                            </Alert>
                        )}

                        <Paper variant="outlined" sx={{ p: 2, bgcolor: '#fafafa' }}>
                            <Typography variant="subtitle2" gutterBottom>REQUIRED DOCUMENTS</Typography>
                            <List dense>
                                {requirements.mandatory.map(type => {
                                    const isPresent = documents.some(d => d.doc_type === type);
                                    return (
                                        <ListItem key={type}>
                                            <ListItemIcon>
                                                {isPresent ? <CheckCircleIcon color="success" /> : <WarningIcon color="error" />}
                                            </ListItemIcon>
                                            <ListItemText
                                                primary={DOC_TYPE_LABELS[type] || type}
                                                primaryTypographyProps={{
                                                    color: isPresent ? 'textPrimary' : 'error',
                                                    fontWeight: isPresent ? 'normal' : 'bold'
                                                }}
                                            />
                                        </ListItem>
                                    );
                                })}
                            </List>
                        </Paper>

                        <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                            {missingMandatory.length > 0 && (
                                <Button
                                    variant="contained"
                                    color="secondary"
                                    onClick={() => navigate('/documents')}
                                >
                                    Go to Document Vault
                                </Button>
                            )}

                            {missingMandatory.length === 0 && (
                                <Button
                                    variant="contained"
                                    endIcon={<ArrowForwardIcon />}
                                    onClick={() => setActiveStep(1)}
                                    color="primary"
                                >
                                    Proceed to Selection
                                </Button>
                            )}
                        </Box>
                    </motion.div>
                )}

                {/* --- step 1: SELECT DOCS --- */}
                {activeStep === 1 && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <Typography variant="h6" gutterBottom>Step 2: Select Documents to Share</Typography>
                        <Alert severity="info" sx={{ mb: 2 }}>
                            Select optional documents to speed up the approval process.
                        </Alert>

                        <Grid container spacing={2}>
                            <Grid item xs={12} md={6}>
                                <Typography variant="caption" color="textSecondary">MANDATORY</Typography>
                                {documents
                                    .filter(d => requirements.mandatory.includes(d.doc_type))
                                    .map(d => (
                                        <FormControlLabel
                                            key={d.id}
                                            control={<Checkbox checked={selectedDocs[d.id]} disabled />}
                                            label={
                                                <Box>
                                                    <Typography variant="body2">{d.title}</Typography>
                                                    <Typography variant="caption" color="textSecondary">{DOC_TYPE_LABELS[d.doc_type]}</Typography>
                                                </Box>
                                            }
                                            sx={{ display: 'block', mb: 1 }}
                                        />
                                    ))
                                }
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <Typography variant="caption" color="textSecondary">OPTIONAL (RECOMMENDED)</Typography>
                                {documents
                                    .filter(d => !requirements.mandatory.includes(d.doc_type))
                                    .map(d => (
                                        <FormControlLabel
                                            key={d.id}
                                            control={
                                                <Checkbox
                                                    checked={!!selectedDocs[d.id]}
                                                    onChange={() => handleToggleDoc(d.id)}
                                                />
                                            }
                                            label={
                                                <Box>
                                                    <Typography variant="body2">{d.title}</Typography>
                                                    <Typography variant="caption" color="textSecondary">{DOC_TYPE_LABELS[d.doc_type] || "Other"}</Typography>
                                                </Box>
                                            }
                                            sx={{ display: 'block', mb: 1 }}
                                        />
                                    ))
                                }
                            </Grid>
                        </Grid>

                        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
                            <Button onClick={() => setActiveStep(0)}>Back</Button>
                            <Button variant="contained" onClick={() => setActiveStep(2)}>Next: Review Consent</Button>
                        </Box>
                    </motion.div>
                )}

                {/* --- step 2: CONSENT --- */}
                {activeStep === 2 && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <Typography variant="h6" gutterBottom>Step 3: Grant Consent</Typography>
                        <Paper variant="outlined" sx={{ p: 3, bgcolor: '#f5f5f5' }}>
                            <Box sx={{ mb: 2 }}>
                                <Typography variant="caption" color="textSecondary">REQUESTING SERVICE</Typography>
                                <Typography variant="h6">Agricultural Loan Service</Typography>
                            </Box>

                            <Divider sx={{ mb: 2 }} />

                            <Box sx={{ mb: 2 }}>
                                <Typography variant="caption" color="textSecondary">PURPOSE</Typography>
                                <Typography variant="body1">Loan Eligibility & Risk Assessment</Typography>
                            </Box>

                            <Box sx={{ mb: 2 }}>
                                <Typography variant="caption" color="textSecondary">DOCUMENTS TO BE SHARED</Typography>
                                <List dense>
                                    {documents.filter(d => selectedDocs[d.id]).map(d => (
                                        <ListItem key={d.id}>
                                            <ListItemIcon><DescriptionIcon /></ListItemIcon>
                                            <ListItemText
                                                primary={d.title}
                                                secondary={d.is_sensitive ? "Encrypted • Sensitive" : "Standard"}
                                            />
                                        </ListItem>
                                    ))}
                                </List>
                            </Box>

                            <Box>
                                <Typography variant="caption" color="textSecondary">CONSENT EXPIRY</Typography>
                                <Typography variant="body1" fontWeight="bold" color="primary">30 Days</Typography>
                            </Box>
                        </Paper>

                        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
                            <Button onClick={() => setActiveStep(1)}>Back</Button>
                            <Button
                                variant="contained"
                                color="success"
                                size="large"
                                onClick={handleApply}
                                disabled={loading}
                            >
                                {loading ? "Processing..." : "Grant Consent & Apply"}
                            </Button>
                        </Box>
                    </motion.div>
                )}

                {/* --- step 3: STATUS --- */}
                {activeStep === 3 && (
                    <Box sx={{ textAlign: 'center', py: 5 }}>
                        <AccountBalanceIcon color="success" sx={{ fontSize: 80, mb: 2 }} />
                        <Typography variant="h4" gutterBottom>Application Submitted</Typography>
                        <Typography paragraph color="textSecondary">
                            Your consent has been recorded. The Loan Officer will review your documents.
                        </Typography>
                        <Button variant="outlined" onClick={() => navigate('/dashboard')}>
                            Go to Dashboard
                        </Button>
                    </Box>
                )}
            </Paper>
        </Container>
    );
};

export default LoanApplicationPage;
