// @flow
import * as React from 'react';
import { ITokens } from '../../Data/interfaces';
import { LoginForm } from '../../Components/LoginForm/LoginForm';
import { Dashboard } from '../Dashboard/Dashboard';
import StartPageNonAuth from './StartPageNonAuth';
import { Container } from '@mui/material';
//import { jwtDecode } from 'jwt-decode' // import dependency
//import * as dayjs from 'dayjs'

export const StartPage = () => {
    //const dayjs = require('dayjs')
    const [accessToken, setAccessToken] = React.useState('')

    React.useEffect( () => {
        const isTokenStr:string = localStorage.getItem('tokens')?? '{}'
        const tokens: ITokens = JSON.parse(isTokenStr)
        console.log('isTokenStr', tokens)
        try {
            if(tokens.accessToken) {
                setAccessToken (tokens.accessToken)
            }
        } catch (err) {
            console.error(err)
        }


    }, [accessToken])


    return (
   <>
   <Container maxWidth="lg">
    {
        !accessToken || accessToken === '' ? 
        <>
            <StartPageNonAuth />
        </>
        
        :
        <>
            <h1>Page for authenticated</h1>
            <Dashboard />

        </>
    }
    
    </Container>
   </>
    );
};