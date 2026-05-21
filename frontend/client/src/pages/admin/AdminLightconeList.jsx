import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Edit2, Trash2, Eye, LogOut, Search } from 'lucide-react';
import { slugify } from '../../utils/slugify';

export default function AdminLightconeList() {
  const [lightcones, setLightcones] = useState([]);
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
    fetchLightcones();
  }, [token]);

  const fetchLightcones = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${apiUrl}/admin/lightcones`, {
        headers: { 'Authorization': `Bearer ${token}` },
        credentials: 'include'
      });
      if (res.status === 401) {
        handleLogout();
        return;
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setLightcones(data);
    } catch (err) {
      console.error('Error fetching lightcones:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (lcName) => {
    if (!window.confirm(`Are you sure you want to delete ${lcName}?`)) return;
    try {
      const res = await fetch(`${apiUrl}/admin/lightcones/${slugify(lcName)}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
        credentials: 'include'
      });
      if (res.status === 401) {
        handleLogout();
        return;
      }
      if (res.ok) fetchLightcones();
    } catch (err) {
      console.error('Error deleting lightcone:', err);
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

  const filteredLightcones = lightcones.filter(lc => 
    lc.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="admin-page">
      <div className="admin-header">
        <div className="admin-header-left">
          <h1>Lightcone Management</h1>
          <input 
            type="text" 
            placeholder="Search..." 
            className="admin-search-input" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="admin-actions">
          <Link to="/admin/lightcones/create" className="add-btn">
            <Plus size={20} /> Add New Lightcone
          </Link>
          <button onClick={handleLogout} className="logout-btn">
            <LogOut size={18} /> Logout
          </button>
        </div>
      </div>

      <div className="admin-list">
        {filteredLightcones.map(lc => (
          <div key={lc._id} className="admin-item">
            <div className="admin-item-info">
              <img src={lc.icon?.url} alt={lc.name} className="admin-item-icon" />
              <div>
                <h3>{lc.name}</h3>
                <p>{lc.path} • {lc.star}★</p>
              </div>
            </div>
            <div className="admin-item-actions">
              <Link to={`/admin/lightcones/${slugify(lc.name)}`} className="action-btn view-btn">
                <Eye size={18} />
              </Link>
              <Link to={`/admin/lightcones/${slugify(lc.name)}/edit`} className="action-btn edit-btn">
                <Edit2 size={18} />
              </Link>
              <button onClick={() => handleDelete(lc.name)} className="action-btn delete-btn">
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
