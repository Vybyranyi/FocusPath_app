import './App.css';
import '@assets/styles/resetStyles.scss';
import '@assets/styles/typography.scss';
import LoginPage from '@pages/LoginPage/LoginPage';
import RegisterPage from '@pages/RegisterPage/RegisterPage';
import { Route, Routes } from 'react-router';

function App() {

  return (
    <div className="app-container">
      <Routes>
        <Route path="/*" element={<RegisterPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    </div>
  )
}

export default App
