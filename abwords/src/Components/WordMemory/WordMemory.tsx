// @flow
import * as React from 'react';
import './WordMemory.css'
import { IAnswer, IWord, IWordButton, WordEmpty, words } from './data';
import Grid2 from '@mui/material/Grid2';
import { ArrayFuncs } from './../../Helpers/ArrayFuncs'
import Box from '@mui/material/Box';
import { Button, Dialog, Paper, SxProps, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Theme, Typography } from '@mui/material';
import Countdown from '../Countdown/Countdown';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ClearIcon from '@mui/icons-material/Clear';
import { ApiMemory } from '../../Data/ApiMemory';
import dayjs from 'dayjs';
import { ICountDown, ITokens } from '../../Data/interfaces';
import { addItem, cleanItems } from './../../Store/answerSlice'
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../Store/store';
import WordReport from '../WordReport/WordReport';

export const bgStyles: SxProps<Theme> = {
    p: 2,
    background: "rgba(0, 0, 0, 0.3)",
    color: "white",
    borderRadius: '8px'
};

type BtnColor = 'green' | 'blue' | 'red'
type Props = {};

export const WordMemory = (props: Props) => {
    const arFuncs = React.useMemo(() => new ArrayFuncs(), []);
    const api = React.useMemo(() => new ApiMemory(), []);
    
const [cntDown, setCntDown] = React.useState<string | null>(null);

    const [cWord, setCWord] = React.useState<IWord>(WordEmpty);
    const [altWords, setAltWords] = React.useState<IWordButton[]>([]);
    const [attempt, setAttempt] = React.useState<number>(0);
    const [isLoaded, setIsLoaded] = React.useState(false)
    const [wordsLoaded, setWordsLoaded] = React.useState<boolean>(false);
    const [items, setItems] = React.useState<IWord[]>([])
    const [timerOut, setTimerOut] = React.useState(true)
    const [showDialog, setShowDialog] = React.useState(false)
    const [colorResults, setColorResults] = React.useState<BtnColor[]>([]);
    const [isDisabled, setIsDisabled] = React.useState(false)

    const answers = useSelector((state: RootState) => state.answers.answers) as IAnswer[];
    const dispatch = useDispatch();

    const isTokenStr: string = localStorage.getItem('tokens') ?? '{}'
    const tokens: ITokens = JSON.parse(isTokenStr)
    const delay: number = 1000

    const dialogClose = React.useCallback(() => {
        setShowDialog(false)
    }, [])

    const handleTimeOut = () => {
  setTimerOut(true);
  setIsDisabled(true);
    };

    const GetTimer = async (): Promise<string> => {
    try {
        const timerEnd = await api.GetTimerEnd(tokens.accessToken);
        
        // Ensure we have a fallback valid date string if the API returns empty
        const endTime = timerEnd?.endtime && timerEnd.endtime !== '' 
            ? timerEnd.endtime 
            : dayjs().toISOString(); 

        setCntDown(endTime);

        if (timerEnd?.endtime && dayjs(endTime).isAfter(dayjs())) {
            setTimerOut(false);
            setIsDisabled(false);
            return 'timeis';
        } else {
            setTimerOut(true);
            setIsDisabled(true);
            return 'timeout';
        }
    } catch (err) {
        console.error("Timer Fetch Error:", err);
        setCntDown(dayjs().toISOString()); // Fallback to now
        return 'error';
    }
}

    const InitialWordLoad = async () => {
        try {
            const res = await api.GetWordsFromCollection(1);
            setItems(res.words);
            setWordsLoaded(true);
            return res.words;
        } catch (err) {
            console.error(err);
            return [];
        }
    }

    const SetWordCombination = (appItems: IWord[]) => {
        if (appItems.length === 0) return;
        const item: IWord = appItems[Math.floor(Math.random() * appItems.length)];
        setAltWords(fillAnswers2Choose(item, appItems))
        setCWord(item)
    }

React.useEffect(() => {
    const initData = async () => {
        // Fetch words and update the 'items' state
        const loadedWords = await InitialWordLoad();
        
        // Check if there is already an active timer on the server
        const timerStatus = await GetTimer();
        
        // If timer is already running, start the game immediately
        if (timerStatus === 'timeis' && loadedWords.length > 0) {
            SetWordCombination(loadedWords);
        }
        
        setIsLoaded(true);
    };
    initData();
}, []); // Empty dependency array is correct here

    const fillAnswers2Choose = (correctItem: IWord, allItems: IWord[]): IWordButton[] => {
        const allVariants: IWordButton[] = [{ ...correctItem } as IWordButton]
        while (allVariants.length < 4 && allItems.length >= 4) {
            const newValue = allItems[Math.floor(Math.random() * allItems.length)];
            if (!allVariants.find(x => x.id === newValue.id)) {
                allVariants.push({ ...newValue } as IWordButton)
            }
        }
        return arFuncs.shuffleArray(allVariants)
    }

    const renderButton = (word: IWordButton, index: number) => {
        const result = word.id === cWord.id;
        return (
            <button key={`btn${word.id}_${index}`}
                className={`button word ${colorResults[index] || ''} item${index + 1}`}
                disabled={isDisabled || timerOut}
                onClick={() => {
                    setIsDisabled(true)
                    const isCorrect = word.id === cWord.id;

                    const colors: BtnColor[] = []
                    colors[index] = isCorrect ? 'green' : 'red'
                    setColorResults(colors)

                    const newAnswer: IAnswer = { word: cWord, success: isCorrect }

                    setTimeout(() => {
                        dispatch(addItem(newAnswer))
                        api.SaveHistory(tokens.accessToken, newAnswer)
                        SetWordCombination(items)
                        setAttempt(prev => prev + 1)
                        setColorResults([])
                        setIsDisabled(false)
                    }, delay);
                }}> 
                <span className='buttonContent'>{word.translate2}</span>
                {colorResults[index] === 'red' && <ClearIcon sx={{ color: 'red' }} />}
                {colorResults[index] === 'green' && <CheckCircleOutlineIcon sx={{ color: 'green' }} />}
            </button>
        )
    }


const handleStart = async () => {
    // 1. Clear the timer switch first to ensure the old component is unmounted 
    // or doesn't trigger a timeout during the fetch
    setTimerOut(true); 

    const [timerData, loadedWords] = await Promise.all([
        api.SetTimer(tokens.accessToken, 'start'),
        items.length > 0 ? items : InitialWordLoad()
    ]);

    const newTime = dayjs(timerData.endtime).toISOString();

    // 2. Set the data
    dispatch(cleanItems());
    setCntDown(newTime); 
    SetWordCombination(loadedWords);
    setIsDisabled(false);

    // 3. Flip the switch
    setTimerOut(false);
};

    return (
        <div>
            <h1>WordMemory</h1>
            {!isLoaded ? (
                <>Loading... </>
            ) : (
                <Grid2 container spacing={2}>
                    {/* Start/Stop Controls */}
                    
<Grid2 size={{ sm: 2 }}>
    {timerOut ? (
        <Button variant='contained' fullWidth onClick={handleStart}>
            Start
        </Button>
    ) : (
        <Button 
            variant='contained' 
            color='error' 
            fullWidth 
            onClick={async () => {
                await api.SetTimer(tokens.accessToken, 'stop');
                setTimerOut(true);
                setShowDialog(true);
                api.DeleteWordHistory(tokens.accessToken);
            }}
        >
            End
        </Button>
    )}
</Grid2>


<Grid2 size={{ sm: 10 }}>
    <Box sx={bgStyles}>
        {/* Remove the isAfter check here; let the Countdown component handle the logic */}
        {!timerOut ? (
            <Countdown 
                targetDate={cntDown} 
                onTimeOut={handleTimeOut} 
                isActive={true} 
            />
        ) : (
            <div>Session Ended</div>
        )}
    </Box>
</Grid2>

                    {/* Game Area or Prepare Block */}
                    <Grid2 size={12}>
                        {timerOut ? (
                            <Box sx={{ ...bgStyles, textAlign: 'center', mt: 4, border: '2px dashed #666' }}>
                                <Typography variant="h5" gutterBottom>Prepare for training</Typography>
                                <Typography variant="body1">
                                    Click the <strong>Start</strong> button to begin your session. 
                                    You will have a limited time to translate as many words as possible.
                                </Typography>
                            </Box>
                        ) : (
                            <div className='gcont'>
                                <div className='wordCenter question'>{cWord.translate1}</div>
                                {altWords.map((word, index) => renderButton(word, index))}
                            </div>
                        )}
                    </Grid2>

                    {/* Results Table */}
                    {answers.length > 0 && (
                        <Grid2 size={12}>
                             <Box sx={{...bgStyles, mb: 2}}>
                                Results: {answers.filter(a => a.success).length} / {answers.length}
                            </Box>
                            <TableContainer component={Paper}>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>#</TableCell>
                                            <TableCell>Wort</TableCell>
                                            <TableCell>Ubersetzung</TableCell>
                                            <TableCell>Ergebnis</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {answers.map((a, index) => (
                                            <TableRow key={index}>
                                                <TableCell>{index + 1}</TableCell>
                                                <TableCell>{a.word.translate1}</TableCell>
                                                <TableCell>{a.word.translate2}</TableCell>
                                                <TableCell>{a.success ? 'Ja!' : 'Nein'}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Grid2>
                    )}
                </Grid2>
            )}

            <Dialog open={showDialog} onClose={dialogClose}>
                <WordReport showDialog={dialogClose} />
            </Dialog>
        </div>
    );
};