import {BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import './App.css'
import DashboardLayout from "./presentation/layouts/DashboardLayout.tsx";
import {Dashboard, MyCollection, Consoles, AddGame, Settings, GameDetail} from "./presentation/pages";
import { AuthProvider } from './presentation/contexts/AuthContext';

function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    <Route path="/" element={<DashboardLayout/>}>
                        <Route index element={<Dashboard/>}/>
                        <Route path="collection" element={<MyCollection/>}/>
                        <Route path="collection/console/:consoleName" element={<MyCollection/>}/>
                        <Route path="collection/game/:gameId" element={<GameDetail/>}/>
                        <Route path="collection/console/:consoleName/game/:gameId" element={<GameDetail/>}/>
                        <Route path="consoles" element={<Consoles/>}/>
                        <Route path="add-game" element={<AddGame/>}/>
                        <Route path="settings" element={<Settings/>}/>
                    </Route>
                </Routes>
            </Router>
        </AuthProvider>
    )
}

export default App
