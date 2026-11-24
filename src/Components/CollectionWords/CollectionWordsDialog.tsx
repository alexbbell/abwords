import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Alert,
    Box,
    Button,
    Chip,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    InputAdornment,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Tooltip,
    Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import BarChartIcon from '@mui/icons-material/BarChart';
import { ApiMemory } from '../../Data/ApiMemory';
import { IWord, IWordStat } from '../WordMemory/data';
import { useWordStore } from '../../Store/useWordStore';
import { WordCollection } from '../MyWordCollections/MyWordCollections';

const palette = {
    textPrimary: '#1A2027',
    textSecondary: '#637381',
    matteRed: '#EF4444',
};

type Props = {
    collection: WordCollection;
    onClose: () => void;
};

/** Read-only list of all words in a collection, with the user's mistakes highlighted. */
export const CollectionWordsDialog: React.FC<Props> = ({ collection, onClose }) => {
    const accessToken = useWordStore((state) => state.tokens.accessToken);
    const startLearning = useWordStore((state) => state.startLearning);
    const navigate = useNavigate();
    const api = React.useMemo(() => new ApiMemory(), []);

    const [words, setWords] = React.useState<IWord[]>([]);
    const [mistakes, setMistakes] = React.useState<Map<string, IWordStat>>(new Map());
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);
    const [search, setSearch] = React.useState('');

    React.useEffect(() => {
        const token = accessToken ?? '';
        let active = true;
        setLoading(true);
        setError(null);

        api.GetWordsFromCollection(collection.id, token)
            .then(res => {
                if (!active) return;
                if (res.isError) setError(res.errorText ?? 'Could not load the words.');
                setWords(res.words ?? []);
            })
            .finally(() => { if (active) setLoading(false); });

        // Optional: highlight words the user gets wrong (ignore failures, the list still works)
        api.GetOverview(token, collection.id, 50)
            .then(res => {
                if (!active) return;
                setMistakes(new Map(res.mostMistakenWords.map(w => [w.wordId ?? w.word, w])));
            })
            .catch(() => {});

        return () => { active = false; };
    }, [api, accessToken, collection.id]);

    const mistakeFor = (w: IWord) => mistakes.get(String(w.id)) ?? mistakes.get(w.translate1);

    const query = search.trim().toLowerCase();
    const filtered = query
        ? words.filter(w => [w.translate1, w.translate2, w.translate3]
            .some(t => t?.toLowerCase().includes(query)))
        : words;
    const hasThirdColumn = words.some(w => w.translate3);

    const goTo = (url: string) => {
        onClose();
        navigate(url);
    };

    return (
        <Dialog open onClose={onClose} fullWidth maxWidth="md" scroll="paper">
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
                <Box>
                    <Typography variant="h5" component="span" sx={{ fontWeight: 700, color: palette.textPrimary }}>
                        {collection.title}
                    </Typography>
                    {!loading && (
                        <Typography variant="body2" sx={{ color: palette.textSecondary }}>
                            {words.length} {words.length === 1 ? 'word' : 'words'}
                            {mistakes.size > 0 && ` · ${mistakes.size} to repeat`}
                        </Typography>
                    )}
                </Box>
                <Stack direction="row" spacing={0.5}>
                    <Tooltip title="Edit collection">
                        <IconButton onClick={() => goTo(`/collection/edit/${collection.id}`)}><EditIcon /></IconButton>
                    </Tooltip>
                    <Tooltip title="Statistics">
                        <IconButton onClick={() => goTo(`/statistics?collectionId=${collection.id}`)}><BarChartIcon /></IconButton>
                    </Tooltip>
                    <IconButton onClick={onClose} aria-label="Close"><CloseIcon /></IconButton>
                </Stack>
            </DialogTitle>

            <DialogContent dividers>
                {loading ? (
                    <Stack alignItems="center" sx={{ py: 6 }}><CircularProgress /></Stack>
                ) : error ? (
                    <Alert severity="error">{error}</Alert>
                ) : words.length === 0 ? (
                    <Typography sx={{ color: palette.textSecondary, py: 4, textAlign: 'center' }}>
                        This collection has no words yet.
                    </Typography>
                ) : (
                    <Stack spacing={2}>
                        <TextField
                            size="small"
                            placeholder="Search words…"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            slotProps={{
                                input: {
                                    startAdornment: (
                                        <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment>
                                    ),
                                },
                            }}
                        />
                        <TableContainer>
                            <Table size="small" stickyHeader>
                                <TableHead>
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: 600, color: palette.textSecondary }}>#</TableCell>
                                        <TableCell sx={{ fontWeight: 600, color: palette.textSecondary }}>Word</TableCell>
                                        <TableCell sx={{ fontWeight: 600, color: palette.textSecondary }}>Translation</TableCell>
                                        {hasThirdColumn && (
                                            <TableCell sx={{ fontWeight: 600, color: palette.textSecondary }}>Extra</TableCell>
                                        )}
                                        <TableCell sx={{ fontWeight: 600, color: palette.textSecondary }} align="right">Mistakes</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {filtered.map((w, i) => {
                                        const m = mistakeFor(w);
                                        return (
                                            <TableRow key={`${w.id}_${i}`} hover>
                                                <TableCell sx={{ color: palette.textSecondary }}>{words.indexOf(w) + 1}</TableCell>
                                                <TableCell sx={{ fontWeight: 500, color: palette.textPrimary }}>{w.translate1}</TableCell>
                                                <TableCell>{w.translate2}</TableCell>
                                                {hasThirdColumn && <TableCell>{w.translate3 ?? ''}</TableCell>}
                                                <TableCell align="right">
                                                    {m && (
                                                        <Tooltip title={`${m.wrong} wrong of ${m.attempts} answers`}>
                                                            <Chip
                                                                size="small"
                                                                label={`${m.wrong} / ${m.attempts}`}
                                                                sx={{ bgcolor: 'rgba(239, 68, 68, 0.1)', color: palette.matteRed, fontWeight: 600 }}
                                                            />
                                                        </Tooltip>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                    {filtered.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={hasThirdColumn ? 5 : 4} align="center" sx={{ color: palette.textSecondary, py: 3 }}>
                                                No words match “{search}”.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Stack>
                )}
            </DialogContent>

            <DialogActions sx={{ p: 2 }}>
                <Button onClick={onClose}>Close</Button>
                <Button
                    variant="contained"
                    disableElevation
                    disabled={loading || words.length === 0}
                    onClick={() => {
                        startLearning(collection);
                        navigate(`/memory/${collection.id}`);
                    }}
                >
                    Start Learning
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default CollectionWordsDialog;
