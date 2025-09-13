import {BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import './App.css'
import DashboardLayout from "./presentation/layouts/DashboardLayout.tsx";
import {Dashboard, MyCollection, Consoles, AddGame, Settings, GameDetail, LinkGameToIgdb, LandingPage} from "./presentation/pages";
import { AuthProvider } from './presentation/contexts/AuthContext.tsx';
import { ProfileProvider } from './application/context/ProfileContext.tsx';
import { useAuthService } from './presentation/hooks/useAuthService';
import { ErrorBoundary } from './shared/components/ErrorBoundary';

function AppContent() {
    const { isAuthenticated, isLoading } = useAuthService();

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-slate-950">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-cyan-500"></div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <LandingPage />;
    }

    return (
        <ProfileProvider>
            <Router>
                <Routes>
                    <Route path="/" element={<DashboardLayout/>}>
                        <Route index element={
                            <ErrorBoundary level="component">
                                <Dashboard/>
                            </ErrorBoundary>
                        }/>
                        <Route path="collection" element={
                            <ErrorBoundary level="component">
                                <MyCollection/>
                            </ErrorBoundary>
                        }/>
                        <Route path="collection/console/:consoleName" element={
                            <ErrorBoundary level="component">
                                <MyCollection/>
                            </ErrorBoundary>
                        }/>
                        <Route path="collection/game/:gameId" element={
                            <ErrorBoundary level="component">
                                <GameDetail/>
                            </ErrorBoundary>
                        }/>
                        <Route path="collection/console/:consoleName/game/:gameId" element={
                            <ErrorBoundary level="component">
                                <GameDetail/>
                            </ErrorBoundary>
                        }/>
                        <Route path="collection/game/:gameId/link-igdb" element={
                            <ErrorBoundary level="component">
                                <LinkGameToIgdb/>
                            </ErrorBoundary>
                        }/>
                        <Route path="consoles" element={
                            <ErrorBoundary level="component">
                                <Consoles/>
                            </ErrorBoundary>
                        }/>
                        <Route path="add-game" element={
                            <ErrorBoundary level="component">
                                <AddGame/>
                            </ErrorBoundary>
                        }/>
                        <Route path="settings" element={
                            <ErrorBoundary level="component">
                                <Settings/>
                            </ErrorBoundary>
                        }/>
                    </Route>
                </Routes>
            </Router>
        </ProfileProvider>
    );
}

function App() {
    return (
        <ErrorBoundary 
            level="root"
            onError={(error, errorInfo) => {
                // TODO: Send to error reporting service
                console.error('Root level error:', error, errorInfo);
            }}
        >
            <AuthProvider>
                <ErrorBoundary level="page">
                    <AppContent />
                </ErrorBoundary>
            </AuthProvider>
        </ErrorBoundary>
    )
}

export default App
