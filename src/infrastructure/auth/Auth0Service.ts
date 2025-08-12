import type {IAuthenticationService} from "../../domain/interfaces/IAuthenticationService.ts";
import type {User} from "../../domain/entities/User.ts";
import {useAuth0} from "@auth0/auth0-react";

export interface Auth0ServiceState {
    error: Error | undefined;
    isAuthenticated: boolean;
    isLoading: boolean;
    user: User | null;
}

export const createAuth0Service = (
    isAuthenticated: boolean,
    isLoading: boolean,
    user: User | null,
    error: Error | undefined,
    loginWithRedirect: (options?: any) => Promise<void>,
    logoutFn: (options?: any) => void,
    getAccessTokenSilently: () => Promise<string>,
    handleRedirectCallback: () => Promise<any>
): IAuthenticationService => {
    return {
        isAuthenticated,
        isLoading,
        user,
        error,

        async login(redirectPath?: string): Promise<void> {
            await loginWithRedirect({
                appState: {returnTo: redirectPath || window.location.pathname}
            });
        },

        logout(returnToPath?: string): void {
            logoutFn({
                logoutParams: {
                    returnTo: returnToPath || window.location.origin
                }
            });
        },

        async getAccessToken(): Promise<string> {
            try {
                const audience = import.meta.env.VITE_API_AUDIENCE;
                const tokenOptions = audience ? { audience } : {};
                
                console.log('🎯 Requesting access token with options:', tokenOptions);
                const token = await getAccessTokenSilently(tokenOptions);
                console.log('🔑 Auth0 getAccessTokenSilently result:', token ? `${token.substring(0, 20)}...` : 'EMPTY TOKEN');
                return token;
            } catch (error) {
                console.error('❌ Failed to get access token:', error);
                
                // If it's a refresh token error, try to get token by forcing a login popup
                if (error instanceof Error && error.message.includes('Missing Refresh Token')) {
                    console.log('🔄 Refresh token missing, trying with login_required...');
                    try {
                        const audience = import.meta.env.VITE_API_AUDIENCE;
                        const tokenOptions = audience ? { 
                            audience,
                            ignoreCache: true 
                        } : { ignoreCache: true };
                        
                        const token = await getAccessTokenSilently(tokenOptions);
                        console.log('🔑 Retry successful:', token ? `${token.substring(0, 20)}...` : 'EMPTY TOKEN');
                        return token;
                    } catch (retryError) {
                        console.error('❌ Retry failed:', retryError);
                        throw new Error('Authentication failed. Please log out and log in again.');
                    }
                }
                
                throw error;
            }
        },

        async handleCallback(): Promise<void> {
            await handleRedirectCallback();
        }
    };
};

export const useAuth0Service = (): IAuthenticationService => {
    const {
        isAuthenticated,
        isLoading,
        user,
        error,
        loginWithRedirect,
        logout,
        getAccessTokenSilently,
        handleRedirectCallback
    } = useAuth0();

    const domainUser: User | null = user ? {
        id: user.sub!,
        email: user.email!,
        name: user.name || user.email!,
        picture: user.picture,
        emailVerified: user.email_verified || false
    } : null;

    return createAuth0Service(
        isAuthenticated,
        isLoading,
        domainUser,
        error,
        loginWithRedirect,
        logout,
        getAccessTokenSilently,
        handleRedirectCallback
    );
};