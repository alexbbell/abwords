// @flow
import { Dashboard } from '../Dashboard/Dashboard';
import StartPageNonAuth from './StartPageNonAuth';
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