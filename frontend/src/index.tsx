import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import ReactModal from 'react-modal';
import App from './App';
import 'react-toastify/dist/ReactToastify.css';

const rootDomElement = document.getElementById('root') as HTMLElement;
const root = ReactDOM.createRoot(rootDomElement);

ReactModal.setAppElement(rootDomElement);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
