// @flow
import * as React from 'react';
import { ITokens } from '../../Data/interfaces';
import { Dashboard } from '../Dashboard/Dashboard';
import StartPageNonAuth from './StartPageNonAuth';
import { Box, Container } from '@mui/material';
import { mainBoxStyles } from '../../theme';
import { useWordStore } from '../../Store/useWordStore';
//import { jwtDecode } from 'jwt-decode' // import dependency
//import * as dayjs from 'dayjs'

export const StartPage = () => {
    //const dayjs = require('dayjs')
      const isAuthenticated = useWordStore((state) => state.isAuthenticated);




    return (

   <>
    
    {
        !isAuthenticated ? 
        <>
            <StartPageNonAuth />
        </>
        
        :
        <>
            <Dashboard />

        </>
    }
    
    </>

    );
};