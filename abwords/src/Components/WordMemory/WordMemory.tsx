// @flow
import * as React from 'react';
import { IAnswer, IWord, IWordButton, WordEmpty } from './data';
import Grid2 from '@mui/material/Grid2';
import { ArrayFuncs } from './../../Helpers/ArrayFuncs'
import Box from '@mui/material/Box';
import { Button, Dialog, Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, LinearProgress, Container } from '@mui/material';
import Countdown from '../Countdown/Countdown';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ClearIcon from '@mui/icons-material/Clear';
import { ApiMemory } from '../../Data/ApiMemory';
import dayjs from 'dayjs';
import { ITokens } from '../../Data/interfaces';


import WordReport from '../WordReport/WordReport';
import { useAnswerStore } from '../../Store/answerSlice';
import { useWordStore } from '../../Store/useWordStore';

// Define the specific matte color palette
const palette = {
    background: '#F4F6F8', // Very light grey
    paper: '#FFFFFF',      // Pure white
    textPrimary: '#1A2027',
    textSecondary: '#637381',
    matteBlue: '#3B82F6',
    matteOrange: '#F97316',
    matteGreen: '#10B981',
    matteRed: '#EF4444',
};

// Custom style object for the main quiz answer buttons
const quizButtonStyles = {
    py: 2,
    fontSize: '1.1rem',
    textTransform: 'none', // Keeps case as in data (e.g., Russian text)
    fontWeight: 500,
    borderRadius: '12px',
    boxShadow: 'none',
    '&:hover': {
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    },
    // Flex layout to handle text + icon
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 1, 
};

type FeedbackColor = 'green' | 'red' | null;

type Props = {
    collectionId: number
}


export const WordMemory:React.FC<Props> = ( { collectionId } ) => {
    
    
    const selectedCollection = useWordStore((state) => state.selectedCollection);
    
    const arFuncs = React.useMemo(() => new ArrayFuncs(), []);
    const api = React.useMemo(() => new ApiMemory(), []);
    
    const [cntDown, setCntDown] = React.useState<string | null>(null);
    const [cWord, setCWord] = React.useState<IWord>(WordEmpty);
    const [altWords, setAltWords] = React.useState<IWordButton[]>([]);
    const [isLoaded, setIsLoaded] = React.useState(false);
    const [items, setItems] = React.useState<IWord[]>([]);
    const [timerOut, setTimerOut] = React.useState(true);
    const [showDialog, setShowDialog] = React.useState(false);

    const answers = useAnswerStore((state) => state.answers)
    const addItem = useAnswerStore((state) => state.addItem)
    const cleanItems = useAnswerStore((state) => state.cleanItems)
    
    // State to track feedback color for each of the 4 buttons individually
    const [buttonFeedback, setButtonFeedback] = React.useState<FeedbackColor[]>([ null, null, null, null]);
    const [isDisabled, setIsDisabled] = React.useState(false);

    

    const isTokenStr: string = localStorage.getItem('tokens') ?? '{}';
    const tokens: ITokens = JSON.parse(isTokenStr);
    const delay: number = 1000;

    const dialogClose = React.useCallback(() => {
        setShowDialog(false);
    }, []);

    const handleTimeOut = () => {
        setTimerOut(true);
        setIsDisabled(true);
        setCntDown(null);
        api.SetTimer(tokens.accessToken, 'stop').catch(() => {});
    };

    const GetTimer = async (): Promise<string> => {
        try {
            const timerEnd = await api.GetTimerEnd(tokens.accessToken);
            if (timerEnd?.endTime && timerEnd.endTime !== '') {
                const endTime = timerEnd.endTime;
                const now = dayjs();
                const end = dayjs(endTime);
                
                if (end.isAfter(now)) {
                    setCntDown(endTime);
                    setTimerOut(false);
                    setIsDisabled(false);
                    return 'timeis';
                } else {
                    setTimerOut(true);
                    setIsDisabled(true);
                    setCntDown(null);
                    await api.SetTimer(tokens.accessToken, 'stop').catch(() => {});
                    return 'timeout';
                }
            } else {
                setTimerOut(true);
                setIsDisabled(true);
                setCntDown(null);
                return 'timeout';
            }
        } catch (err) {
            console.error("Timer Fetch Error:", err);
            setTimerOut(true);
            setIsDisabled(true);
            setCntDown(null);
            return 'error';
        }
    };

    const InitialWordLoad = async () => {
        try {
            const res = await api.GetWordsFromCollection(selectedCollection?.id??2, tokens.accessToken);
            console.log('res', res)
            setItems(res.words);
            return res.words;
        } catch (err) {
            console.error(err);
            return [];
        }
    };

    const SetWordCombination = (appItems: IWord[]) => {
        if (appItems.length === 0) return;
        const item: IWord = appItems[Math.floor(Math.random() * appItems.length)];
        setAltWords(fillAnswers2Choose(item, appItems));
        setCWord(item);
    };

React.useEffect(() => {
    let isMounted = true;

    const initData = async () => {
        try {
            const targetColId = selectedCollection?.id ?? collectionId ?? 2;
            const res = await api.GetWordsFromCollection(targetColId, tokens.accessToken);
            
            if (!isMounted) return;

            const loadedWords = res.words ?? [];
            setItems(loadedWords);

            const timerStatus = await GetTimer();
            if (!isMounted) return;

            if (timerStatus === 'timeis' && loadedWords.length > 0) {
                SetWordCombination(loadedWords);
            } else {
                setTimerOut(true);
                setIsDisabled(true);
            }
        } catch (error) {
            console.error('Initialization error:', error);
            if (isMounted) {
                setTimerOut(true);
                setIsDisabled(true);
            }
        } finally {
            if (isMounted) setIsLoaded(true);
        }
    };

    initData();

    return () => {
        isMounted = false; // Prevent state updates on unmounted components
    };
}, [selectedCollection?.id, collectionId]);

const fillAnswers2Choose = (correctItem: IWord, allItems: IWord[]): IWordButton[] => {
    const allVariants: IWordButton[] = [{ ...correctItem } as IWordButton];
    
    // Safety check: if total unique items < 4, don't enter endless loop
    if (allItems.length < 4) {
        return allItems.map(item => ({ ...item } as IWordButton));
    }

    let attempts = 0;
    const maxAttempts = 100; // Prevent main thread locks

    while (allVariants.length < 4 && attempts < maxAttempts) {
        attempts++;
        const candidate = allItems[Math.floor(Math.random() * allItems.length)];
        
        // Match on translate1 / translate2 string instead of id: 0
        const isDuplicate = allVariants.some(
            v => v.translate1 === candidate.translate1 && v.translate2 === candidate.translate2
        );

        if (!isDuplicate) {
            allVariants.push({ ...candidate } as IWordButton);
        }
    }

    return arFuncs.shuffleArray(allVariants);
};

    const handleAnswerClick = (word: IWordButton, index: number) => {
        if (isDisabled || timerOut) return;
        
        setIsDisabled(true);
        const isCorrect = word.id === cWord.id;

        // Set feedback only for the clicked button
        const newFeedback = [null, null, null, null];
        newFeedback[index] = isCorrect ? 'green' : 'red';
        setButtonFeedback(newFeedback);

        const newAnswer: IAnswer = { word: cWord, success: isCorrect };

        setTimeout(() => {
            addItem(newAnswer);
            api.SaveHistory(tokens.accessToken, newAnswer);
            SetWordCombination(items);
            // Reset feedback for next word
            setButtonFeedback([null, null, null, null]);
            setIsDisabled(false);
        }, delay);
    };

    const handleStart = async () => {
        try {
            await api.DeleteWordHistory(tokens.accessToken);
            const timerData = await api.SetTimer(tokens.accessToken, 'start');
            const newTime = timerData?.endTime || dayjs().add(5, 'minute').toISOString();
            const loadedWords = items.length > 0 ? items : await InitialWordLoad();
            cleanItems();
            SetWordCombination(loadedWords);
            setCntDown(newTime);
            setTimerOut(false);
            setIsDisabled(false);
        } catch (err) {
            console.error("Failed to start timer", err);
        }
    };

    // Calculate progress for the LinearProgress component (0 to 100)
    const progress = items.length > 0 ? (answers.length / items.length) * 100 : 0;

    return (
        // Apply light grey background to the entire page area
        <Box sx={{ bgcolor: palette.background, minHeight: '100vh', py: 4 }}>

            <Container maxWidth="lg">
                <Stack spacing={4}>
                    
                    {/* Header Area */}
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="h4" component="h1" sx={{ color: palette.textPrimary, fontWeight: 700 }}>
                            WordMemory
                        </Typography>
                        
                        <Stack direction="row" spacing={2} alignItems="center">
                            {!isLoaded ? (
                                <Typography variant="body2" sx={{ color: palette.textSecondary }}>Loading...</Typography>
                            ) : timerOut ? (
                                <Button variant='contained' size="large" onClick={handleStart} sx={{ bgcolor: palette.matteGreen, '&:hover': { bgcolor: '#0EA271' } }}>
                                    Start Session
                                </Button>
                            ) : (
                                <>
                                    {/* Inline Countdown Display */}
                                    <Paper elevation={0} sx={{ p: '10px 20px', borderRadius: '8px', border: `1px solid rgba(0,0,0,0.1)` }}>
                                        {cntDown && (
                                            <Countdown 
                                                key={cntDown}
                                                targetDate={cntDown} 
                                                onTimeOut={handleTimeOut} 
                                                isActive={!timerOut} 
                                            />
                                        )}
                                    </Paper>
                                    <Button 
                                        variant='contained' 
                                        size="large"
                                        onClick={async () => {
                                            await api.SetTimer(tokens.accessToken, 'stop');
                                            setTimerOut(true);
                                            setShowDialog(true);
                                            
                                            setCntDown(null);
                                        }}
                                        sx={{ bgcolor: palette.matteRed, '&:hover': { bgcolor: '#D32F2F' } }}
                                    >
                                        End Session
                                    </Button>
                                </>
                            )}
                        </Stack>
                    </Stack>
            <Container maxWidth="lg">
                <Stack>
                    You're exploring Word Collection '{selectedCollection?.title}' (#{selectedCollection?.id})
                </Stack>
            </Container>

                    {/* Progress Bar Area */}
                    {!timerOut && items.length > 0 && (
                        <Box sx={{ width: '100%' }}>
                            <Stack direction="row" justifyContent="space-between" mb={1}>
                                <Typography variant="body2" sx={{ color: palette.textSecondary }}>
                                    Word {answers.length + 1} of {items.length}
                                </Typography>
                                <Typography variant="body2" sx={{ color: palette.matteGreen, fontWeight: 600 }}>
                                    Streak: {answers.filter(a => a.success).length} Correct
                                </Typography>
                            </Stack>
                            <LinearProgress 
                                variant="determinate" 
                                value={progress} 
                                sx={{ 
                                    height: 10, 
                                    borderRadius: 5,
                                    bgcolor: 'rgba(16, 185, 129, 0.2)', // Light green track
                                    '& .MuiLinearProgress-bar': {
                                        bgcolor: palette.matteGreen,
                                        borderRadius: 5,
                                    }
                                }} 
                            />
                        </Box>
                    )}

                    {/* Main Content Area */}
                    <Box>
                        {!isLoaded ? (
                             <Paper elevation={1} sx={{ p: 6, textAlign: 'center', borderRadius: '16px' }}>
                                 <Typography variant="h6">Initializing data...</Typography>
                             </Paper>
                        ) : timerOut ? (
                            /* Pre-session / Post-session view */
                            <Paper elevation={1} sx={{ p: 6, textAlign: 'center', borderRadius: '16px', border: `2px dashed ${palette.textSecondary}` }}>
                                <Typography variant="h5" gutterBottom sx={{ color: palette.textPrimary, fontWeight: 600 }}>
                                    Prepare for training
                                </Typography>
                                <Typography variant="body1" sx={{ color: palette.textSecondary, mb: 4, maxWidth: '600px', mx: 'auto' }}>
                                    Click the <strong>Start Session</strong> button above to begin. 
                                    You will have a limited time to translate as many words as possible. 
                                    Focus and aim for a high streak!
                                </Typography>
                                <CheckCircleOutlineIcon sx={{ fontSize: 60, color: palette.matteGreen, opacity: 0.5 }} />
                            </Paper>
                        ) : (
                            /* Active Quiz view */
                            <Grid2 container spacing={3}>
                                {/* The Word to Translate (Question) */}
                                <Grid2 size={12}>
                                    <Paper elevation={1} sx={{ p: 4, textAlign: 'center', borderRadius: '16px' }}>
                                        <Typography variant="h3" component="div" sx={{ color: palette.matteBlue, fontWeight: 700, letterSpacing: '1px' }}>
                                            {cWord.translate1}
                                        </Typography>
                                    </Paper>
                                </Grid2>
                                
                                {/* The 4 Answer options (Multiple Choice) */}
                                {altWords.map((word, index) => {
                                    // Determine button color based on requested palette (Blue for top row, Orange for bottom row)
                                    // Assuming grid layout renders index 0,1 on top row and 2,3 on bottom row
                                    const baseColor = (index < 2) ? palette.matteBlue : palette.matteOrange;
                                    const hoverColor = (index < 2) ? '#2563EB' : '#EA580C'; // Slightly darker shades for hover

                                    // Determine feedback color (Red/Green overrides base color)
                                    const feedbackColor = buttonFeedback[index];
                                    const displayColor = feedbackColor === 'green' ? palette.matteGreen : (feedbackColor === 'red' ? palette.matteRed : baseColor);
                                    const displayHoverColor = feedbackColor === 'green' ? palette.matteGreen : (feedbackColor === 'red' ? palette.matteRed : hoverColor);

                                    return (
                                        <Grid2 size={{ xs: 12, sm: 6 }} key={`btn${word.id}_${index}`}>
                                            <Button 
                                                variant="contained" 
                                                fullWidth 
                                                disabled={isDisabled}
                                                onClick={() => handleAnswerClick(word, index)}
                                                sx={{ 
                                                    ...quizButtonStyles, 
                                                    bgcolor: displayColor,
                                                    '&:hover': {
                                                        bgcolor: displayHoverColor,
                                                    },
                                                    // Styling for disabled state to maintain visibility
                                                    '&.Mui-disabled': {
                                                        bgcolor: displayColor,
                                                        color: 'white',
                                                        opacity: feedbackColor ? 1 : 0.7 // Keep feedback visible, dim others
                                                    }
                                                }}
                                            >
                                                {word.translate2}
                                                {/* Inline feedback icons inside the button */}
                                                {feedbackColor === 'red' && <ClearIcon sx={{ color: 'white' }} />}
                                                {feedbackColor === 'green' && <CheckCircleOutlineIcon sx={{ color: 'white' }} />}
                                            </Button>
                                        </Grid2>
                                    );
                                })}
                            </Grid2>
                        )}
                    </Box>

                    {/* Results History Table Area */}
                    {answers.length > 0 && (
                        <Box>
                            <Typography variant="h6" gutterBottom sx={{ color: palette.textPrimary, fontWeight: 600, px: 1 }}>
                                Session History
                            </Typography>
                            <TableContainer component={Paper} elevation={1} sx={{ borderRadius: '16px' }}>
                                <Table sx={{ minWidth: 650 }}>
                                    <TableHead>
                                        <TableRow sx={{ bgcolor: 'rgba(0,0,0,0.02)' }}>
                                            <TableCell sx={{ fontWeight: 600, color: palette.textSecondary }}>#</TableCell>
                                            <TableCell sx={{ fontWeight: 600, color: palette.textSecondary }}>Source Word</TableCell>
                                            <TableCell sx={{ fontWeight: 600, color: palette.textSecondary }}>Your Answer</TableCell>
                                            <TableCell sx={{ fontWeight: 600, color: palette.textSecondary }} align="center">Result</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {[...answers].reverse().map((a, index) => (
                                            <TableRow key={index} hover>
                                                <TableCell sx={{ color: palette.textSecondary }}>{answers.length - index}</TableCell>
                                                <TableCell sx={{ color: palette.textPrimary, fontWeight: 500 }}>{a.word.translate1}</TableCell>
                                                <TableCell sx={{ color: palette.textPrimary }}>{a.word.translate2}</TableCell>
                                                <TableCell align="center">
                                                    {a.success ? (
                                                        <Stack direction="row" spacing={1} alignItems="center" justifyContent="center">
                                                            <CheckCircleOutlineIcon sx={{ color: palette.matteGreen, fontSize: '1.2rem' }} />
                                                            <Typography variant="body2" sx={{ color: palette.matteGreen, fontWeight: 600 }}>Correct</Typography>
                                                        </Stack>
                                                    ) : (
                                                        <Stack direction="row" spacing={1} alignItems="center" justifyContent="center">
                                                            <ClearIcon sx={{ color: palette.matteRed, fontSize: '1.2rem' }} />
                                                            <Typography variant="body2" sx={{ color: palette.matteRed, fontWeight: 600 }}>Incorrect</Typography>
                                                        </Stack>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Box>
                    )}
                </Stack>
            </Container>

            <Dialog open={showDialog} onClose={dialogClose} fullWidth maxWidth="sm">
                <WordReport showDialog={dialogClose} />
            </Dialog>
        </Box>
    );
};