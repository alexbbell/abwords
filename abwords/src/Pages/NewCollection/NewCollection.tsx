import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  Paper,
  IconButton,
  Alert,
  CircularProgress,
  Stack,
  Divider,
} from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import AddIcon from '@mui/icons-material/Add';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import { useNavigate, useParams } from 'react-router-dom';
import { SiteVars } from '../../Data/constants';
import { ITokens } from '../../Data/interfaces';

export interface WordItem {
  id?: number | string;
  translate1: string;
  translate2: string;
  translate3?: string;
  tempId?: string; // Used for React keys without polluting backend 'id'
}

export interface CollectionResponseDto {
  Id?: number;
  Title?: string;
  title?: string;
  WordsCollection?: WordItem[];
  collection?: WordItem[];
}

const API_URL = SiteVars.mainApiUrl;

type Props = {
  isNew: boolean;
};

export const NewCollection: React.FC<Props> = ({ isNew }) => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const isTokenStr: string = localStorage.getItem('tokens') ?? '{}';
  const tokens: ITokens = JSON.parse(isTokenStr);

  const [title, setTitle] = useState<string>('');
  const [words, setWords] = useState<WordItem[]>([
    {
      id: crypto.randomUUID(),
      tempId: crypto.randomUUID(),
      translate1: '',
      translate2: '',
      translate3: '',
    },
  ]);

  const [loading, setLoading] = useState<boolean>(false);
  const [initialFetchLoading, setInitialFetchLoading] = useState<boolean>(!isNew);
  const [error, setError] = useState<string | null>(null);

  // Load existing collection when editing
  useEffect(() => {
    if (isNew || !id) return;

    const fetchCollection = async () => {
      try {
        setInitialFetchLoading(true);
        const response = await fetch(`${API_URL}word/collections/${id}`, {
          headers: {
            Authorization: `Bearer ${tokens.accessToken}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Error ${response.status}: Failed to load collection details`);
        }

        const data: CollectionResponseDto[] | CollectionResponseDto = await response.json();
        const collection = Array.isArray(data) ? data[0] : data;

        if (!collection) {
          throw new Error('Collection data not found.');
        }

        setTitle(collection.Title || collection.title || '');

        const rawWords = collection.WordsCollection || collection.collection || [];

        if (rawWords.length > 0) {
          setWords(
            rawWords.map((w) => ({
              ...w,
              id: w.id || crypto.randomUUID(), // Guarantee GUID exists
              tempId: crypto.randomUUID(), // Local React list key
            }))
          );
        }
      } catch (err: any) {
        setError(err.message || 'Failed to fetch collection details.');
      } finally {
        setInitialFetchLoading(false);
      }
    };

    fetchCollection();
  }, [id, isNew, tokens.accessToken]);

  // Form Field Handlers
  const handleWordChange = (
    index: number,
    field: keyof WordItem,
    value: string
  ) => {
    const updatedWords = [...words];
    updatedWords[index] = { ...updatedWords[index], [field]: value };
    setWords(updatedWords);
  };

  const handleAddWord = () => {
    setWords([
      ...words,
      {
        id: crypto.randomUUID(),
        tempId: crypto.randomUUID(),
        translate1: '',
        translate2: '',
        translate3: '',
      },
    ]);
  };

  const handleRemoveWord = (index: number) => {
    if (words.length === 1) return;
    const updatedWords = words.filter((_, i) => i !== index);
    setWords(updatedWords);
  };

  // Form Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError('Please provide a title for the collection.');
      return;
    }

    // Sanitize payload before sending to backend
    const validWords = words
      .filter((w) => w.translate1.trim() !== '' && w.translate2.trim() !== '')
      .map((w) => ({
        id: w.id || crypto.randomUUID(), // Always ensure an ID is sent
        translate1: w.translate1.trim(),
        translate2: w.translate2.trim(),
        translate3: w.translate3?.trim() || '',
      }));

    if (validWords.length === 0) {
      setError('Please add at least one complete word and translation pair.');
      return;
    }

    const payload = {
      title: title.trim(),
      Words: validWords,
    };

    const targetUrl = isNew
      ? `${API_URL}word/collections`
      : `${API_URL}word/collections/${id}`;

    const method = isNew ? 'POST' : 'PUT';

    try {
      setLoading(true);
      const response = await fetch(targetUrl, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${tokens.accessToken}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(
          `Error ${response.status}: Failed to ${isNew ? 'create' : 'update'} collection`
        );
      }

      navigate('/');
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred while saving.');
    } finally {
      setLoading(false);
    }
  };

  if (initialFetchLoading) {
    return (
      <Container maxWidth="md" sx={{ py: 8, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box display="flex" alignItems="center" mb={3} gap={1}>
        <IconButton onClick={() => navigate(-1)} color="inherit">
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" component="h1" fontWeight="bold">
          {isNew ? 'Create New Collection' : 'Edit Collection'}
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Paper elevation={0} variant="outlined" sx={{ p: 3 }}>
        <Box component="form" onSubmit={handleSubmit} noValidate>
          <TextField
            label="Collection Title"
            fullWidth
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Travel Vocabulary - Spanish"
            sx={{ mb: 4 }}
          />

          <Typography variant="h6" fontWeight="medium" mb={2}>
            Words & Translations
          </Typography>

          <Stack spacing={2} mb={3}>
            {words.map((item, index) => (
              <Box
                key={item.tempId || item.id || index}
                display="flex"
                alignItems="center"
                gap={2}
                sx={{
                  p: 1.5,
                  borderRadius: 1,
                  bgcolor: 'background.default',
                }}
              >
                <TextField
                  label={`Word #${index + 1}`}
                  variant="outlined"
                  size="small"
                  fullWidth
                  value={item.translate1}
                  onChange={(e) =>
                    handleWordChange(index, 'translate1', e.target.value)
                  }
                />
                <TextField
                  label="Translation"
                  variant="outlined"
                  size="small"
                  fullWidth
                  value={item.translate2}
                  onChange={(e) =>
                    handleWordChange(index, 'translate2', e.target.value)
                  }
                />
                <IconButton
                  color="error"
                  onClick={() => handleRemoveWord(index)}
                  disabled={words.length === 1}
                  aria-label="delete word pair"
                >
                  <DeleteOutlineIcon />
                </IconButton>
              </Box>
            ))}
          </Stack>

          <Button
            startIcon={<AddIcon />}
            onClick={handleAddWord}
            variant="outlined"
            sx={{ mb: 4 }}
          >
            Add Word Pair
          </Button>

          <Divider sx={{ mb: 3 }} />

          <Box display="flex" justifyContent="flex-end" gap={2}>
            <Button
              variant="outlined"
              color="inherit"
              onClick={() => navigate(-1)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              startIcon={
                loading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />
              }
              disabled={loading}
            >
              {loading ? 'Saving...' : isNew ? 'Save Collection' : 'Update Collection'}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default NewCollection;