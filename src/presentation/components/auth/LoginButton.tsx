import React from "react";
import {useAuth} from "../../../application/context/AuthContext";

interface LoginButtonProps {
    className?: string;
    redirectPath?: string;
    children?: React.ReactNode;
}

export const LoginButton: React.FC<LoginButtonProps> = ({
                                                            className = "btn btn-primary",
                                                            redirectPath,
                                                            children = "Log In"
                                                        }) => {
    const { login, isLoading } = useAuth();

    const handleLogin = () => {
        login(redirectPath);
    };

    return (
        <button
            onClick={handleLogin}
            disabled={isLoading}
            className={className}
        >
            {isLoading ? 'Loading...' : children}
        </button>
    );
};