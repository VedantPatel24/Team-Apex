
import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        console.error("Map Component Crashed:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <Box sx={{ p: 3, border: '1px dashed red', borderRadius: 2, textAlign: 'center', bgcolor: '#fff4f4' }}>
                    <Typography variant="body1" color="error" gutterBottom>
                        Interactive Map failed to load.
                    </Typography>
                    <Typography variant="caption" color="textSecondary" display="block" sx={{ mb: 2 }}>
                        Please type your location manually below.
                    </Typography>
                    <Button
                        size="small"
                        startIcon={<RefreshIcon />}
                        onClick={() => this.setState({ hasError: false })}
                    >
                        Retry Map
                    </Button>
                </Box>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
