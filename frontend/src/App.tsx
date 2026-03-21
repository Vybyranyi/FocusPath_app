// Global styles are in src/index.css
import { verifyToken } from '@store/authSlice';
import { useAppDispatch, useAppSelector } from '@store/hooks';
import { useEffect, useState, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router';
import Layout from '@components/Layout/Layout';
import LoginPage from '@pages/LoginPage/LoginPage';
import RegisterPage from '@pages/RegisterPage/RegisterPage';
import Main from '@pages/Main/Main';
import CreateHabit from '@pages/CreateHabit/CreateHabit';
import AppLoading from '@components/AppLoading/AppLoading';
import ProtectedRoute from '@components/ProtectedRoute/ProtectedRoute'; 

function App() {
  const dispatch = useAppDispatch();
  const { user, token, loading } = useAppSelector((state) => state.auth);
  const [isAppReady, setIsAppReady] = useState(false);

  useEffect(() => {
    const initializeApp = async () => {
      const storedToken = localStorage.getItem('token');

      if (storedToken) {
        try {
          await dispatch(verifyToken()).unwrap();
        } catch (error) {
          console.log('Token verification failed:', error);
        }
      }

      setTimeout(() => {
        setIsAppReady(true);
      }, 100);
    };

    initializeApp();
  }, [dispatch]);

  if (!isAppReady || (loading && !user)) {
    return <AppLoading />;
  }

  return (
    <Suspense fallback={<AppLoading />}>
      <Layout>
        <Routes>
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/main/*"
            element={
              <ProtectedRoute>
                <Main />
              </ProtectedRoute>
            }
          />
          <Route
            path="/createhabit/*"
            element={
              <ProtectedRoute>
                <CreateHabit />
              </ProtectedRoute>
            }
          />
          <Route
            path="*"
            element={
              user && token ?
                <Navigate to="/main" replace /> :
                <Navigate to="/login" replace />
            }
          />
        </Routes>
      </Layout>
    </Suspense>
  );
}

export default App;