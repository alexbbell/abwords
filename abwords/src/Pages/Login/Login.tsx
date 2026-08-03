// @flow
import * as React from 'react';
import { Box, Container } from '@mui/material';
import { Navigate } from 'react-router-dom';

import { LoginForm } from '../../Components/LoginForm/LoginForm';
import { mainBoxStyles } from '../../theme';
import { useWordStore } from '../../Store/useWordStore';

export const LoginPage = () => {
  const isAuthenticated = useWordStore((state) => state.isAuthenticated);

  // If the user is already authenticated, redirect them directly to the dashboard
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <Box sx={mainBoxStyles}>
      <Container maxWidth="lg">
        <LoginForm />
      </Container>
    </Box>
  );
};

export default LoginPage;