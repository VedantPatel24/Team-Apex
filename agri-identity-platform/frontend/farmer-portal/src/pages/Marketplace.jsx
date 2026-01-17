import React, { useEffect, useState } from 'react';
import { Box, Container, Typography, Grid, Card, CardContent, CardActions, Button, Chip, Avatar } from '@mui/material';
import { motion } from 'framer-motion';
import api from '../services/api';
import StorefrontIcon from '@mui/icons-material/Storefront';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';

const Marketplace = () => {
    const [services, setServices] = useState([]);

    useEffect(() => {
        api.get('/services/')
            .then(res => setServices(res.data))
            .catch(err => console.error("Err fetching services", err));
    }, []);

    const handleConnect = (clientId) => {
        // Redirect to Authorization Page
        // In a real OAuth flow, this would be an external URL. 
        // Here, we redirect internally to our Consent Screen Mock.
        const redirectUri = "http://localhost:5173/dashboard"; // Mock callback
        const scope = "profile land_records"; // Default request

        window.location.href = `/authorize?client_id=${clientId}&scope=${scope}&redirect_uri=${redirectUri}`;
    };

    return (
        <Box sx={{ minHeight: '100vh', backgroundColor: '#f5f5f5', py: 4 }}>
            <Container maxWidth="lg">
                <Box sx={{ mb: 4, textAlign: 'center' }}>
                    <StorefrontIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
                    <Typography variant="h4" fontWeight="bold" color="textPrimary">
                        Service Marketplace
                    </Typography>
                    <Typography color="textSecondary">
                        Connect trusted agricultural services to your digital identity.
                    </Typography>
                </Box>

                <Grid container spacing={3}>
                    {services.map((service, index) => (
                        <Grid item xs={12} sm={6} md={4} key={service.id}>
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', borderRadius: 3, boxShadow: 3 }}>
                                    <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
                                        <Avatar sx={{ width: 64, height: 64, margin: '0 auto', mb: 2, bgcolor: `primary.light` }}>
                                            {service.name.charAt(0)}
                                        </Avatar>
                                        <Typography variant="h6" fontWeight="bold">
                                            {service.name}
                                        </Typography>
                                        <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                                            {service.description || "A trusted partner in the Agri Ecosystem."}
                                        </Typography>
                                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', flexWrap: 'wrap' }}>
                                            {service.allowed_scopes.map(scope => (
                                                <Chip key={scope} label={scope} size="small" variant="outlined" />
                                            ))}
                                        </Box>
                                    </CardContent>
                                    <CardActions sx={{ justifyContent: 'center', pb: 3 }}>
                                        <Button
                                            variant="contained"
                                            startIcon={<VerifiedUserIcon />}
                                            onClick={() => handleConnect(service.client_id)}
                                            sx={{ borderRadius: 20, px: 3 }}
                                        >
                                            Connect
                                        </Button>
                                    </CardActions>
                                </Card>
                            </motion.div>
                        </Grid>
                    ))}

                    {services.length === 0 && (
                        <Grid item xs={12}>
                            <Typography textAlign="center" color="textSecondary">No services found. Run the demo script to register some!</Typography>
                        </Grid>
                    )}
                </Grid>
            </Container>
        </Box>
    );
};

export default Marketplace;
