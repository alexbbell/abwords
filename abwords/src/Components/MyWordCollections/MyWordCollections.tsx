
import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Card,
  CardContent,
  CardActions,
  Grid,
  Box,
  CircularProgress,
  Alert,
  Button,
  Divider,
  Grid2,
} from '@mui/material';
import FolderIcon from '@mui/icons-material/Folder';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PersonIcon from '@mui/icons-material/Person';
import { useWordStore } from '../../Store/useWordStore';
import { useNavigate } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import { SiteVars } from '../../Data/constants';
import { ITokens } from '../../Data/interfaces';

// TypeScript interface matching your API response
export interface WordCollection {
  id: number;
  title: string;
  author: string | null;
  pubDate: string;
  updDate: string;
}


export const MyWordCollections: React.FC = () => {
  const [collections, setCollections] = useState<WordCollection[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate()
  const { startLearning, viewCollection } = useWordStore();
  const isTokenStr: string = localStorage.getItem('tokens') ?? '{}';
  const tokens: ITokens = JSON.parse(isTokenStr);
  
  const API_URL = `${SiteVars.mainApiUrl}Word/wordcollections`;

  useEffect(() => {
    console.log('tol', tokens)
    const fetchCollections = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(API_URL, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tokens.accessToken}`
        },
        });

        if (!response.ok) {
          throw new Error(`Error ${response.status}: Failed to fetch word collections`);
        }

        const data: WordCollection[] = await response.json();
        setCollections(data);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        setError(err.message || 'An unexpected error occurred.');
      } finally {
        setLoading(false);
      }
    };

    fetchCollections();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
    
    <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
      <Box display="flex" alignItems="center" gap={1}>
        <FolderIcon color="primary" fontSize="large" />
        <Typography variant="h4" component="h1" fontWeight="bold">
          Word Collections
        </Typography>
      </Box>

      <Button
        variant="contained"
        color="primary"
        startIcon={<AddIcon />}
        onClick={() => navigate('/collection/new')}
      >
        Add New Collection
      </Button>
    </Box>

      {/* Loading State */}
      {loading && (
        <Box display="flex" justifyContent="center" alignItems="center" py={8}>
          <CircularProgress />
        </Box>
      )}

      {/* Error State */}
      {error && !loading && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Empty State */}
      {!loading && !error && collections.length === 0 && (
        <Alert severity="info">No word collections available yet.</Alert>
      )}

      {/* List / Grid Display */}
      {!loading && !error && collections.length > 0 && (
        <Grid2 container spacing={3}>
          {collections.map((item) => (
            <Grid item xs={12} sm={6} key={item.id}>
              <Card variant="outlined" sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" component="h2" gutterBottom fontWeight="medium">
                    {item.title}
                  </Typography>

                  <Box display="flex" alignItems="center" gap={0.5} mb={1}>
                    <PersonIcon fontSize="small" color="action" />
                    <Typography variant="body2" color="text.secondary">
                      {item.author ? item.author : 'Anonymous'}
                    </Typography>
                  </Box>

                  <Divider sx={{ my: 1.5 }} />

                  <Box display="flex" alignItems="center" gap={0.5} mt={1}>
                    <CalendarTodayIcon fontSize="inherit" color="action" />
                    <Typography variant="caption" color="text.secondary">
                      Published: {formatDate(item.pubDate)}
                    </Typography>
                  </Box>
                </CardContent>

                <CardActions sx={{ px: 2, pb: 2,}}>
                   <Button size="small" sx={{ whiteSpace: 'nowrap', width: '50%' }}
                    variant="contained" disableElevation 
                    onClick={() => viewCollection(item)}>
                    View All Words 
                    </Button>

                  <Button size="small" sx={{width: '50%'}}
                    onClick={() => {
                      startLearning(item);
                      navigate('/memory')
                    }}
                    variant="contained" 
                    disableElevation
                    fullWidth>
                    Start Learning
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid2>
      )}
    </Container>
  );
};

export default MyWordCollections;