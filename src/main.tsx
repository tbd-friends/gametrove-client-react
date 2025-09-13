import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Auth0Provider } from '@auth0/auth0-react'
import './index.css'
import App from './App.tsx'
import { environment } from './shared/config/environment';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Auth0Provider
      domain={environment.auth0Domain}
      clientId={environment.auth0ClientId}
      authorizationParams={{
        redirect_uri: window.location.origin,
        audience: environment.apiAudience,
        scope: 'openid profile email offline_access'
      }}
      useRefreshTokens={true}
      cacheLocation="localstorage"
    >
      <App />
    </Auth0Provider>
  </StrictMode>,
)
