import './App.css';
import '@assets/styles/resetStyles.scss';
import '@assets/styles/typography.scss';
import LoginPage from '@pages/LoginPage/LoginPage';
import RegisterPage from '@pages/RegisterPage/RegisterPage';

function App() {

  return (
    <div className="app-container">
      <RegisterPage />
      {/* <LoginPage /> */}
    </div>
  )
}

export default App
