import './App.css';
import '@assets/styles/resetStyles.scss';
import '@assets/styles/typography.scss';
import LoginPage from '@pages/LoginPage/LoginPage';
import Main from '@pages/Main/Main';
import RegisterPage from '@pages/RegisterPage/RegisterPage';
import { verifyToken } from '@store/authSlice';
import { useAppDispatch } from '@store/hooks';
import { useEffect } from 'react';
import { Route, Routes } from 'react-router';

function App() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (localStorage.getItem('token')) {
      dispatch(verifyToken());
    }
  }, []);

  return (
    <div className="app-container">
      <Routes>
        <Route path="/*" element={<RegisterPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
        {localStorage.getItem('token') && <Route path="/main/*" element={<Main />} />}
      </Routes>
    </div>
  )
}

export default App
