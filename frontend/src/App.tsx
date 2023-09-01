import React from 'react';
import { ChakraProvider } from '@chakra-ui/react';
import { ToastContainer } from 'react-toastify';
import { theme } from 'diamond-components';
import AppInfoContextProvider from './components/AppInfoContextProvider/AppInfoContextProvider';
import LocalAppRouter from './components/LocalAppRouter/LocalAppRouter';
import './App.css';
import DiamondHeader from './components/DiamondHeader/DiamondHeader';
import DeploymentAppRouter from './components/DeploymentAppRouter/DeploymentAppRouter';

function App() {
  return (
    <>
      <ChakraProvider theme={theme}>
        <AppInfoContextProvider>
          <DiamondHeader />

          <div className="App">
            <LocalAppRouter />
            <DeploymentAppRouter />
          </div>
        </AppInfoContextProvider>
      </ChakraProvider>

      <ToastContainer />
    </>
  );
}

export default App;
