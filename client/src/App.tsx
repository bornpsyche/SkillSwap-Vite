import { MantineProvider, Text } from '@mantine/core';
import { Appbar } from './components/Appbar';
import { HeroImageBackground } from './components/Hero';
import { Login } from './components/Login';
import { Signup } from './components/Signup';

export default function App() {
  return (
    <MantineProvider withGlobalStyles withNormalizeCSS>
      <Appbar></Appbar>
      <Login></Login>
      <Signup></Signup>
      <HeroImageBackground></HeroImageBackground>
      <Text>Welcome to Mantine!</Text>
    </MantineProvider>
  );
}