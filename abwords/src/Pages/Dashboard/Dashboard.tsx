// Dashboard.tsx
import MyWordCollections from '../../Components/MyWordCollections/MyWordCollections';
import { useWordStore } from '../../Store/useWordStore';

export const Dashboard = () => {
    const mode = useWordStore((state) => state.mode);
    const selectedCollection = useWordStore((state) => state.selectedCollection);
    return (
        <div>
            <h1>Dashboard</h1>
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
        </div>
    );
};