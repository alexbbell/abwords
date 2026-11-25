import React, { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
  Typography,
} from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { SiteVars } from '../../Data/constants';

type Status = 'loading' | 'success' | 'error';

export const ConfirmEmail: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<Status>('loading');
  const [message, setMessage] = useState<string>('');
  // Prevents a double request in React StrictMode (dev) where effects run twice
  const requestSent = useRef(false);

  useEffect(() => {
    if (requestSent.current) return;
    requestSent.current = true;

    const userId = searchParams.get('userId');
    const code = searchParams.get('code');

    if (!userId || !code) {
      setStatus('error');
      setMessage('This confirmation link is invalid or incomplete.');
      return;
    }

    const confirm = async () => {
      try {
        const query = new URLSearchParams({ userId, code }).toString();
        const response = await fetch(`${SiteVars.mainApiUrl}Account/ConfirmEmail?${query}`);
        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          setStatus('error');
          setMessage(data.message || 'This confirmation link is invalid or has expired.');
          return;
        }

        setStatus('success');
        setMessage(data.message || 'Email confirmed successfully.');
      } catch {
        setStatus('error');
        setMessage('Could not reach the server. Please try again later.');
      }
    };

    confirm();
  }, [searchParams]);

  return (
    <Container maxWidth="xs">
      <Box sx={{ marginTop: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Card sx={{ width: '100%', boxShadow: 3 }}>
          <CardContent sx={{ p: 4, textAlign: 'center' }}>
            <Typography component="h1" variant="h5" gutterBottom fontWeight="bold">
              Email Confirmation
            </Typography>

            {status === 'loading' && (
              <Box sx={{ py: 4 }}>
                <CircularProgress />
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                  Confirming your email…
                </Typography>
              </Box>
            )}

            {status === 'success' && (
              <Box sx={{ py: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                <CheckCircleOutlineIcon color="success" sx={{ fontSize: 60 }} />
                <Alert severity="success" sx={{ width: '100%' }}>
                  {message} Your account is now active.
                </Alert>
                <Button variant="contained" href="/login" fullWidth>
                  Go to Login
                </Button>
              </Box>
            )}

            {status === 'error' && (
              <Box sx={{ py: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                <ErrorOutlineIcon color="error" sx={{ fontSize: 60 }} />
                <Alert severity="error" sx={{ width: '100%' }}>
                  {message}
                </Alert>
                <Button variant="outlined" href="/signup" fullWidth>
                  Back to Sign Up
                </Button>
              </Box>
            )}
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};

export default ConfirmEmail;
