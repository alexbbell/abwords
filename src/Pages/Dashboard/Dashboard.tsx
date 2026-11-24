// Dashboard.tsx
import Container from '@mui/material/Container';
import MyWordCollections from '../../Components/MyWordCollections/MyWordCollections';
import { useWordStore } from '../../Store/useWordStore';
import { Box } from '@mui/material';
import { mainBoxStyles } from '../../theme';
import { LoginForm } from '../../Components/LoginForm/LoginForm';


export const Dashboard = () => {
  const mode = useWordStore((state) => state.mode);
  const accessToken = useWordStore((state) => state.tokens?.accessToken);
  const selectedCollection = useWordStore((state) => state.selectedCollection);

  // Early return if user is not authenticated
  if (!accessToken) {
    return (
      <Container maxWidth="xs" sx={{ mt: 8 }}>
        <LoginForm />
      </Container>
    );
  }

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
      </Box>
    </Container>
  );
};