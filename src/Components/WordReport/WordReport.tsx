import React, { useEffect } from 'react';
import { ApiMemory } from '../../Data/ApiMemory';
import { emptyGameReport, IGameReport } from '../WordMemory/data';
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
    IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import TimerOutlinedIcon from '@mui/icons-material/TimerOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import EqualizerIcon from '@mui/icons-material/Equalizer';
import { useNavigate } from 'react-router';
import { useWordStore } from '../../Store/useWordStore';
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
};

export default function WordReport(props: Props) {
    const [report, setReport] = React.useState<IGameReport>(emptyGameReport);
    const navigate = useNavigate()
    // Instantiate memoized API call or keep instance inside component hook context
    const api = React.useMemo(() => new ApiMemory(), []);
    const tokens = useWordStore((state) => state.tokens);
    
    
    

    const closeClick = () => {
        props.showDialog();
        navigate('/dashboard')
    };

    useEffect(() => {
        api.RenderGameReport(tokens.accessToken??'')
            .then(res => {
                setReport(res);
            })
            .catch(err => {
                console.error(err);
            });
    }, [api, tokens.accessToken]);

    const incorrectAnswers = Math.max(0, report.attempts - report.correctAnswers);
    const accuracy = report.attempts > 0 
        ? Math.round((report.correctAnswers / report.attempts) * 100) 
        : 0;

    return (
        <Box sx={{ p: 1 }}>
            {/* Header */}
            <DialogTitle sx={{ m: 0, p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Stack direction="row" spacing={1} alignItems="center">
                    <EqualizerIcon sx={{ color: palette.matteBlue }} />
                    <Typography variant="h5" component="span" sx={{ fontWeight: 700, color: palette.bgLight }}>
                        Session Summary
                    </Typography>
                </Stack>
                <IconButton onClick={closeClick} sx={{ color: palette.textSecondary }}>
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <DialogContent dividers >
                <Stack spacing={3}>
                    {/* Key Metrics Grid */}
                    <Grid2 container spacing={2}>
                        
                        {/* Attempts */}
                        <Grid2 size={{ xs: 6 }}>
                            <Paper elevation={0} sx={{ p: 2, bgcolor: palette.bgLight, borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                                <Typography variant="caption" sx={{ color: palette.textSecondary, fontWeight: 600, textTransform: 'uppercase' }}>
                                    Total Attempts
                                </Typography>
                                <Typography variant="h4" sx={{ fontWeight: 700, color: palette.textPrimary, mt: 0.5 }}>
                                    {report.attempts}
                                </Typography>
                            </Paper>
                        </Grid2>

                        {/* Duration */}
                        <Grid2 size={{ xs: 6 }}>
                            <Paper elevation={0} sx={{ p: 2, bgcolor: palette.bgLight, borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                                <Stack direction="row" alignItems="center" spacing={0.5}>
                                    <TimerOutlinedIcon sx={{ fontSize: 16, color: palette.textSecondary }} />
                                    <Typography variant="caption" sx={{ color: palette.textSecondary, fontWeight: 600, textTransform: 'uppercase' }}>
                                        Duration
                                    </Typography>
                                </Stack>
                                <Typography variant="h4" sx={{ fontWeight: 700, color: palette.textPrimary, mt: 0.5 }}>
                                    {report.theTime || '0s'}
                                </Typography>
                            </Paper>
                        </Grid2>

                        {/* Correct Answers */}
                        <Grid2 size={{ xs: 6 }}>
                            <Paper elevation={0} sx={{ p: 2, bgcolor: 'rgba(16, 185, 129, 0.08)', borderRadius: '12px', border: `1px solid ${palette.matteGreen}33` }}>
                                <Stack direction="row" alignItems="center" spacing={0.5}>
                                    <CheckCircleOutlineIcon sx={{ fontSize: 18, color: palette.matteGreen }} />
                                    <Typography variant="caption" sx={{ color: palette.matteGreen, fontWeight: 700, textTransform: 'uppercase' }}>
                                        Correct
                                    </Typography>
                                </Stack>
                                <Typography variant="h4" sx={{ fontWeight: 700, color: palette.matteGreen, mt: 0.5 }}>
                                    {report.correctAnswers}
                                </Typography>
                            </Paper>
                        </Grid2>

                        {/* Incorrect Answers */}
                        <Grid2 size={{ xs: 6 }}>
                            <Paper elevation={0} sx={{ p: 2, bgcolor: 'rgba(239, 68, 68, 0.08)', borderRadius: '12px', border: `1px solid ${palette.matteRed}33` }}>
                                <Stack direction="row" alignItems="center" spacing={0.5}>
                                    <HighlightOffIcon sx={{ fontSize: 18, color: palette.matteRed }} />
                                    <Typography variant="caption" sx={{ color: palette.matteRed, fontWeight: 700, textTransform: 'uppercase' }}>
                                        Incorrect
                                    </Typography>
                                </Stack>
                                <Typography variant="h4" sx={{ fontWeight: 700, color: palette.matteRed, mt: 0.5 }}>
                                    {incorrectAnswers}
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
                            justify: 'space-between'
                        }}
                    >
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                            Accuracy Rate &nbsp;
                        </Typography>
                        <Typography variant="h5" sx={{ fontWeight: 800 }}>
                            {accuracy}%
                        </Typography>
                    </Paper>

                </Stack>
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
                    Continue
                </Button>
            </DialogActions>
        </Box>
    );
}