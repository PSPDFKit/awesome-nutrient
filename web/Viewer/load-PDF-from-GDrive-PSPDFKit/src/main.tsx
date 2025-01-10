import React from 'react';
import ReactDOM from 'react-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import App from './App';
import './index.css';

ReactDOM.render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <App />
    </GoogleOAuthProvider>
  </React.StrictMode>,
  document.getElementById('root')
);

// import React from 'react'
// import ReactDOM from 'react-dom/client'
// import App from './App.tsx'
// import './index.css'

// import React from 'react';
// import ReactDOM from 'react-dom/client';
// import { GoogleOAuthProvider } from '@react-oauth/google';
// import { App } from './App';

// const CLIENT_ID = '799792245867-ddbsc24g3esb4558r5006svi3cet5nsh.apps.googleusercontent.com';

// const Root: React.FC = () => (
//   <GoogleOAuthProvider clientId={CLIENT_ID}>
//     <App />
//   </GoogleOAuthProvider>
// );

// ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(<Root />);



// ReactDOM.createRoot(document.getElementById('root')!).render(
//   <React.StrictMode>
//     <App />
//   </React.StrictMode>,
// )
