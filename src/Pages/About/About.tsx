// @flow
import {
  Box,
  Container,
  Typography,
  Chip,
  Stack,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { mainBoxStyles } from '../../theme';

export const About = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Box component="main" sx={mainBoxStyles}>
      <Container maxWidth="lg">
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' },
            gap: { xs: 6, md: 10 },
            alignItems: 'center',
          }}
        >
          {/* Left Column: Hero Text */}
          <Stack spacing={3} alignItems={isMobile ? 'center' : 'flex-start'}>
            <Chip
              icon={<AutoAwesomeIcon fontSize="small" />}
              label="Distraction-Free Vocabulary Building"
              color="primary"
              variant="outlined"
              size="small"
              sx={{ fontWeight: 600 }}
            />

            <Typography
              variant="h3"
              component="h1"
              sx={{
                fontWeight: 800,
                color: 'text.primary',
                textAlign: isMobile ? 'center' : 'left',
                fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
                lineHeight: 1.2,
              }}
            >
              Welcome to <br />
              <Box component="span" sx={{ color: 'primary.main' }}>
                WordMemory Trainer
              </Box>
            </Typography>

            <Typography
              variant="body1"
              color="text.secondary"
              sx={{
                textAlign: isMobile ? 'center' : 'left',
                fontSize: '1.1rem',
                lineHeight: 1.6,
              }}
            >
              Designed for self-motivated learners who appreciate a focused,
              academic approach to vocabulary acquisition.
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                textAlign: isMobile ? 'center' : 'left',
                opacity: 0.85,
                lineHeight: 1.6,
              }}
            >
              No pushy notifications or distracting widgets—just a straightforward
              tool built to help you master new foreign words at your own pace.
            </Typography>
          </Stack>

          {/* Right Column: Form Container */}

        </Box>
      </Container>
    </Box>
  );
};

export default About;