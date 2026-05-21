import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Characters from './pages/Characters';
import Login from './pages/Login';
import CharacterDetail from './pages/CharacterDetail';
import Lightcones from './pages/Lightcones';
import LightconeDetail from './pages/LightconeDetail';
import Sidebar from './components/Sidebar';


import './App.css';

import AdminCharacterList from './pages/admin/AdminCharacterList';
import AdminCharacterDetail from './pages/admin/AdminCharacterDetail';
import AdminCharacterEdit from './pages/admin/AdminCharacterEdit';
import AdminLightconeList from './pages/admin/AdminLightconeList';
import AdminLightconeDetail from './pages/admin/AdminLightconeDetail';
import AdminLightconeEdit from './pages/admin/AdminLightconeEdit';
import AdminMetadata from './pages/admin/AdminMetadata';

function App() {
  return (
    <BrowserRouter>
      <div className="app-container">
        <Sidebar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Navigate to="/characters" replace />} />
            <Route path="/characters" element={<Characters />} />
            <Route path="/characters/:name" element={<CharacterDetail />} />
            <Route path="/lightcones" element={<Lightcones />} />
            <Route path="/lightcones/:name" element={<LightconeDetail />} />
            <Route path="/login" element={<Login />} />

            {/* Admin Routes */}
            <Route path="/admin" element={<Navigate to="/admin/characters" replace />} />
            <Route path="/admin/characters" element={<AdminCharacterList />} />
            <Route path="/admin/characters/create" element={<AdminCharacterEdit />} />
            <Route path="/admin/characters/:name" element={<AdminCharacterDetail />} />
            <Route path="/admin/characters/:name/edit" element={<AdminCharacterEdit />} />
            
            <Route path="/admin/lightcones" element={<AdminLightconeList />} />
            <Route path="/admin/lightcones/create" element={<AdminLightconeEdit />} />
            <Route path="/admin/lightcones/:name" element={<AdminLightconeDetail />} />
            <Route path="/admin/lightcones/:name/edit" element={<AdminLightconeEdit />} />

            <Route path="/admin/metadata" element={<AdminMetadata />} />

            {/* Additional routes for other sidebar items can be added here */}
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
