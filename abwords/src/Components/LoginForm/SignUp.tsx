import * as React from 'react';
import {
  Box,
  Button,
  Card,
  Checkbox,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  FormControlLabel,
  IconButton,
  InputAdornment,
  TextField,
  Typography
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import './Logins.css';
import { SiteVars } from '../../Data/constants';

interface SignUpProps {
  open?: boolean;
  host?: string; // Add your custom host here (e.g. "https://api.example.com")
  handleClose?: () => void;
  onSignUpSuccess?: (data: IFormRegister) => void;
}

interface IErrorDialog {
  open: boolean;
  errorText: string;
}

interface IFormRegister {
  email: string;
  password: string;
  confirmPassword: string;
  agreeTerms: boolean;
}

const initialFormState: IFormRegister = {
  email: '',
  password: '',
  confirmPassword: '',
  agreeTerms: false,
};

export default function SignUp({ 
  host = '', 
  handleClose, 
  onSignUpSuccess 
}: SignUpProps) {
  const [formRegister, setFormRegister] = React.useState<IFormRegister>(initialFormState);
  const [touched, setTouched] = React.useState<{ [key: string]: boolean }>({});
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errorDialog, setErrorDialog] = React.useState<IErrorDialog>({
    open: false,
    errorText: '',
  });

  // Toggle password visibilities
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);

  const handleClickShowPassword = () => setShowPassword((show) => !show);
  const handleClickShowConfirmPassword = () => setShowConfirmPassword((show) => !show);

  const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  };

  const handleChange = (field: keyof IFormRegister) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = field === 'agreeTerms' ? event.target.checked : event.target.value;
    setFormRegister((prev) => ({ ...prev, [field]: value }));
  };

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const isPasswordMismatch =
    formRegister.confirmPassword.length > 0 &&
    formRegister.password !== formRegister.confirmPassword;

  const isFormInvalid =
    !formRegister.email ||
    !formRegister.password ||
    !formRegister.confirmPassword ||
    formRegister.password !== formRegister.confirmPassword ||
    !formRegister.agreeTerms ||
    isSubmitting;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!formRegister.agreeTerms) {
      setErrorDialog({
        open: true,
        errorText: 'You must agree to the terms and conditions.',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      
      // Ensure clean URL formatting
      
      const endpoint = `${SiteVars.mainApiUrl}Account/RegisterUser`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formRegister.email,
          password: formRegister.password,
          confirmPassword: formRegister.confirmPassword
        }),
      });

      if (!response.ok) {
        // Try to parse server error response if available
        let errorMessage = 'Registration failed. Please try again.';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.title || errorMessage;
        } catch {
          // Fallback if response isn't JSON
        }
        throw new Error(errorMessage);
      }

      // Successful registration
      if (onSignUpSuccess) {
        onSignUpSuccess(formRegister);
      }
    } catch (error) {
      setErrorDialog({
        open: true,
        errorText: error instanceof Error ? error.message : 'An unexpected error occurred.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card
      elevation={8}
      sx={{
        width: 380,
        borderRadius: 3,
        p: 4,
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.25)',
      }}
    >
      <Typography component="h1" variant="h5" fontWeight="600" sx={{ mb: 3 }}>
        Sign Up
      </Typography>

      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}
      >
        <TextField
          autoFocus
          required
          variant="outlined"
          size="medium"
          id="email"
          name="email"
          label="Email Address"
          placeholder="email@example.com"
          type="email"
          value={formRegister.email}
          onChange={handleChange('email')}
          onBlur={() => handleBlur('email')}
          error={touched.email && formRegister.email === ''}
          helperText={touched.email && formRegister.email === '' ? 'Email is required' : ''}
          fullWidth
          disabled={isSubmitting}
        />

        <TextField
          required
          variant="outlined"
          size="medium"
          id="password"
          name="password"
          label="Password"
          placeholder="••••••••"
          type={showPassword ? 'text' : 'password'}
          value={formRegister.password}
          onChange={handleChange('password')}
          fullWidth
          disabled={isSubmitting}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  aria-label="toggle password visibility"
                  onClick={handleClickShowPassword}
                  onMouseDown={handleMouseDownPassword}
                  edge="end"
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        <TextField
          required
          variant="outlined"
          size="medium"
          id="confirmPassword"
          name="confirmPassword"
          label="Confirm Password"
          placeholder="••••••••"
          type={showConfirmPassword ? 'text' : 'password'}
          value={formRegister.confirmPassword}
          onChange={handleChange('confirmPassword')}
          error={isPasswordMismatch}
          helperText={isPasswordMismatch ? 'Passwords must match' : ''}
          fullWidth
          disabled={isSubmitting}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  aria-label="toggle confirm password visibility"
                  onClick={handleClickShowConfirmPassword}
                  onMouseDown={handleMouseDownPassword}
                  edge="end"
                >
                  {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        <FormControlLabel
          control={
            <Checkbox
              sx={{
                color: '#999',
                '&.Mui-checked': { color: '#1976d2' },
              }}
              checked={formRegister.agreeTerms}
              onChange={handleChange('agreeTerms')}
              name="agreeTerms"
              disabled={isSubmitting}
            />
          }
          label={
            <Typography variant="body2">
              I agree to the terms & conditions
            </Typography>
          }
        />

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5, mt: 1 }}>
          <Button 
            onClick={handleClose} 
            disabled={isSubmitting} 
            sx={{ color: 'rgba(255, 255, 255, 0.7)' }}
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            type="submit"
            disabled={isFormInvalid}
            sx={{ minWidth: 100 }}
          >
            {isSubmitting ? <CircularProgress size={24} color="inherit" /> : 'Register'}
          </Button>
        </Box>
      </Box>

      {/* Error Alert Dialog */}
      <Dialog
        open={errorDialog.open}
        onClose={() => setErrorDialog({ open: false, errorText: '' })}
      >
        <DialogContent>{errorDialog.errorText}</DialogContent>
        <DialogActions>
          <Button onClick={() => setErrorDialog({ open: false, errorText: '' })}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
}