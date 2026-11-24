import { SiteVars } from "./constants"
import { ICountDown } from "./interfaces"
import axios from "axios"
import { parseJwt } from "../Helpers/AuthFunc"
import { IAnswer, IGameReport,  IWordsResponse } from "../Components/WordMemory/data"


export interface IWordHistory {
  id: number,
  word: string,
  correct: boolean,
  answerTime: Date
}

export class ApiMemory {

    private _apiUrl = `${SiteVars.mainApiUrl}`
    private _cntdwnUrl = `${SiteVars.mainApiUrl}Countdowns/`
    private _wordHistoryUrl = `${SiteVars.mainApiUrl}WordHistories/`


    SetTimer = async (token: string, option: 'start' | 'stop' ):Promise<ICountDown> => {
        // const t = parseJwt(token)
        return new Promise<ICountDown>( (resolve, reject) => {
            const requestOptions = {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`
                },
                //body: JSON.stringify({userName: userName, action: option})
                body: JSON.stringify({action: option})
            }
            fetch(this._cntdwnUrl, requestOptions)
                .then(res => res.json())
                .then(result => {
                    resolve(result)
                }).catch(err => {
                console.error(err)
                reject( { endTime: ''})
            })
        })
    }

    GetTimerEnd = async (token: string):Promise<ICountDown> => {
        const t = parseJwt(token)
        const userName = t['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name']

        return new Promise<ICountDown>( (resolve, reject) => {
            const url = `${this._cntdwnUrl}${userName}`
            fetch(url)
                .then(res => res.json())
                .then(result => {
                    if(result === '0001-01-01T00:00:00') reject( { endTime: ''})
                    resolve({ endTime: result })
                }).catch(err => {
                console.error(err)
                reject( { endTime: ''})
            })
        })
    }


    SaveHistory = async (token: string, answer: IAnswer):Promise<string> => {
        const option:IWordHistory = {
            id: 0,
            correct: answer.success??false,
            answerTime: new Date(),
            word: answer.word.translate1
        }
        return new Promise<string>( (resolve, reject) => {
            const requestOptions = {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(option)
            }
            fetch(this._wordHistoryUrl, requestOptions)
                //.then(res => res.json())
                .then(() => {
                    resolve('Ok')
                }).catch(err => {
                console.error(err)
                reject( err)
            })
        })
    }

GetWordsFromCollection = async (colId: number, token: string): Promise<IWordsResponse> => {
    const url = `${this._apiUrl}Word/collections/${colId}`;

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();

        // 1. Target the collection object (handles root array or root wrapper)
        const collectionObj = Array.isArray(data) 
            ? data[0] 
            : data?.words?.[0] ?? data?.Words?.[0];

        // 2. Extract the words list with fallback for casing differences
        const wordsList = collectionObj?.WordsCollection 
                       ?? collectionObj?.wordsCollection 
                       ?? [];

        console.log('Extracted words list:', wordsList);

        return {
            words: wordsList,
        };
    } catch (err: any) {
        console.error(err);
        
        return {
            words: [],
            isError: true,
            errorText: err?.message || 'Error parsing response',
        };
    }
};

    RenderGameReport = async (token: string): Promise<IGameReport> => {
        const url = SiteVars.mainApiUrl + 'WordReport/wordreport';
        const config = {
            headers: {'Authorization': `Bearer ${token}`
            }
        }

        return new Promise<IGameReport>( (resolve) => {
            axios.get(url, config ).then(res => {
                console.log(`result ${res.data}`)
                const re: IGameReport = {
                    attempts: res.data.attempts,
                    correctAnswers: res.data.correctAnswers,
                    theTime: res.data.theTime,
                    user: res.data.user
                }
                resolve(re)
            }).catch(err => {
                console.error(err)
            })
        })
    }

    DeleteWordHistory = async (token: string): Promise<string> => {
        const url = `${SiteVars.mainApiUrl}WordHistories`;
        const config = {
            headers: {'Authorization': `Bearer ${token}`
            }
        }
        return new Promise<string>( (resolve) => {
            axios.delete(url, config ).then(res => {
                console.log(`result ${res.data}`)
                const result: string = res.data
                resolve(result)
            }).catch(err => {
                console.error(err)
                resolve(err)
            })
        })
    }





}