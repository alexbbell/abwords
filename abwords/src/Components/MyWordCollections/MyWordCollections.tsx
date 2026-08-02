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
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Tooltip,
} from '@mui/material';
import FolderIcon from '@mui/icons-material/Folder';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PersonIcon from '@mui/icons-material/Person';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useWordStore } from '../../Store/useWordStore';
import { useNavigate } from 'react-router-dom';
import { SiteVars } from '../../Data/constants';
import { ITokens } from '../../Data/interfaces';

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

  // Delete Dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [selectedCollectionId, setSelectedCollectionId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState<boolean>(false);

  const navigate = useNavigate();
  const { startLearning, viewCollection } = useWordStore();

  const isTokenStr: string = localStorage.getItem('tokens') ?? '{}';
  const tokens: ITokens = JSON.parse(isTokenStr);

  const API_URL = `${SiteVars.mainApiUrl}Word/collections`;

  useEffect(() => {
    const fetchCollections = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(API_URL, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${tokens.accessToken}`,
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

  // Open confirmation dialog
  const handleOpenDeleteDialog = (id: number) => {
    setSelectedCollectionId(id);
    setDeleteDialogOpen(true);
  };

  // Close confirmation dialog
  const handleCloseDeleteDialog = () => {
    if (!deleting) {
      setDeleteDialogOpen(false);
      setSelectedCollectionId(null);
    }
  };

  // Perform API Delete Call
  const handleConfirmDelete = async () => {
    if (!selectedCollectionId) return;

    try {
      setDeleting(true);
      const response = await fetch(`${API_URL}/${selectedCollectionId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${tokens.accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: Failed to delete collection`);
      }

      // Remove item from state
      setCollections((prev) => prev.filter((item) => item.id !== selectedCollectionId));
      handleCloseDeleteDialog();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      alert(err.message || 'Failed to delete collection.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* Header Bar */}
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
        <Grid container spacing={3}>
          {collections.map((item) => (
            <Grid item xs={12} sm={6} key={item.id}>
              <Card variant="outlined" sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  {/* Title and Action Buttons */}
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
                    <Typography variant="h6" component="h2" fontWeight="medium">
                      {item.title}
                    </Typography>
                    <Box display="flex" gap={0.5}>
                      <Tooltip title="Edit Collection">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => navigate(`/collection/edit/${item.id}`)}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete Collection">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleOpenDeleteDialog(item.id)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>

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

                <CardActions sx={{ px: 2, pb: 2, gap: 1 }}>
                  <Button
                    size="small"
                    sx={{ whiteSpace: 'nowrap', width: '50%' }}
                    variant="outlined"
                    onClick={() => viewCollection(item)}
                  >
                    View All Words
                  </Button>

                  <Button
                    size="small"
                    sx={{ width: '50%' }}
                    onClick={() => {
                      startLearning(item);
                      navigate('/memory');
                    }}
                    variant="contained"
                    disableElevation
                  >
                    Start Learning
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Confirmation Dialog for Delete */}
      <Dialog open={deleteDialogOpen} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Delete Word Collection</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this collection? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog} disabled={deleting}>
            Cancel
          </Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained" disabled={deleting}>
            {deleting ? <CircularProgress size={20} color="inherit" /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default MyWordCollections;
