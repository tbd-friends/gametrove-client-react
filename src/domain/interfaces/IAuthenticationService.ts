import type {User} from "../entities/User.ts";

export interface IAuthenticationService {
    isAuthenticated: boolean;
    isLoading: boolean;
    user: User | null;
    error: Error | undefined;

    login(redirectPath?: string): Promise<void>;
    logout(returnToPath?: string): void;
    getAccessToken(): Promise<string>;
    handleCallback(): Promise<void>;
}