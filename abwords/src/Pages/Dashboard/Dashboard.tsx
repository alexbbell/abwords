// @flow
import * as React from 'react';
import { PostsList } from '../../Components/PostsList/PostsList';
import { WordMemPage } from '../WordMemPage/WordMemPage';
import { WordMemory } from '../../Components/WordMemory/WordMemory';
type Props = {

};
export const Dashboard = (props: Props) => {
    return (
        <div>
            <h1>Dashboard</h1>
            {/* <PostsList /> */}
            <WordMemory />
        </div>
    );
};