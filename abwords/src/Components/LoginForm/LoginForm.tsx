// @flow
import * as React from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Link from '@mui/material/Link';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Dialog from '@mui/material/Dialog';
import { useNavigate } from 'react-router';

import { emptyAuthParams, IAccount, ITokens } from '../../Data/interfaces';
import { ApiServices } from '../../Data/ApiServices';
import { useWordStore } from '../../Store/useWordStore';
import ForgotPassword from './ForgotPassword';
import SignUp from './SignUp';

const apiServices = new ApiServices();

// Extracted styles to avoid recreating objects on every render
const textFieldStyles = {
  '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.7)' },
  '& .MuiInputLabel-root.Mui-focused': { color: '#1976d2' },
  '& .MuiOutlinedInput-root': {
    bgcolor: '#1a1a1a',
    borderRadius: 1.5,
    '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.23)' },
    '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.5)' },
    '&.Mui-focused fieldset': { borderColor: '#1976d2' },
  },
  '& input': {
    color: '#ffffff',
    '&:-webkit-autofill': {
      WebkitBoxShadow: '0 0 0 100px #1a1a1a inset !important',
      WebkitTextFillColor: '#ffffff !important',
      caretColor: '#ffffff',
    },
  },
};

export const LoginForm = () => {
  const navigate = useNavigate();
  const setAuth = useWordStore((state) => state.setAuth);

  const [authRequest, setAuthRequest] = React.useState<IAccount>(emptyAuthParams);
  const [errors, setErrors] = React.useState<{ login?: string; password?: string }>({});
  const [apiError, setApiError] = React.useState<string | null>(null);

  const [openForgot, setOpenForgot] = React.useState(false);
  const [openRegister, setOpenRegister] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  const validateInputs = (): boolean => {
    const newErrors: { login?: string; password?: string } = {};

    if (!authRequest.login || !/\S+@\S+\.\S+/.test(authRequest.login)) {
      newErrors.login = 'Please enter a valid email address.';
    }

    if (!authRequest.password || authRequest.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters long.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof IAccount, value: string) => {
    setAuthRequest((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
    if (apiError) setApiError(null);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!validateInputs()) return;

    setLoading(true);
    setApiError(null);

    try {
      const res = await apiServices.AuthLogin(authRequest);

      const tokens: ITokens = {
        accessToken: res.tokens?.accessToken ?? '',
        refreshToken: res.tokens?.refreshToken ?? '',
      };

      const user = res.user ?? { id: '', userName: authRequest.login };

      // Update Zustand state so downstream components fetch data automatically
      setAuth(user, tokens);

      navigate('/dashboard');
    } catch (err: any) {
      console.error('Login Error:', err);
      setApiError(err?.message || 'Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Card
        variant="outlined"
        sx={{
          maxWidth: 360,
          width: '100%',
          bgcolor: '#121212',
          color: '#fff',
          p: 3,
          borderRadius: 3,
          boxShadow: '0px 10px 30px rgba(0, 0, 0, 0.5)',
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          margin: 'auto',
          boxSizing: 'border-box',
        }}
      >
        <Typography variant="h6" component="h1" sx={{ fontWeight: 'bold', textAlign: 'center' }}>
          Log In
        </Typography>

        {apiError && (
          <Alert severity="error" sx={{ bgcolor: '#2c0b0e', color: '#f8d7da' }}>
            {apiError}
          </Alert>
        )}

        <Box
          component="form"
          onSubmit={handleSubmit}
          noValidate
          sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
        >
          {/* Email Field */}
          <TextField
            id="login"
            name="login"
            type="email"
            label="Email Address"
            autoComplete="email"
            variant="outlined"
            size="small"
            placeholder="name@example.com"
            value={authRequest.login}
            onChange={(e) => handleInputChange('login', e.target.value)}
            error={Boolean(errors.login)}
            helperText={errors.login}
            sx={textFieldStyles}
            fullWidth
          />

          {/* Password Field */}
          <Box display="flex" flexDirection="column">
            <TextField
              id="password"
              name="password"
              type="password"
              label="Password"
              autoComplete="current-password"
              variant="outlined"
              size="small"
              placeholder="••••••••"
              value={authRequest.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              error={Boolean(errors.password)}
              helperText={errors.password}
              sx={textFieldStyles}
              fullWidth
            />
            <Link
              component="button"
              type="button"
              onClick={() => setOpenForgot(true)}
              variant="caption"
              underline="hover"
              sx={{ alignSelf: 'flex-end', mt: 0.8, color: '#4fc3f7' }}
            >
              Forgot your password?
            </Link>
          </Box>

          {/* Submit Button */}
          <Button
            type="submit"
            fullWidth
            size="medium"
            variant="contained"
            color="primary"
            disabled={loading}
            sx={{ mt: 1, py: 1, fontWeight: 'bold' }}
          >
            {loading ? <CircularProgress size={22} color="inherit" /> : 'Log In'}
          </Button>

          {/* Footer */}
          <Typography variant="caption" sx={{ textAlign: 'center', color: 'grey.400', mt: 0.5 }}>
            Don&apos;t have an account?{' '}
            <Link
              component="button"
              type="button"
              onClick={() => setOpenRegister(true)}
              variant="caption"
              underline="hover"
              sx={{ color: '#4fc3f7', fontWeight: 'bold' }}
            >
              Sign up
            </Link>
          </Typography>
        </Box>
      </Card>

      {/* Modal Dialog wrappers isolate extra forms from main document flow */}
      <Dialog open={openForgot} onClose={() => setOpenForgot(false)} maxWidth="xs" fullWidth>
        <ForgotPassword open={openForgot} handleClose={() => setOpenForgot(false)} />
      </Dialog>

      <Dialog open={openRegister} onClose={() => setOpenRegister(false)} maxWidth="xs" fullWidth>
        <SignUp open={openRegister} handleClose={() => setOpenRegister(false)} />
      </Dialog>
    </>
  );
};