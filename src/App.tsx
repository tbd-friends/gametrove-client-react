import {BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import './App.css'
import DashboardLayout from "./presentation/layouts/DashboardLayout.tsx";
import {Dashboard, MyCollection, Consoles, AddGame, Settings, GameDetail} from "./presentation/pages";
import { AuthProvider } from './presentation/contexts/AuthContext.tsx';
import { ProtectedRoute } from './presentation/components/auth/ProtectedRoute';

function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    <Route path="/" element={<DashboardLayout/>}>
                        <Route index element={<Dashboard/>}/>
                        <Route path="collection" element={<ProtectedRoute><MyCollection/></ProtectedRoute>}/>
                        <Route path="collection/console/:consoleName" element={<ProtectedRoute><MyCollection/></ProtectedRoute>}/>
                        <Route path="collection/game/:gameId" element={<ProtectedRoute><GameDetail/></ProtectedRoute>}/>
                        <Route path="collection/console/:consoleName/game/:gameId" element={<ProtectedRoute><GameDetail/></ProtectedRoute>}/>
                        <Route path="consoles" element={<ProtectedRoute><Consoles/></ProtectedRoute>}/>
                        <Route path="add-game" element={<ProtectedRoute><AddGame/></ProtectedRoute>}/>
                        <Route path="settings" element={<ProtectedRoute><Settings/></ProtectedRoute>}/>
                    </Route>
                </Routes>
            </Router>
        </AuthProvider>
    )
}

export default App
