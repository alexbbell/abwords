import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
  IconButton,
  InputAdornment,
  Link,
  TextField,
  Typography,
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { SiteVars } from '../../Data/constants';

const MIN_PASSWORD_LENGTH = 6;

export const ResetPassword: React.FC = () => {
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') ?? '';
  const code = searchParams.get('code') ?? '';
  const linkIsValid = email !== '' && code !== '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isTooShort = password.length > 0 && password.length < MIN_PASSWORD_LENGTH;
  const isMismatch = confirmPassword.length > 0 && password !== confirmPassword;
  const isFormInvalid =
    password.length < MIN_PASSWORD_LENGTH || password !== confirmPassword || loading;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isFormInvalid) return;

    setLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch(`${SiteVars.mainApiUrl}Account/ResetPassword`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, token: code, newPassword: password }),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const validationErrors = data.errors ? Object.values(data.errors).flat().join('\n') : null;
        setErrorMessage(data.message || validationErrors || 'Could not reset your password. Please try again.');
        return;
      }

      setSuccess(true);
    } catch {
      setErrorMessage('Could not reach the server. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const visibilityAdornment = (
    <InputAdornment position="end">
      <IconButton
        aria-label="toggle password visibility"
        onClick={() => setShowPassword((s) => !s)}
        onMouseDown={(e) => e.preventDefault()}
        edge="end"
      >
        {showPassword ? <VisibilityOff /> : <Visibility />}
      </IconButton>
    </InputAdornment>
  );

  return (
    <Container maxWidth="xs">
      <Box sx={{ marginTop: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Card sx={{ width: '100%', boxShadow: 3 }}>
          <CardContent sx={{ p: 4 }}>
            <Typography component="h1" variant="h5" align="center" gutterBottom fontWeight="bold">
              Reset Password
            </Typography>

            {!linkIsValid ? (
              <>
                <Alert severity="error" sx={{ mb: 2 }}>
                  This reset link is invalid or incomplete. Please request a new one.
                </Alert>
                <Button variant="contained" href="/forgot" fullWidth>
                  Request New Link
                </Button>
              </>
            ) : success ? (
              <>
                <Alert severity="success" sx={{ mb: 2 }}>
                  Your password has been reset. You can now sign in with your new password.
                </Alert>
                <Button variant="contained" href="/login" fullWidth>
                  Go to Login
                </Button>
              </>
            ) : (
              <>
                <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
                  Choose a new password for <strong>{email}</strong>.
                </Typography>

                {errorMessage && (
                  <Alert severity="error" sx={{ mb: 2, whiteSpace: 'pre-line' }}>
                    {errorMessage}
                    <Box sx={{ mt: 1 }}>
                      <Link href="/forgot" variant="body2">
                        Request a new reset link
                      </Link>
                    </Box>
                  </Alert>
                )}

                <Box component="form" onSubmit={handleSubmit} noValidate>
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    autoFocus
                    id="newPassword"
                    label="New Password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    error={isTooShort}
                    helperText={isTooShort ? `At least ${MIN_PASSWORD_LENGTH} characters` : ''}
                    disabled={loading}
                    InputProps={{ endAdornment: visibilityAdornment }}
                  />

                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    id="confirmNewPassword"
                    label="Confirm New Password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    error={isMismatch}
                    helperText={isMismatch ? 'Passwords must match' : ''}
                    disabled={loading}
                  />

                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    size="large"
                    disabled={isFormInvalid}
                    sx={{ mt: 2, mb: 2 }}
                  >
                    {loading ? <CircularProgress size={24} color="inherit" /> : 'Reset Password'}
                  </Button>

                  <Box textAlign="center">
                    <Link href="/login" variant="body2" underline="hover">
                      Back to Sign In
                    </Link>
                  </Box>
                </Box>
              </>
            )}
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};

export default ResetPassword;
