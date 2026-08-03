// Dashboard.tsx
import Container from '@mui/material/Container';
import MyWordCollections from '../../Components/MyWordCollections/MyWordCollections';
import { useWordStore } from '../../Store/useWordStore';
import { Box } from '@mui/material';
import { mainBoxStyles } from '../../theme';

export const Dashboard = () => {
    const mode = useWordStore((state) => state.mode);
    const selectedCollection = useWordStore((state) => state.selectedCollection);
    return (
      <Container maxWidth="lg">
             <h1>Dashboard</h1>
    <Box component="main" sx={mainBoxStyles}>
            {/* <PostsList /> */}

            <MyWordCollections />

            {/* View All Words View */}
      {mode === 'viewing' && selectedCollection && (
        <div>
          <h2>Viewing: {selectedCollection.title}</h2>
          {/* Render word list component here */}
        </div>
      )}
            {/* <WordMemory collectionId={selectedCollection?.id??1}  /> */}
        </Box></Container>
    );
};