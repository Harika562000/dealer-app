import { NavigationContainer } from '@react-navigation/native';
import { registerRootComponent } from 'expo';
import App from './app/index';

const RootApp = () => (
  <NavigationContainer>
    <App />
  </NavigationContainer>
);

registerRootComponent(RootApp);