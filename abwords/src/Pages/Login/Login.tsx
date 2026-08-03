// @flow
import * as React from 'react';
import { ITokens } from '../../Data/interfaces';

import { Dashboard } from '../Dashboard/Dashboard';
import { Box, Container } from '@mui/material';
import { LoginForm } from '../../Components/LoginForm/LoginForm';
import { mainBoxStyles } from '../../theme';
//import { jwtDecode } from 'jwt-decode' // import dependency
//import * as dayjs from 'dayjs'

export const LoginPage = () => {
    //const dayjs = require('dayjs')
    const [accessToken, setAccessToken] = React.useState('')

    React.useEffect(() => {
        const isTokenStr: string = localStorage.getItem('tokens') ?? '{}'
        const tokens: ITokens = JSON.parse(isTokenStr)
        console.log('isTokenStr', tokens)
        try {
            if (tokens.accessToken) {
                setAccessToken(tokens.accessToken)
            }
        } catch (err) {
            console.error(err)
        }


    }, [accessToken])


    return (

        <Box sx={mainBoxStyles}>
            <Container maxWidth="lg">
                {
                    !accessToken || accessToken === '' ?
                        <LoginForm />
                        :
                        <>
                            <Dashboard />

                        </>
                }

            </Container>
        </Box>
    );
};
export default LoginPage;