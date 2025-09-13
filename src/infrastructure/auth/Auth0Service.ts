import type {IAuthenticationService} from "../../domain/interfaces/IAuthenticationService.ts";
import type {User} from "../../domain/entities/User.ts";
import {useAuth0} from "@auth0/auth0-react";
import {environment} from "../../shared/config/environment";
import {logger} from "../../shared/utils/logger";

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
    loginWithRedirect: (options?: Record<string, unknown>) => Promise<void>,
    logoutFn: (options?: Record<string, unknown>) => void,
    getAccessTokenSilently: () => Promise<string>,
    handleRedirectCallback: () => Promise<Record<string, unknown>>
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
                const tokenOptions = { audience: environment.apiAudience };
                const token = await getAccessTokenSilently(tokenOptions);
                return token;
            } catch (error) {
                logger.error('Failed to get access token', error instanceof Error ? error.message : error, 'AUTH');
                
                // If it's a refresh token error, try to get token by forcing a login popup
                if (error instanceof Error && error.message.includes('Missing Refresh Token')) {
                    try {
                        const tokenOptions = { 
                            audience: environment.apiAudience,
                            ignoreCache: true 
                        };
                        
                        const token = await getAccessTokenSilently(tokenOptions);
                        return token;
                    } catch (retryError) {
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