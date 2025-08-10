import {Auth0Provider} from "@auth0/auth0-react";

const domain = import.meta.env.VITE_AUTH0_DOMAIN;
const clientId = import.meta.env.VITE_AUTH0_CLIENT_ID;
const audience = import.meta.env.VITE_API_AUDIENCE;

export const AppAuth0Provider = ({children}: { children: React.ReactNode }) => {
    return (
        <Auth0Provider
            domain={domain}
            clientId={clientId}
            authorizationParams={{
                redirectUri: window.location.origin,
                audience: `${audience}`,
                scope: 'openid profile email',
            }}
        >
            {children}
        </Auth0Provider>
    );
}