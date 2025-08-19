import './App.css';
import '@assets/styles/resetStyles.scss';
import '@assets/styles/typography.scss';
import Button from '@components/Button/Button';
import notification from '@assets/images/icons/notification.svg';
import arrow_left from '@assets/images/icons/arrow-left.svg';
import Input from '@components/Input/Input';
import IconButton from '@components/IconButton/IconButton';
import Header from '@components/Header/Header';

function App() {

  return (
    <div className="app-container">
      {/* <h1>Hello World</h1>
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
        error="Invalid password"
      />

      <IconButton
        // emoji="smiling cat with heart-eyes"
        size='large'
        icon={arrow_left}
        onClick={() => alert('icon clicked!')}
        show_dot={true}
      /> */}

      <Header
        title="My Application"
        leftButtonIcon={<IconButton size='large' icon={arrow_left} />}
        rightButtonIcon={<IconButton size='large' emoji="smiling cat with heart-eyes" show_dot/>}
      />
    </div>
  )
}

export default App
