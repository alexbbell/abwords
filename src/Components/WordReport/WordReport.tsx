import { ISessionStats } from '../WordMemory/data';
import {
    Box,
    Button,
    DialogTitle,
    DialogContent,
    DialogActions,
    Typography,
    Paper,
    Stack,
    Grid2,
    IconButton,
    CircularProgress,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import TimerOutlinedIcon from '@mui/icons-material/TimerOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import EqualizerIcon from '@mui/icons-material/Equalizer';
import { useNavigate } from 'react-router';

// Palette matching your main layout
const palette = {
    matteBlue: '#3B82F6',
    matteGreen: '#10B981',
    matteRed: '#EF4444',
    textPrimary: '#1A2027',
    textSecondary: '#637381',
    bgLight: '#F8FAFC'
};

type Props = {
    showDialog: () => void;
    /** Statistics of the finished session; null while loading. */
    stats: ISessionStats | null;
    error?: string | null;
    /** Go to the dashboard when closed (end of an exercise). Default true. */
    navigateOnClose?: boolean;
    /** Also list every answer of the session. */
    showAnswers?: boolean;
};

const formatDuration = (totalSeconds: number): string => {
    const s = Math.round(totalSeconds);
    const minutes = Math.floor(s / 60);
    const seconds = s % 60;
    return minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
};

const metricCaption = { fontWeight: 600, textTransform: 'uppercase' } as const;

export default function WordReport({ showDialog, stats, error, navigateOnClose = true, showAnswers = false }: Props) {
    const navigate = useNavigate();

    const closeClick = () => {
        showDialog();
        if (navigateOnClose) navigate('/dashboard');
    };

    return (
        <Box sx={{ p: 1 }}>
            {/* Header */}
            <DialogTitle sx={{ m: 0, p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Stack direction="row" spacing={1} alignItems="center">
                    <EqualizerIcon sx={{ color: palette.matteBlue }} />
                    <Typography variant="h5" component="span" sx={{ fontWeight: 700, color: palette.textPrimary }}>
                        Session Summary
                    </Typography>
                </Stack>
                <IconButton onClick={closeClick} sx={{ color: palette.textSecondary }}>
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <DialogContent dividers>
                {error ? (
                    <Typography sx={{ color: palette.matteRed, py: 4, textAlign: 'center' }}>{error}</Typography>
                ) : !stats ? (
                    <Stack alignItems="center" sx={{ py: 6 }}>
                        <CircularProgress />
                    </Stack>
                ) : (
                    <Stack spacing={3}>
                        {/* Key Metrics Grid */}
                        <Grid2 container spacing={2}>
                            {/* Answers */}
                            <Grid2 size={{ xs: 6 }}>
                                <Paper elevation={0} sx={{ p: 2, bgcolor: palette.bgLight, borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                                    <Typography variant="caption" sx={{ ...metricCaption, color: palette.textSecondary }}>
                                        Total Answers
                                    </Typography>
                                    <Typography variant="h4" sx={{ fontWeight: 700, color: palette.textPrimary, mt: 0.5 }}>
                                        {stats.totalAnswers}
                                    </Typography>
                                </Paper>
                            </Grid2>

                            {/* Duration */}
                            <Grid2 size={{ xs: 6 }}>
                                <Paper elevation={0} sx={{ p: 2, bgcolor: palette.bgLight, borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                                    <Stack direction="row" alignItems="center" spacing={0.5}>
                                        <TimerOutlinedIcon sx={{ fontSize: 16, color: palette.textSecondary }} />
                                        <Typography variant="caption" sx={{ ...metricCaption, color: palette.textSecondary }}>
                                            Duration
                                        </Typography>
                                    </Stack>
                                    <Typography variant="h4" sx={{ fontWeight: 700, color: palette.textPrimary, mt: 0.5 }}>
                                        {formatDuration(stats.durationSeconds)}
                                    </Typography>
                                </Paper>
                            </Grid2>

                            {/* Correct Answers */}
                            <Grid2 size={{ xs: 6 }}>
                                <Paper elevation={0} sx={{ p: 2, bgcolor: 'rgba(16, 185, 129, 0.08)', borderRadius: '12px', border: `1px solid ${palette.matteGreen}33` }}>
                                    <Stack direction="row" alignItems="center" spacing={0.5}>
                                        <CheckCircleOutlineIcon sx={{ fontSize: 18, color: palette.matteGreen }} />
                                        <Typography variant="caption" sx={{ ...metricCaption, fontWeight: 700, color: palette.matteGreen }}>
                                            Correct
                                        </Typography>
                                    </Stack>
                                    <Typography variant="h4" sx={{ fontWeight: 700, color: palette.matteGreen, mt: 0.5 }}>
                                        {stats.correctAnswers}
                                    </Typography>
                                </Paper>
                            </Grid2>

                            {/* Wrong Answers */}
                            <Grid2 size={{ xs: 6 }}>
                                <Paper elevation={0} sx={{ p: 2, bgcolor: 'rgba(239, 68, 68, 0.08)', borderRadius: '12px', border: `1px solid ${palette.matteRed}33` }}>
                                    <Stack direction="row" alignItems="center" spacing={0.5}>
                                        <HighlightOffIcon sx={{ fontSize: 18, color: palette.matteRed }} />
                                        <Typography variant="caption" sx={{ ...metricCaption, fontWeight: 700, color: palette.matteRed }}>
                                            Wrong
                                        </Typography>
                                    </Stack>
                                    <Typography variant="h4" sx={{ fontWeight: 700, color: palette.matteRed, mt: 0.5 }}>
                                        {stats.wrongAnswers}
                                    </Typography>
                                </Paper>
                            </Grid2>
                        </Grid2>

                        {/* Overall Accuracy Banner */}
                        <Paper
                            elevation={0}
                            sx={{
                                p: 2,
                                borderRadius: '12px',
                                bgcolor: palette.matteBlue,
                                color: '#FFFFFF',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between'
                            }}
                        >
                            <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                Accuracy Rate
                            </Typography>
                            <Typography variant="h5" sx={{ fontWeight: 800 }}>
                                {stats.accuracy}%
                            </Typography>
                        </Paper>

                        {/* Words to repeat */}
                        {stats.mistakenWords.length > 0 && (
                            <Box>
                                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: palette.textPrimary, mb: 1 }}>
                                    Words to repeat
                                </Typography>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell sx={{ fontWeight: 600, color: palette.textSecondary }}>Word</TableCell>
                                            <TableCell sx={{ fontWeight: 600, color: palette.textSecondary }}>Correct translation</TableCell>
                                            <TableCell sx={{ fontWeight: 600, color: palette.textSecondary }} align="right">Mistakes</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {stats.mistakenWords.map(w => (
                                            <TableRow key={w.wordId ?? w.word}>
                                                <TableCell sx={{ fontWeight: 500 }}>{w.word}</TableCell>
                                                <TableCell>{w.correctAnswer ?? '—'}</TableCell>
                                                <TableCell align="right" sx={{ color: palette.matteRed, fontWeight: 600 }}>
                                                    {w.wrong} / {w.attempts}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </Box>
                        )}

                        {/* All answers */}
                        {showAnswers && stats.answers.length > 0 && (
                            <Box>
                                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: palette.textPrimary, mb: 1 }}>
                                    All answers
                                </Typography>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell sx={{ fontWeight: 600, color: palette.textSecondary }}>#</TableCell>
                                            <TableCell sx={{ fontWeight: 600, color: palette.textSecondary }}>Word</TableCell>
                                            <TableCell sx={{ fontWeight: 600, color: palette.textSecondary }}>Your answer</TableCell>
                                            <TableCell sx={{ fontWeight: 600, color: palette.textSecondary }} align="center">Result</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {stats.answers.map((a, i) => (
                                            <TableRow key={a.id}>
                                                <TableCell sx={{ color: palette.textSecondary }}>{i + 1}</TableCell>
                                                <TableCell sx={{ fontWeight: 500 }}>{a.word}</TableCell>
                                                <TableCell>
                                                    {a.selectedAnswer ?? '—'}
                                                    {!a.correct && a.correctAnswer && (
                                                        <Typography variant="caption" component="div" sx={{ color: palette.textSecondary }}>
                                                            correct: {a.correctAnswer}
                                                        </Typography>
                                                    )}
                                                </TableCell>
                                                <TableCell align="center">
                                                    {a.correct
                                                        ? <CheckCircleOutlineIcon sx={{ color: palette.matteGreen, fontSize: '1.2rem' }} />
                                                        : <HighlightOffIcon sx={{ color: palette.matteRed, fontSize: '1.2rem' }} />}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </Box>
                        )}
                    </Stack>
                )}
            </DialogContent>

            {/* Modal Actions */}
            <DialogActions sx={{ p: 2, pt: 1 }}>
                <Button
                    fullWidth
                    variant="contained"
                    size="large"
                    onClick={closeClick}
                    sx={{
                        bgcolor: palette.matteGreen,
                        fontWeight: 600,
                        borderRadius: '10px',
                        textTransform: 'none',
                        boxShadow: 'none',
                        '&:hover': { bgcolor: '#0EA271', boxShadow: 'none' }
                    }}
                >
                    {navigateOnClose ? 'Continue' : 'Close'}
                </Button>
            </DialogActions>
        </Box>
    );
}
