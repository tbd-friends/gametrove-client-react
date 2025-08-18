import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Auth0Provider } from '@auth0/auth0-react'
import './index.css'
import App from './App.tsx'

const domain = import.meta.env.VITE_AUTH0_DOMAIN;
const clientId = import.meta.env.VITE_AUTH0_CLIENT_ID;
const audience = import.meta.env.VITE_API_AUDIENCE;

console.log('🔧 Auth0 Configuration:', { domain, clientId, audience: audience ? 'SET' : 'MISSING' });

if (!domain || !clientId) {
  throw new Error('Auth0 configuration is missing. Please check your environment variables.');
}

if (!audience) {
  console.warn('⚠️  VITE_API_AUDIENCE is not set. Access tokens may be opaque and not work with your API.');
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      authorizationParams={{
        redirect_uri: window.location.origin,
        audience: audience,
        scope: 'openid profile email offline_access'
      }}
      useRefreshTokens={true}
      cacheLocation="localstorage"
    >
      <App />
    </Auth0Provider>
  </StrictMode>,
)
