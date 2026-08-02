// @flow
import { useState } from 'react';
import { Box, Alert, AlertTitle, Typography, Button, Link, Stack } from '@mui/material';
import SignUp from '../../Components/LoginForm/SignUp';
import { mainBoxStyles } from '../../theme';
import { SiteVars } from '../../Data/constants';

export const SignupPage = () => {
    const [userEmail, setUserEmail] = useState<string | null>(null);
    const [resendCooldown, setResendCooldown] = useState<number>(0);

    function handleClose(): void {
        throw new Error('Function not implemented.');
    }

    const handleSignUpSuccess = (data: { email?: string }) => {
        console.log('Registered!', data);
        setUserEmail(data?.email || 'your email address');
    };

    const handleResendEmail = () => {
        // API call to resend verification email
        setResendCooldown(60);
        // Start timer logic here
    };

    return (
        <Box component="main" sx={mainBoxStyles}>
            <h1>Signup</h1>

            {userEmail ? (
                <Stack spacing={2} sx={{ width: '100%', maxWidth: 450 }}>
                    <Alert severity="success">
                        <AlertTitle>Registration Successful!</AlertTitle>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                            We sent a verification link to <strong>{userEmail}</strong>. Please check your inbox and confirm your email to activate your account.
                        </Typography>
                        <Typography variant="caption" color="text.secondary" display="block">
                            Can't find it? Check your spam/junk folder.
                        </Typography>
                    </Alert>

                    <Stack direction="row" spacing={2} justifyContent="space-between">
                        <Button 
                            variant="outlined" 
                            size="small" 
                            onClick={handleResendEmail}
                            disabled={resendCooldown > 0}
                        >
                            {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Email'}
                        </Button>

                        <Button 
                            variant="contained" 
                            size="small" 
                            href="/login"
                        >
                            Go to Login
                        </Button>
                    </Stack>

                    <Typography variant="caption" textAlign="center">
                        Need help? <Link href="/support">Contact Support</Link>
                    </Typography>
                </Stack>
            ) : (
                <SignUp 
                    host={SiteVars.mainApiUrl} 
                    handleClose={handleClose} 
                    onSignUpSuccess={handleSignUpSuccess} 
                />
            )}
        </Box>
    );
};