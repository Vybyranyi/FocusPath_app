import '@assets/styles/resetStyles.scss';
import '@assets/styles/typography.scss';
import './App.css';
import LoginPage from '@pages/LoginPage/LoginPage';
import Main from '@pages/Main/Main';
import RegisterPage from '@pages/RegisterPage/RegisterPage';
import { verifyToken } from '@store/authSlice';
import { useAppDispatch, useAppSelector } from '@store/hooks';
import { useEffect } from 'react';
import { Navigate, Route, Routes } from 'react-router';
import Layout from '@components/Layout/Layout';

function App() {
  const dispatch = useAppDispatch();
  const { user, token } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (localStorage.getItem('token')) {
      dispatch(verifyToken());
    }
  }, [dispatch]);

  return (
    <Layout>
      <Routes>
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/main/*"
          element={user && token ? <Main /> : <Navigate to="/login" replace />}
        />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Layout>

  )
}

export default App
