import './App.css';
import { StartPage } from './Pages/StartPage/StartPage';
import { Route, Routes } from 'react-router-dom';
import { Layout } from './Components/Layout/Layout';
import { Dashboard } from './Pages/Dashboard/Dashboard';
import { EditBlog } from './Pages/EditBlog/EditBlog';
import { ThemeProvider } from '@mui/material';
import { WordMemPage } from './Pages/WordMemPage/WordMemPage';
import { SignupPage } from './Pages/SignupPage/SignupPage';
import { theme } from './theme';
import LoginPage from './Pages/Login/Login';
import NewCollection from './Pages/NewCollection/NewCollection';
import About from './Pages/About/About';

function App() {
  return (
    <div className="App">
      <ThemeProvider theme={theme}>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route path="/" element={<StartPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/collection/edit/:id" element={<NewCollection isNew={false} />} />
            <Route path="/collection/new" element={<NewCollection isNew={true} />} />
            <Route path="/edit/:id" element={<EditBlog isNew={false} />} />
            <Route path="/edit/new" element={<EditBlog isNew={true} />} />
            <Route path="/memory/" element={<WordMemPage />} />
            <Route path="/memory/:id" element={<WordMemPage />} />
            <Route path="/about/" element={<About />} />
            <Route path="/signup/" element={<SignupPage />} />
          </Route>
        </Routes>
      </ThemeProvider>
    </div>
  );
}

export default App;