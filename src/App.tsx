import {BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import './App.css'
import DashboardLayout from "./presentation/layouts/DashboardLayout.tsx";
import {Dashboard, MyCollection, Consoles, AddGame, Settings, GameDetail, LinkGameToIgdb, LandingPage} from "./presentation/pages";
import { AuthProvider } from './presentation/contexts/AuthContext.tsx';
import { ProfileProvider } from './application/context/ProfileContext.tsx';
import { useAuthService } from './presentation/hooks/useAuthService';

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
                        <Route index element={<Dashboard/>}/>
                        <Route path="collection" element={<MyCollection/>}/>
                        <Route path="collection/console/:consoleName" element={<MyCollection/>}/>
                        <Route path="collection/game/:gameId" element={<GameDetail/>}/>
                        <Route path="collection/console/:consoleName/game/:gameId" element={<GameDetail/>}/>
                        <Route path="collection/game/:gameId/link-igdb" element={<LinkGameToIgdb/>}/>
                        <Route path="consoles" element={<Consoles/>}/>
                        <Route path="add-game" element={<AddGame/>}/>
                        <Route path="settings" element={<Settings/>}/>
                    </Route>
                </Routes>
            </Router>
        </ProfileProvider>
    );
}

function App() {
    return (
        <AuthProvider>
            <AppContent />
        </AuthProvider>
    )
}

export default App
