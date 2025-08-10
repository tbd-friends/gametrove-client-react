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
            return await getAccessTokenSilently();
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