import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Edit2, Trash2, Eye, LogOut } from 'lucide-react';
import { slugify } from '../../utils/slugify';

export default function AdminCharacterList() {
  const [characters, setCharacters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const token = localStorage.getItem('adminToken');

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    fetchCharacters();
  }, [token]);

  const fetchCharacters = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${apiUrl}/admin/characters`, {
        headers: { 'Authorization': `Bearer ${token}` },
        credentials: 'include'
      });
      if (res.status === 401) {
        handleLogout();
        return;
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setCharacters(data);
    } catch (err) {
      console.error('Error fetching characters:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (charName) => {
    if (!window.confirm(`Are you sure you want to delete ${charName}?`)) return;
    try {
      const res = await fetch(`${apiUrl}/admin/characters/${slugify(charName)}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
        credentials: 'include'
      });
      if (res.status === 401) {
        handleLogout();
        return;
      }
      if (res.ok) fetchCharacters();
    } catch (err) {
      console.error('Error deleting character:', err);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch(`${apiUrl}/auth/logout`, { method: 'POST', credentials: 'include' });
    } catch (err) {
      console.error('Logout error:', err);
    }
    localStorage.removeItem('adminToken');
    navigate('/login');
  };

  const filteredCharacters = characters.filter(char => 
    char.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="admin-page">
      <div className="admin-header">
        <div className="admin-header-left">
          <h1>Character Management</h1>
          <input 
            type="text" 
            placeholder="Search..." 
            className="admin-search-input" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="admin-actions">
          <Link to="/admin/characters/create" className="add-btn">
            <Plus size={20} /> Add New Character
          </Link>
          <button onClick={handleLogout} className="logout-btn">
            <LogOut size={18} /> Logout
          </button>
        </div>
      </div>

      <div className="admin-list">
        {filteredCharacters.map(char => (
          <div key={char._id} className="admin-item">
            <div className="admin-item-info">
              <img src={char.icon?.url} alt={char.name} className="admin-item-icon" />
              <div>
                <h3>{char.name}</h3>
                <p>{char.path} • {char.type} • {char.star}★</p>
              </div>
            </div>
            <div className="admin-item-actions">
              <Link to={`/admin/characters/${slugify(char.name)}`} className="action-btn view-btn">
                <Eye size={18} />
              </Link>
              <Link to={`/admin/characters/${slugify(char.name)}/edit`} className="action-btn edit-btn">
                <Edit2 size={18} />
              </Link>
              <button onClick={() => handleDelete(char.name)} className="action-btn delete-btn">
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
