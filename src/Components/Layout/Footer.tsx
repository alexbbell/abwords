import React from 'react';
import {
  Box,
  Container,
  Grid,
  Typography,
  Link,
  IconButton,
  Divider,
  Stack,
} from '@mui/material';
import GitHubIcon from '@mui/icons-material/GitHub';
import TwitterIcon from '@mui/icons-material/Twitter';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import LanguageIcon from '@mui/icons-material/Language';
import { useNavigate } from 'react-router-dom';

export const Footer: React.FC = () => {
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();

  return (
    <Box
      component="footer"
      sx={{
        bgcolor: 'background.paper',
        color: 'text.secondary',
        py: 6,
        mt: 'auto',
        borderTop: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4} justifyContent="space-between">
          {/* Brand & Description */}
          <Grid item xs={12} md={4}>
            <Stack spacing={1.5}>
              <Box display="flex" alignItems="center" gap={1}>
                <LanguageIcon color="primary" fontSize="large" />
                <Typography variant="h6" fontWeight="bold" color="text.primary">
                  VocabApp
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Master new languages effortlessly. Build custom collections, track your learning progress, and expand your vocabulary every day.
              </Typography>
            </Stack>
          </Grid>

          {/* Quick Links */}
          <Grid item xs={6} sm={3} md={2}>
            <Typography variant="subtitle2" fontWeight="bold" color="text.primary" gutterBottom>
              Navigation
            </Typography>
            <Stack spacing={1}>
              <Link
                component="button"
                variant="body2"
                underline="hover"
                color="inherit"
                onClick={() => navigate('/')}
                sx={{ textAlign: 'left' }}
              >
                Collections
              </Link>
              <Link
                component="button"
                variant="body2"
                underline="hover"
                color="inherit"
                onClick={() => navigate('/collection/new')}
                sx={{ textAlign: 'left' }}
              >
                New Collection
              </Link>

            </Stack>
          </Grid>

          {/* Resources / Account */}
          <Grid item xs={6} sm={3} md={2}>
            <Typography variant="subtitle2" fontWeight="bold" color="text.primary" gutterBottom>
              Account & Info
            </Typography>
            <Stack spacing={1}>
              <Link
                component="button"
                variant="body2"
                underline="hover"
                color="inherit"
                onClick={() => navigate('/profile')}
                sx={{ textAlign: 'left' }}
              >
                Profile
              </Link>
              <Link
                component="button"
                variant="body2"
                underline="hover"
                color="inherit"
                onClick={() => navigate('/privacy')}
                sx={{ textAlign: 'left' }}
              >
                Privacy Policy
              </Link>
              <Link
                component="button"
                variant="body2"
                underline="hover"
                color="inherit"
                onClick={() => navigate('/terms')}
                sx={{ textAlign: 'left' }}
              >
                Terms of Service
              </Link>
            </Stack>
          </Grid>

          {/* Social Links */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="subtitle2" fontWeight="bold" color="text.primary" gutterBottom>
              Connect With Us
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={1.5}>
              Follow along for updates and continuous language tips.
            </Typography>
            <Stack direction="row" spacing={1}>
              <IconButton color="inherit" aria-label="GitHub" href="https://github.com" target="_blank">
                <GitHubIcon fontSize="small" />
              </IconButton>
              <IconButton color="inherit" aria-label="Twitter" href="https://twitter.com" target="_blank">
                <TwitterIcon fontSize="small" />
              </IconButton>
              <IconButton color="inherit" aria-label="LinkedIn" href="https://linkedin.com" target="_blank">
                <LinkedInIcon fontSize="small" />
              </IconButton>
            </Stack>
          </Grid>
        </Grid>

        <Divider sx={{ my: 4 }} />

        {/* Bottom Bar / Copyright */}
        <Box
          display="flex"
          flexDirection={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          alignItems="center"
          gap={2}
        >
          <Typography variant="body2" color="text.secondary">
            © {currentYear} VocabApp. All rights reserved.
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Built with React & Material UI
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;