// @flow
import * as React from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import Link from '@mui/material/Link';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import { useNavigate } from 'react-router';

import { emptyAuthParams, IAccount, ITokens } from '../../Data/interfaces';
import { ApiServices } from '../../Data/ApiServices';

const apiServices = new ApiServices();

export const LoginForm = () => {
  const navigate = useNavigate();

  const [authRequest, setAuthRequest] = React.useState<IAccount>(emptyAuthParams);
  const [emailError, setEmailError] = React.useState(false);
  const [emailErrorMessage, setEmailErrorMessage] = React.useState('');
  const [passwordError, setPasswordError] = React.useState(false);
  const [passwordErrorMessage, setPasswordErrorMessage] = React.useState('');
  
  const [, setOpenForgot] = React.useState(false);
  const [, setOpenRegister] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  const handleClickForgotOpen = () => setOpenForgot(true);
  // const handleForgotClose = () => setOpenForgot(false);
  
  const handleClickRegisterOpen = () => setOpenRegister(true);
  // const handleRegisterClose = () => setOpenRegister(false);

  const validateInputs = (): boolean => {
    let isValid = true;

    if (!authRequest.login || !/\S+@\S+\.\S+/.test(authRequest.login)) {
      setEmailError(true);
      setEmailErrorMessage('Please enter a valid email address.');
      isValid = false;
    } else {
      setEmailError(false);
      setEmailErrorMessage('');
    }

    if (!authRequest.password || authRequest.password.length < 6) {
      setPasswordError(true);
      setPasswordErrorMessage('Password must be at least 6 characters long.');
      isValid = false;
    } else {
      setPasswordError(false);
      setPasswordErrorMessage('');
    }

    return isValid;
  };

  const handleInputChange = (field: 'login' | 'password', value: string) => {
    setAuthRequest((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!validateInputs()) {
      return;
    }

    setLoading(true);
    try {
      const res = await apiServices.AuthLogin(authRequest);
      const tokens: ITokens = {
        accessToken: res.tokens?.accessToken ?? '',
        refreshToken: res.tokens?.refreshToken ?? '',
      };
      localStorage.setItem('tokens', JSON.stringify(tokens));
      navigate('/dashboard');
    } catch (err) {
      console.error('Login Error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Shared TextField styling for consistent high-contrast inputs & autofill handling
  const textFieldStyles = {
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

  return (
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
      }}
    >
      <Typography variant="h6" component="h1" sx={{ fontWeight: 'bold', textAlign: 'center' }}>
        Log In
      </Typography>

      <Box
        component="form"
        onSubmit={handleSubmit}
        noValidate
        sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
      >
        {/* Email Field */}
        <FormControl fullWidth>
          <Typography variant="caption" sx={{ color: 'grey.300', mb: 0.5, fontWeight: 600 }}>
            Email Address
          </Typography>
          <TextField
            id="login"
            name="login"
            type="email"
            variant="outlined"
            size="small"
            placeholder="name@example.com"
            value={authRequest.login}
            onChange={(e) => handleInputChange('login', e.target.value)}
            error={emailError}
            helperText={emailErrorMessage}
            sx={textFieldStyles}
          />
        </FormControl>

        {/* Password Field */}
        <FormControl fullWidth>
          <Typography variant="caption" sx={{ color: 'grey.300', mb: 0.5, fontWeight: 600 }}>
            Password
          </Typography>
          <TextField
            id="password"
            name="password"
            type="password"
            variant="outlined"
            size="small"
            placeholder="••••••••"
            value={authRequest.password}
            onChange={(e) => handleInputChange('password', e.target.value)}
            error={passwordError}
            helperText={passwordErrorMessage}
            sx={textFieldStyles}
          />
          <Link
            component="button"
            type="button"
            onClick={handleClickForgotOpen}
            variant="caption"
            underline="hover"
            sx={{ alignSelf: 'flex-end', mt: 0.8, color: '#4fc3f7' }}
          >
            Forgot your password?
          </Link>
        </FormControl>

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
            onClick={handleClickRegisterOpen}
            variant="caption"
            underline="hover"
            sx={{ color: '#4fc3f7', fontWeight: 'bold' }}
          >
            Sign up
          </Link>
        </Typography>
      </Box>

      {/* <ForgotPassword open={openForgot} handleClose={handleForgotClose} />
      <SignUp open={openRegister} handleClose={handleRegisterClose} /> */}
    </Card>
  );
};