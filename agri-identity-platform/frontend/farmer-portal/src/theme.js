import { createTheme } from '@mui/material/styles';

const theme = createTheme({
    typography: {
        fontFamily: '"Outfit", "Roboto", "Helvetica", "Arial", sans-serif',
        h1: { fontWeight: 700 },
        h2: { fontWeight: 600 },
        h3: { fontWeight: 600 },
        button: { textTransform: 'none', fontWeight: 600 },
    },
    shape: {
        borderRadius: 12,
    },
    palette: {
        primary: {
            main: '#2E7D32', // Agri Green
            light: '#4CAF50',
            dark: '#1B5E20',
            contrastText: '#ffffff',
        },
        secondary: {
            main: '#FFB300', // harvest Gold
            contrastText: '#000000',
        },
        background: {
            default: '#F5F9F6', // Very light green tint
            paper: '#ffffff',
        },
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: '8px',
                    padding: '10px 24px',
                    boxShadow: 'none',
                    '&:hover': {
                        boxShadow: '0px 4px 12px rgba(46, 125, 50, 0.2)',
                    },
                },
                containedPrimary: {
                    background: 'linear-gradient(45deg, #2E7D32 30%, #4CAF50 90%)',
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    boxShadow: '0px 8px 24px rgba(0,0,0,0.05)',
                    border: '1px solid rgba(0,0,0,0.03)',
                },
            },
        },
        MuiTextField: {
            styleOverrides: {
                root: {
                    '& .MuiOutlinedInput-root': {
                        borderRadius: '12px',
                    },
                },
            },
        },
    },
});

export default theme;
