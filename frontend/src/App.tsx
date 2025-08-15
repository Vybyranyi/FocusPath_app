import './App.css';
import '@assets/styles/resetStyles.scss'
import '@assets/styles/typography.scss';
import Button from '@components/Button/Button';

import notification from '@assets/images/icons/notification.svg'
import Input from '@components/Input/Input';

function App() {

  return (
    <div style={{ backgroundColor: '#e6e6e6ff', height: '100vh' }}>
      <h1>Hello World</h1>
      <Button
        type='primary'
        size='large'
        icon={notification}
        disabled={false}
        onClick={() => alert('Button clicked!')}
      >
        Click Me
      </Button>

      <Input
        label="Password"
        placeholder="Enter your password"
        type="password"
        disabled={false}
      />
    </div>
  )
}

export default App
