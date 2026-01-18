
import React, { useState, useEffect } from 'react';
import { Box, Container, Typography, Paper, Button, Grid, TextField, MenuItem, Stepper, Step, StepLabel, LinearProgress, Alert, Divider, List, ListItem, ListItemText, ListItemIcon } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { motion } from 'framer-motion';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import DescriptionIcon from '@mui/icons-material/Description';
import AgricultureIcon from '@mui/icons-material/Agriculture';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { toast } from 'react-toastify';
import LocationPicker from '../components/LocationPicker'; // Re-enabled
import ErrorBoundary from '../components/ErrorBoundary';

const CropAdvisoryPage = () => {
    const navigate = useNavigate();
    const [activeStep, setActiveStep] = useState(0);
    const [loading, setLoading] = useState(true);

    // User Data
    const [userProfile, setUserProfile] = useState(null);
    const [documents, setDocuments] = useState([]);

    // Form Data
    const [formData, setFormData] = useState({
        crop_name: '',
        season: '',
        irrigation_type: '',
        last_yield: '',
        soil_health_doc_id: ''
    });

    // Profile Update State
    const [locationInput, setLocationInput] = useState('');
    const [updatingProfile, setUpdatingProfile] = useState(false);

    // Constants
    const SEASONS = ['Kharif (Monsoon)', 'Rabi (Winter)', 'Zaid (Summer)'];
    const CROPS = ['Wheat', 'Rice', 'Maize', 'Cotton', 'Sugarcane', 'Soybean'];
    const IRRIGATION = ['Rainfed', 'Tube Well', 'Canal', 'Drip/Sprinkler'];
    const SERVICE_ID = 2; // Assuming ID 2 for Crop Advisory based on init script sequence? Or fetch dynamically. 
    // Ideally we should fetch service by Client ID. But for hackathon let's dynamically find it or hardcode if we know.
    // Let's first fetch services to find ID.
    const [serviceId, setServiceId] = useState(null);

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            // 1. Fetch Service ID
            const servicesRes = await api.get('/services/');
            const cropService = servicesRes.data.find(s => s.client_id === 'CROP_ADVISORY_001');
            if (cropService) {
                setServiceId(cropService.id);
            } else {
                toast.error("Crop Advisory Service not available.");
            }

            // 2. Fetch User Profile (Location Check)
            const profileRes = await api.get('/user/data');
            setUserProfile(profileRes.data);
            if (profileRes.data.location) {
                setLocationInput(profileRes.data.location);
            }

            // 3. Fetch Documents (For Soil Health)
            const docRes = await api.get('/documents/');
            setDocuments(docRes.data.filter(d => d.doc_type === 'SOIL_CARD' || d.doc_type === 'OTHER'));

            setLoading(false);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load data.");
            setLoading(false);
        }
    };

    const handleUpdateProfile = async () => {
        if (!locationInput) return toast.warning("Please enter your location.");
        setUpdatingProfile(true);
        try {
            await api.post('/user/profile/update', { location: locationInput });
            const res = await api.get('/user/data');
            setUserProfile(res.data);
            toast.success("Profile updated successfully!");
        } catch (error) {
            toast.error("Failed to update profile.");
        } finally {
            setUpdatingProfile(false);
        }
    };

    const handleApply = async () => {
        setLoading(true);
        try {
            const payload = {
                service_id: serviceId,
                crop_name: formData.crop_name,
                season: formData.season,
                irrigation_type: formData.irrigation_type || null,
                last_yield: formData.last_yield || null,
                soil_health_doc_id: formData.soil_health_doc_id ? parseInt(formData.soil_health_doc_id) : null
            };

            await api.post('/crop-advisory/apply', payload);
            setActiveStep(3); // Success Step
            toast.success("Advisory Request Submitted!");
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.detail || "Submission failed.");
        } finally {
            setLoading(false);
        }
    };

    const steps = ['Verify Profile', 'Crop Details', 'Consent', 'Status'];

    if (loading) return <LinearProgress sx={{ mt: 4 }} />;

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Paper sx={{ p: 4, borderRadius: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <AgricultureIcon color="primary" sx={{ fontSize: 40, mr: 2 }} />
                    <Typography variant="h4" fontWeight="bold" color="primary">
                        Crop Advisory Service
                    </Typography>
                </Box>
                <Typography variant="body1" color="textSecondary" gutterBottom>
                    Get expert recommendations for your crop cycle.
                </Typography>

                <Stepper activeStep={activeStep} sx={{ mb: 4, mt: 3, display: { xs: 'none', sm: 'flex' } }}>
                    {steps.map((label) => (
                        <Step key={label}><StepLabel>{label}</StepLabel></Step>
                    ))}
                </Stepper>

                {/* --- Step 0: PROFILE CHECK --- */}
                {activeStep === 0 && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <Typography variant="h6" gutterBottom>Step 1: Mandatory Data Verification</Typography>

                        {!userProfile?.location ? (
                            <Alert severity="warning" sx={{ mb: 3 }} icon={<WarningIcon fontSize="inherit" />}>
                                <Typography fontWeight="bold">Location Required</Typography>
                                To provide accurate climate-based advice, we need your Village/Region.
                            </Alert>
                        ) : (
                            <Alert severity="success" sx={{ mb: 3 }} icon={<CheckCircleIcon fontSize="inherit" />}>
                                <Typography fontWeight="bold">Profile Complete</Typography>
                                Your registered location: <strong>{userProfile.location}</strong>
                            </Alert>
                        )}

                        <Paper variant="outlined" sx={{ p: 3, bgcolor: '#fafafa' }}>
                            <Typography variant="subtitle2" gutterBottom>Select Location on Map</Typography>

                            <Box sx={{ mb: 2 }}>
                                <ErrorBoundary>
                                    <LocationPicker onSelect={(val) => setLocationInput(val)} />
                                </ErrorBoundary>
                                <Typography variant="caption" color="textSecondary">Click on the map to pinpoint your farm/village.</Typography>
                            </Box>

                            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                                <TextField
                                    label="Selected Location (Village / Region)"
                                    fullWidth
                                    value={locationInput}
                                    onChange={(e) => setLocationInput(e.target.value)}
                                    InputProps={{
                                        startAdornment: <LocationOnIcon color="action" sx={{ mr: 1 }} />
                                    }}
                                    helperText="Use the map search above or type manually"
                                />
                                <Button
                                    variant="contained"
                                    onClick={handleUpdateProfile}
                                    disabled={updatingProfile}
                                    sx={{ height: 56, mb: 3 }} // align with input
                                >
                                    {updatingProfile ? "Saving..." : "Save"}
                                </Button>
                            </Box>
                        </Paper>

                        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                            <Button
                                variant="contained"
                                endIcon={<CheckCircleIcon />}
                                disabled={!userProfile?.location}
                                onClick={() => setActiveStep(1)}
                            >
                                Next: Crop Details
                            </Button>
                        </Box>
                    </motion.div>
                )}

                {/* --- Step 1: DATA INPUT --- */}
                {activeStep === 1 && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <Typography variant="h6" gutterBottom>Step 2: Enter Crop Details</Typography>

                        <Grid container spacing={3}>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    select
                                    label="Season (Mandatory)"
                                    fullWidth
                                    value={formData.season}
                                    onChange={(e) => setFormData({ ...formData, season: e.target.value })}
                                >
                                    {SEASONS.map((option) => (
                                        <MenuItem key={option} value={option}>{option}</MenuItem>
                                    ))}
                                </TextField>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    label="Crop Type (Mandatory)"
                                    fullWidth
                                    placeholder="e.g. Wheat, Rice"
                                    value={formData.crop_name}
                                    onChange={(e) => setFormData({ ...formData, crop_name: e.target.value })}
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <TextField
                                    select
                                    label="Soil Health Card (Mandatory)"
                                    fullWidth
                                    value={formData.soil_health_doc_id}
                                    onChange={(e) => setFormData({ ...formData, soil_health_doc_id: e.target.value })}
                                    helperText="Select from your Document Vault"
                                    error={!formData.soil_health_doc_id}
                                >
                                    <MenuItem value=""><em>Select Document</em></MenuItem>
                                    {documents.map((doc) => (
                                        <MenuItem key={doc.id} value={doc.id}>
                                            {doc.title} ({doc.doc_type})
                                        </MenuItem>
                                    ))}
                                </TextField>
                                {documents.length === 0 && (
                                    <Alert severity="warning" sx={{ mt: 1 }}>
                                        No Soil Health Cards found. <Button size="small" onClick={() => navigate('/documents')}>Upload One</Button>
                                    </Alert>
                                )}
                            </Grid>

                            <Grid item xs={12}>
                                <Typography variant="caption" color="textSecondary" sx={{ mt: 2, display: 'block' }}>
                                    OPTIONAL DATA (Improves Accuracy)
                                </Typography>
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <TextField
                                    select
                                    label="Irrigation Type"
                                    fullWidth
                                    value={formData.irrigation_type}
                                    onChange={(e) => setFormData({ ...formData, irrigation_type: e.target.value })}
                                >
                                    {IRRIGATION.map((option) => (
                                        <MenuItem key={option} value={option}>{option}</MenuItem>
                                    ))}
                                </TextField>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    label="Previous Yield (Qt/Acre)"
                                    fullWidth
                                    value={formData.last_yield}
                                    onChange={(e) => setFormData({ ...formData, last_yield: e.target.value })}
                                />
                            </Grid>
                        </Grid>

                        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
                            <Button onClick={() => setActiveStep(0)}>Back</Button>
                            <Button
                                variant="contained"
                                onClick={() => setActiveStep(2)}
                                disabled={!formData.season || !formData.crop_name || !formData.soil_health_doc_id}
                            >
                                Next: Review Consent
                            </Button>
                        </Box>
                    </motion.div>
                )}

                {/* --- Step 2: CONSENT --- */}
                {activeStep === 2 && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <Typography variant="h6" gutterBottom>Step 3: Grant Information Consent</Typography>

                        <Paper variant="outlined" sx={{ p: 3, bgcolor: '#f5f5f5' }}>
                            <Box sx={{ mb: 2 }}>
                                <Typography variant="caption" color="textSecondary">REQUESTING SERVICE</Typography>
                                <Typography variant="h6">Crop Advisory Service</Typography>
                            </Box>
                            <Divider sx={{ mb: 2 }} />

                            <Box sx={{ mb: 2 }}>
                                <Typography variant="caption" color="textSecondary">DATA SHARED (ONE-TIME SNAPSHOT)</Typography>
                                <List dense>
                                    <ListItem>
                                        <ListItemIcon><LocationOnIcon /></ListItemIcon>
                                        <ListItemText primary="Location" secondary={userProfile?.location} />
                                    </ListItem>
                                    <ListItem>
                                        <ListItemIcon><AgricultureIcon /></ListItemIcon>
                                        <ListItemText primary="Crop & Season" secondary={`${formData.crop_name} - ${formData.season}`} />
                                    </ListItem>
                                    {formData.soil_health_doc_id && (
                                        <ListItem>
                                            <ListItemIcon><DescriptionIcon /></ListItemIcon>
                                            <ListItemText primary="Soil Health Card" secondary="Document Access" />
                                        </ListItem>
                                    )}
                                </List>
                            </Box>

                            <Box>
                                <Typography variant="caption" color="textSecondary">CONSENT VALIDITY</Typography>
                                <Typography variant="body1" fontWeight="bold" color="primary">7 Days</Typography>
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
                                {loading ? "Processing..." : "Grant Consent & Submit"}
                            </Button>
                        </Box>
                    </motion.div>
                )}

                {/* --- Step 3: SUCCESS --- */}
                {activeStep === 3 && (
                    <Box sx={{ textAlign: 'center', py: 5 }}>
                        <CheckCircleIcon color="success" sx={{ fontSize: 80, mb: 2 }} />
                        <Typography variant="h4" gutterBottom>Request Submitted</Typography>
                        <Typography paragraph color="textSecondary">
                            Your advisory request is with our Agri-Experts. You will receive a notification once the recommendation is ready.
                        </Typography>
                        <Button variant="outlined" onClick={() => navigate('/dashboard')}>
                            Return to Dashboard
                        </Button>
                    </Box>
                )}
            </Paper>
        </Container>
    );
};

export default CropAdvisoryPage;
