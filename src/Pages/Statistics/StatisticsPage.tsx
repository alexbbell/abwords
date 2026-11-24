import * as React from 'react';
import axios from 'axios';
import dayjs from 'dayjs';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
    Alert,
    Box,
    Chip,
    CircularProgress,
    Container,
    Dialog,
    FormControl,
    Grid2,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TablePagination,
    TableRow,
    Typography,
} from '@mui/material';
import { ApiMemory } from '../../Data/ApiMemory';
import { SiteVars } from '../../Data/constants';
import { useWordStore } from '../../Store/useWordStore';
import { LoginForm } from '../../Components/LoginForm/LoginForm';
import WordReport from '../../Components/WordReport/WordReport';
import { IExerciseOverview, IPaged, ISessionStats, ISessionSummary } from '../../Components/WordMemory/data';
import { WordCollection } from '../../Components/MyWordCollections/MyWordCollections';

const palette = {
    background: '#F4F6F8',
    textPrimary: '#1A2027',
    textSecondary: '#637381',
    matteBlue: '#3B82F6',
    matteGreen: '#10B981',
    matteOrange: '#F97316',
    matteRed: '#EF4444',
};

const formatDuration = (totalSeconds: number): string => {
    const s = Math.round(totalSeconds);
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    if (h > 0) return `${h}h ${m}m`;
    if (m > 0) return `${m}m ${sec}s`;
    return `${sec}s`;
};

const accuracyColor = (accuracy: number) =>
    accuracy >= 80 ? palette.matteGreen : accuracy >= 50 ? palette.matteOrange : palette.matteRed;

const StatTile = ({ label, value, color = palette.textPrimary }: { label: string; value: React.ReactNode; color?: string }) => (
    <Paper elevation={1} sx={{ p: 2.5, borderRadius: '12px', height: '100%' }}>
        <Typography variant="caption" sx={{ color: palette.textSecondary, fontWeight: 600, textTransform: 'uppercase' }}>
            {label}
        </Typography>
        <Typography variant="h4" sx={{ fontWeight: 700, color, mt: 0.5 }}>
            {value}
        </Typography>
    </Paper>
);

export const StatisticsPage: React.FC = () => {
    const accessToken = useWordStore((state) => state.tokens?.accessToken);
    const api = React.useMemo(() => new ApiMemory(), []);
    const navigate = useNavigate();

    const [searchParams, setSearchParams] = useSearchParams();
    const collectionId = Number(searchParams.get('collectionId')) || null;

    const [collections, setCollections] = React.useState<WordCollection[]>([]);
    const [overview, setOverview] = React.useState<IExerciseOverview | null>(null);
    const [sessions, setSessions] = React.useState<IPaged<ISessionSummary> | null>(null);
    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(10);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);

    // Session details dialog
    const [detailsOpen, setDetailsOpen] = React.useState(false);
    const [details, setDetails] = React.useState<ISessionStats | null>(null);
    const [detailsError, setDetailsError] = React.useState<string | null>(null);

    const collectionTitle = React.useCallback(
        (id: number | null) => (id == null ? '—' : collections.find(c => c.id === id)?.title ?? `#${id}`),
        [collections]
    );

    // Collections for the filter / titles
    React.useEffect(() => {
        if (!accessToken) return;
        axios.get<WordCollection[]>(`${SiteVars.mainApiUrl}Word/collections`, {
            headers: { Authorization: `Bearer ${accessToken}` },
        })
            .then(res => setCollections(res.data ?? []))
            .catch(err => console.error('Failed to load collections', err));
    }, [accessToken]);

    // Overview: reload when the filter changes
    React.useEffect(() => {
        if (!accessToken) return;
        let active = true;
        setOverview(null);
        api.GetOverview(accessToken, collectionId)
            .then(res => { if (active) setOverview(res); })
            .catch(err => {
                console.error(err);
                if (active) setError('Could not load statistics.');
            });
        return () => { active = false; };
    }, [api, accessToken, collectionId]);

    // Session list: reload on filter / paging
    React.useEffect(() => {
        if (!accessToken) return;
        let active = true;
        setLoading(true);
        api.GetSessions(accessToken, collectionId, page + 1, rowsPerPage)
            .then(res => { if (active) setSessions(res); })
            .catch(err => {
                console.error(err);
                if (active) setError('Could not load statistics.');
            })
            .finally(() => { if (active) setLoading(false); });
        return () => { active = false; };
    }, [api, accessToken, collectionId, page, rowsPerPage]);

    const changeCollection = (value: string) => {
        setPage(0);
        setError(null);
        setSearchParams(value ? { collectionId: value } : {});
    };

    const openSession = async (sessionId: number) => {
        if (!accessToken) return;
        setDetails(null);
        setDetailsError(null);
        setDetailsOpen(true);
        try {
            setDetails(await api.GetSessionStats(accessToken, sessionId));
        } catch (err) {
            console.error(err);
            setDetailsError('Could not load the session statistics.');
        }
    };

    if (!accessToken) {
        return (
            <Container maxWidth="xs" sx={{ mt: 8 }}>
                <LoginForm />
            </Container>
        );
    }

    const isEmpty = overview?.sessionCount === 0;

    return (
        <Box sx={{ bgcolor: palette.background, minHeight: '100vh', py: 4 }}>
            <Container maxWidth="lg">
                <Stack spacing={4}>
                    {/* Header + filter */}
                    <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'stretch', sm: 'center' }} spacing={2}>
                        <Typography variant="h4" component="h1" sx={{ color: palette.textPrimary, fontWeight: 700 }}>
                            Statistics
                        </Typography>
                        <FormControl size="small" sx={{ minWidth: 240, bgcolor: '#FFF' }}>
                            <InputLabel id="stats-collection-label">Collection</InputLabel>
                            <Select
                                labelId="stats-collection-label"
                                label="Collection"
                                value={collectionId ? String(collectionId) : ''}
                                onChange={(e) => changeCollection(e.target.value)}
                            >
                                <MenuItem value="">All collections</MenuItem>
                                {collections.map(c => (
                                    <MenuItem key={c.id} value={String(c.id)}>{c.title}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Stack>

                    {error && <Alert severity="error">{error}</Alert>}

                    {!overview && !error ? (
                        <Stack alignItems="center" sx={{ py: 8 }}><CircularProgress /></Stack>
                    ) : isEmpty ? (
                        <Paper elevation={1} sx={{ p: 6, textAlign: 'center', borderRadius: '16px' }}>
                            <Typography variant="h6" sx={{ color: palette.textPrimary, fontWeight: 600 }}>
                                No exercises yet
                            </Typography>
                            <Typography sx={{ color: palette.textSecondary, mt: 1 }}>
                                Start learning a word collection and your results will show up here.
                            </Typography>
                        </Paper>
                    ) : overview && (
                        <>
                            {/* Overview tiles */}
                            <Grid2 container spacing={2}>
                                <Grid2 size={{ xs: 6, md: 3 }}>
                                    <StatTile label="Sessions" value={overview.sessionCount} />
                                </Grid2>
                                <Grid2 size={{ xs: 6, md: 3 }}>
                                    <StatTile label="Answers" value={overview.totalAnswers} />
                                </Grid2>
                                <Grid2 size={{ xs: 6, md: 3 }}>
                                    <StatTile label="Accuracy" value={`${overview.accuracy}%`} color={accuracyColor(overview.accuracy)} />
                                </Grid2>
                                <Grid2 size={{ xs: 6, md: 3 }}>
                                    <StatTile label="Time practiced" value={formatDuration(overview.totalDurationSeconds)} />
                                </Grid2>
                            </Grid2>

                            <Stack direction="row" spacing={3} sx={{ color: palette.textSecondary, px: 1 }}>
                                <Typography variant="body2">
                                    <Box component="span" sx={{ color: palette.matteGreen, fontWeight: 600 }}>{overview.correctAnswers}</Box> correct
                                </Typography>
                                <Typography variant="body2">
                                    <Box component="span" sx={{ color: palette.matteRed, fontWeight: 600 }}>{overview.wrongAnswers}</Box> wrong
                                </Typography>
                                {overview.lastSessionAt && (
                                    <Typography variant="body2">
                                        Last session {dayjs(overview.lastSessionAt).format('DD.MM.YYYY HH:mm')}
                                    </Typography>
                                )}
                            </Stack>

                            {/* Most mistaken words */}
                            <Box>
                                <Typography variant="h6" gutterBottom sx={{ color: palette.textPrimary, fontWeight: 600, px: 1 }}>
                                    Words to repeat
                                </Typography>
                                {overview.mostMistakenWords.length === 0 ? (
                                    <Paper elevation={1} sx={{ p: 3, borderRadius: '16px' }}>
                                        <Typography sx={{ color: palette.textSecondary }}>No mistakes so far. Well done!</Typography>
                                    </Paper>
                                ) : (
                                    <TableContainer component={Paper} elevation={1} sx={{ borderRadius: '16px' }}>
                                        <Table>
                                            <TableHead>
                                                <TableRow sx={{ bgcolor: 'rgba(0,0,0,0.02)' }}>
                                                    <TableCell sx={{ fontWeight: 600, color: palette.textSecondary }}>Word</TableCell>
                                                    <TableCell sx={{ fontWeight: 600, color: palette.textSecondary }}>Correct translation</TableCell>
                                                    <TableCell sx={{ fontWeight: 600, color: palette.textSecondary }} align="right">Mistakes</TableCell>
                                                    <TableCell sx={{ fontWeight: 600, color: palette.textSecondary }} align="right">Accuracy</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {overview.mostMistakenWords.map(w => {
                                                    const acc = w.attempts ? Math.round((w.correct / w.attempts) * 100) : 0;
                                                    return (
                                                        <TableRow key={w.wordId ?? w.word} hover>
                                                            <TableCell sx={{ fontWeight: 500, color: palette.textPrimary }}>{w.word}</TableCell>
                                                            <TableCell>{w.correctAnswer ?? '—'}</TableCell>
                                                            <TableCell align="right" sx={{ color: palette.matteRed, fontWeight: 600 }}>
                                                                {w.wrong} / {w.attempts}
                                                            </TableCell>
                                                            <TableCell align="right" sx={{ color: accuracyColor(acc), fontWeight: 600 }}>
                                                                {acc}%
                                                            </TableCell>
                                                        </TableRow>
                                                    );
                                                })}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                )}
                            </Box>

                            {/* Session history */}
                            <Box>
                                <Typography variant="h6" gutterBottom sx={{ color: palette.textPrimary, fontWeight: 600, px: 1 }}>
                                    Session history
                                </Typography>
                                <TableContainer component={Paper} elevation={1} sx={{ borderRadius: '16px' }}>
                                    <Table>
                                        <TableHead>
                                            <TableRow sx={{ bgcolor: 'rgba(0,0,0,0.02)' }}>
                                                <TableCell sx={{ fontWeight: 600, color: palette.textSecondary }}>Date</TableCell>
                                                <TableCell sx={{ fontWeight: 600, color: palette.textSecondary }}>Collection</TableCell>
                                                <TableCell sx={{ fontWeight: 600, color: palette.textSecondary }} align="right">Duration</TableCell>
                                                <TableCell sx={{ fontWeight: 600, color: palette.textSecondary }} align="right">Correct</TableCell>
                                                <TableCell sx={{ fontWeight: 600, color: palette.textSecondary }} align="right">Wrong</TableCell>
                                                <TableCell sx={{ fontWeight: 600, color: palette.textSecondary }} align="right">Accuracy</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {loading && !sessions ? (
                                                <TableRow>
                                                    <TableCell colSpan={6} align="center"><CircularProgress size={24} /></TableCell>
                                                </TableRow>
                                            ) : sessions?.items.map(s => (
                                                <TableRow
                                                    key={s.sessionId}
                                                    hover
                                                    onClick={() => openSession(s.sessionId)}
                                                    sx={{ cursor: 'pointer', opacity: loading ? 0.5 : 1 }}
                                                >
                                                    <TableCell>{dayjs(s.startedAt).format('DD.MM.YYYY HH:mm')}</TableCell>
                                                    <TableCell>{collectionTitle(s.collectionId)}</TableCell>
                                                    <TableCell align="right">
                                                        {s.finishedAt
                                                            ? formatDuration(dayjs(s.finishedAt).diff(dayjs(s.startedAt), 'second'))
                                                            : <Chip size="small" label="In progress" color="primary" variant="outlined" />}
                                                    </TableCell>
                                                    <TableCell align="right" sx={{ color: palette.matteGreen, fontWeight: 600 }}>{s.correctAnswers}</TableCell>
                                                    <TableCell align="right" sx={{ color: palette.matteRed, fontWeight: 600 }}>{s.wrongAnswers}</TableCell>
                                                    <TableCell align="right" sx={{ color: accuracyColor(s.accuracy), fontWeight: 700 }}>
                                                        {s.totalAnswers ? `${s.accuracy}%` : '—'}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                    <TablePagination
                                        component="div"
                                        count={sessions?.totalCount ?? 0}
                                        page={page}
                                        onPageChange={(_, p) => setPage(p)}
                                        rowsPerPage={rowsPerPage}
                                        onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
                                        rowsPerPageOptions={[10, 25, 50]}
                                    />
                                </TableContainer>
                            </Box>

                            {collectionId && (
                                <Typography
                                    variant="body2"
                                    onClick={() => navigate(`/memory/${collectionId}`)}
                                    sx={{ color: palette.matteBlue, cursor: 'pointer', px: 1, '&:hover': { textDecoration: 'underline' } }}
                                >
                                    Practice “{collectionTitle(collectionId)}” again →
                                </Typography>
                            )}
                        </>
                    )}
                </Stack>
            </Container>

            <Dialog open={detailsOpen} onClose={() => setDetailsOpen(false)} fullWidth maxWidth="sm">
                <WordReport
                    showDialog={() => setDetailsOpen(false)}
                    stats={details}
                    error={detailsError}
                    navigateOnClose={false}
                    showAnswers
                />
            </Dialog>
        </Box>
    );
};

export default StatisticsPage;
