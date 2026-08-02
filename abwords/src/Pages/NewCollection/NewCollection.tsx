import React, { useState } from 'react';
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
import { useNavigate } from 'react-router-dom';
import { SiteVars } from '../../Data/constants';
import { ITokens } from '../../Data/interfaces';

export interface WordItem {
  translate1: string;
  translate2: string;
  translate3?: string;
}

export interface CreateCollectionDto {
  title: string;
  words: WordItem[];
}

const API_URL = SiteVars.mainApiUrl
type Props = {
    isNew: boolean
}

export const NewCollection: React.FC<Props> = ({ isNew} ) => {
  const navigate = useNavigate();
  
  const isTokenStr: string = localStorage.getItem('tokens') ?? '{}';
  const tokens: ITokens = JSON.parse(isTokenStr);

  const [title, setTitle] = useState<string>('');
  const [words, setWords] = useState<WordItem[]>([
    { translate1: '', translate2: '', translate3: '' },
  ]);

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Form Field Handlers
  const handleWordChange = (
    index: number,
    field: keyof WordItem,
    value: string
  ) => {
    const updatedWords = [...words];
    updatedWords[index][field] = value;
    setWords(updatedWords);
  };

  const handleAddWord = () => {
    setWords([...words, { translate1: '', translate2: '', translate3: '' }]);
  };

  const handleRemoveWord = (index: number) => {
    if (words.length === 1) return; // Keep at least one row
    const updatedWords = words.filter((_, i) => i !== index);
    setWords(updatedWords);
  };

  // Form Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Basic Validation
    if (!title.trim()) {
      setError('Please provide a title for the collection.');
      return;
    }

    const validWords = words.filter(
      (w) => w.translate1.trim() !== '' && w.translate2.trim() !== ''
    );

    if (validWords.length === 0) {
      setError('Please add at least one complete word and translation pair.');
      return;
    }

    const payload: CreateCollectionDto = {
      title: title.trim(),
      words: validWords,
    };

    try {
      setLoading(true);
      const response = await fetch(`${API_URL}word/collections`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tokens.accessToken}`
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: Failed to save collection`);
      }

      // Navigate back to collections list on success
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred while saving.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* Top Header & Back Button */}
      <Box display="flex" alignItems="center" mb={3} gap={1}>
        <IconButton onClick={() => navigate(-1)} color="inherit">
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" component="h1" fontWeight="bold">
          Create New Collection
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Paper elevation={0} variant="outlined" sx={{ p: 3 }}>
        <Box component="form" onSubmit={handleSubmit} noValidate>
          {/* Collection Title */}
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

          {/* Dynamic Word Pairs Form */}
          <Stack spacing={2} mb={3}>
            {words.map((item, index) => (
              <Box
                key={index}
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

          {/* Submit Button */}
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
              {loading ? 'Saving...' : 'Save Collection'}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default NewCollection;