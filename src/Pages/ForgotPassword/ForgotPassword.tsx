import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  TextField,
  Typography,
  Alert,
  CircularProgress,
  Link,
} from '@mui/material';
import { Turnstile } from '@marsidev/react-turnstile';
import { SiteVars } from '../../Data/constants';

// Replace with your actual Cloudflare Turnstile Site Key
// (Use '1x00000000000000000000AA' for testing - always passes)
const TURNSTILE_SITE_KEY = '1x00000000000000000000AA';

export const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  
  const [loading, setLoading] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!captchaToken) {
      setErrorMessage('Please complete the CAPTCHA verification.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const response = await fetch(`${SiteVars.mainApiUrl}Account/Forgotten`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          turnstileToken: captchaToken, // Pass token to backend for verification
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send reset link. Please check your email.');
      }

      setSuccessMessage('Password reset instructions have been sent to your email.');
      setEmail('');
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage('An unexpected error occurred. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Card sx={{ width: '100%', boxShadow: 3 }}>
          <CardContent sx={{ p: 4 }}>
            <Typography component="h1" variant="h5" align="center" gutterBottom fontWeight="bold">
              Forgot Password
            </Typography>

            <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
              Enter your email address and we'll send you a link to reset your password.
            </Typography>

            {successMessage && (
              <Alert severity="success" sx={{ mb: 2 }}>
                {successMessage}
              </Alert>
            )}

            {errorMessage && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {errorMessage}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit} noValidate>
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />

              {/* Cloudflare Turnstile Container */}
              <Box sx={{ my: 2, display: 'flex', justifyContent: 'center' }}>
                <Turnstile
                  siteKey={TURNSTILE_SITE_KEY}
                  onSuccess={(token) => {
                    setCaptchaToken(token);
                    setErrorMessage(null);
                  }}
                  onError={() => {
                    setCaptchaToken(null);
                    setErrorMessage('CAPTCHA validation failed. Please try again.');
                  }}
                  onExpire={() => {
                    setCaptchaToken(null);
                  }}
                />
              </Box>

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading || !captchaToken}
                sx={{ mt: 1, mb: 2 }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Send Reset Link'}
              </Button>

              <Box textAlign="center" sx={{ mt: 1 }}>
                <Link href="/login" variant="body2" underline="hover">
                  Back to Sign In
                </Link>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};

export default ForgotPassword;