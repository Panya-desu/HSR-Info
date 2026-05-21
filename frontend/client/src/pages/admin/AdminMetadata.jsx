import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, Plus, Upload, Image } from 'lucide-react';

export default function AdminMetadata() {
  const [paths, setPaths] = useState([]);
  const [types, setTypes] = useState([]);
  const [stats, setStats] = useState([]);
  const [newPath, setNewPath] = useState('');
  const [newType, setNewType] = useState('');
  const [newStat, setNewStat] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [uploadingId, setUploadingId] = useState(null);

  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const token = localStorage.getItem('adminToken');

  const handleAuthError = () => {
    localStorage.removeItem('adminToken');
    navigate('/login');
  };

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    fetchData();
  }, [token, navigate]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [pathsRes, typesRes, statsRes] = await Promise.all([
        fetch(`${apiUrl}/metadata/paths`),
        fetch(`${apiUrl}/metadata/types`),
        fetch(`${apiUrl}/metadata/stats`)
      ]);
      const [pathsData, typesData, statsData] = await Promise.all([
        pathsRes.json(),
        typesRes.json(),
        statsRes.json()
      ]);
      setPaths(pathsData);
      setTypes(typesData);
      setStats(statsData);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching metadata:', err);
      setError('Failed to fetch data');
      setLoading(false);
    }
  };

  const handleAddPath = async (e) => {
    e.preventDefault();
    if (!newPath.trim()) return;
    try {
      const res = await fetch(`${apiUrl}/metadata/paths`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include',
        body: JSON.stringify({ name: newPath })
      });
      if (res.status === 401) {
        handleAuthError();
        return;
      }
      if (res.ok) {
        setNewPath('');
        fetchData();
      } else {
        const data = await res.json();
        alert(data.message || 'Error adding path');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddType = async (e) => {
    e.preventDefault();
    if (!newType.trim()) return;
    try {
      const res = await fetch(`${apiUrl}/metadata/types`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include',
        body: JSON.stringify({ name: newType })
      });
      if (res.status === 401) {
        handleAuthError();
        return;
      }
      if (res.ok) {
        setNewType('');
        fetchData();
      } else {
        const data = await res.json();
        alert(data.message || 'Error adding type');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeletePath = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete Path: ${name}?`)) return;
    try {
      const res = await fetch(`${apiUrl}/metadata/paths/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
        credentials: 'include'
      });
      if (res.status === 401) {
        handleAuthError();
        return;
      }
      if (res.ok) fetchData();
    } catch (err) {
      console.error(err);
    }
  };
  const handleDeleteType = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete Element Type: ${name}?`)) return;
    try {
      const res = await fetch(`${apiUrl}/metadata/types/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
        credentials: 'include'
      });
      if (res.status === 401) {
        handleAuthError();
        return;
      }
      if (res.ok) fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddStat = async (e) => {
    e.preventDefault();
    if (!newStat.trim()) return;
    try {
      const res = await fetch(`${apiUrl}/metadata/stats`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include',
        body: JSON.stringify({ name: newStat })
      });
      if (res.status === 401) {
        handleAuthError();
        return;
      }
      if (res.ok) {
        setNewStat('');
        fetchData();
      } else {
        const data = await res.json();
        alert(data.message || 'Error adding stat');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteStat = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete Stat Type: ${name}?`)) return;
    try {
      const res = await fetch(`${apiUrl}/metadata/stats/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
        credentials: 'include'
      });
      if (res.status === 401) {
        handleAuthError();
        return;
      }
      if (res.ok) fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleIconUpload = async (e, id, endpointType) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingId(id);

    const formData = new FormData();
    formData.append('icon', file);

    try {
      const res = await fetch(`${apiUrl}/metadata/${endpointType}/${id}/icon`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include',
        body: formData
      });

      if (res.status === 401) {
        handleAuthError();
        return;
      }

      if (res.ok) {
        fetchData();
      } else {
        const text = await res.text();
        console.error("Upload error:", text);
        alert("Upload failed (check backend)");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUploadingId(null);
    }
  };

  if (loading) return <div className="loading">Loading metadata...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="admin-page metadata-page">
      <div className="admin-header">
        <h1>Manage Attributes</h1>
        <p>Add or remove character Paths and Elements</p>
      </div>

      <div className="metadata-container">
        {/* Paths Section */}
        <div className="metadata-section">
          <h2>Paths</h2>
          <form onSubmit={handleAddPath} className="metadata-add-form">
            <input
              type="text"
              placeholder="Enter new Path name"
              value={newPath}
              onChange={(e) => setNewPath(e.target.value)}
              className="metadata-input"
            />
            <button type="submit" className="metadata-add-btn">
              <Plus size={18} /> Add
            </button>
          </form>

          <ul className="metadata-list">
            {paths.map(p => (
              <li key={p._id} className="metadata-item">
                <div className="metadata-item-info">
                  {p.icon?.url ? (
                    <img src={p.icon.url} alt={p.name} className="metadata-icon-preview" />
                  ) : (
                    <div className="metadata-icon-placeholder">
                      <Image size={16} />
                    </div>
                  )}
                  <span>{p.name}</span>
                </div>
                <div className="metadata-item-actions">
                  <label className="metadata-upload-btn">
                    {uploadingId === p._id ? 'Uploading...' : (p.icon?.url ? 'Edit Icon' : 'Add Icon')}
                    <input
                      type="file"
                      accept="image/*"
                      disabled={uploadingId === p._id}
                      onChange={(e) => handleIconUpload(e, p._id, 'paths')}
                      hidden
                    />
                  </label>
                  <button onClick={() => handleDeletePath(p._id, p.name)} className="metadata-delete-btn" title="Delete">
                    <Trash2 size={18} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Types Section */}
        <div className="metadata-section">
          <h2>Elements (Types)</h2>
          <form onSubmit={handleAddType} className="metadata-add-form">
            <input
              type="text"
              placeholder="Enter new Element name"
              value={newType}
              onChange={(e) => setNewType(e.target.value)}
              className="metadata-input"
            />
            <button type="submit" className="metadata-add-btn">
              <Plus size={18} /> Add
            </button>
          </form>

          <ul className="metadata-list">
            {types.map(t => (
              <li key={t._id} className="metadata-item">
                <div className="metadata-item-info">
                  {t.icon?.url ? (
                    <img src={t.icon.url} alt={t.name} className="metadata-icon-preview" />
                  ) : (
                    <div className="metadata-icon-placeholder">
                      <Image size={16} />
                    </div>
                  )}
                  <span>{t.name}</span>
                </div>
                <div className="metadata-item-actions">
                  <label className="metadata-upload-btn">
                    {uploadingId === t._id ? 'Uploading...' : (t.icon?.url ? 'Edit Icon' : 'Add Icon')}
                    <input
                      type="file"
                      accept="image/*"
                      disabled={uploadingId === t._id}
                      onChange={(e) => handleIconUpload(e, t._id, 'types')}
                      hidden
                    />
                  </label>
                  <button onClick={() => handleDeleteType(t._id, t.name)} className="metadata-delete-btn" title="Delete">
                    <Trash2 size={18} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Stats Section */}
        <div className="metadata-section">
          <h2>Stat Bonus Types</h2>
          <form onSubmit={handleAddStat} className="metadata-add-form">
            <input
              type="text"
              placeholder="Enter new Stat name"
              value={newStat}
              onChange={(e) => setNewStat(e.target.value)}
              className="metadata-input"
            />
            <button type="submit" className="metadata-add-btn">
              <Plus size={18} /> Add
            </button>
          </form>

          <ul className="metadata-list">
            {stats.map(s => (
              <li key={s._id} className="metadata-item">
                <div className="metadata-item-info">
                  {s.icon?.url ? (
                    <img src={s.icon.url} alt={s.name} className="metadata-icon-preview" />
                  ) : (
                    <div className="metadata-icon-placeholder">
                      <Image size={16} />
                    </div>
                  )}
                  <span>{s.name}</span>
                </div>
                <div className="metadata-item-actions">
                  <label className="metadata-upload-btn">
                    {uploadingId === s._id ? 'Uploading...' : (s.icon?.url ? 'Edit Icon' : 'Add Icon')}
                    <input
                      type="file"
                      accept="image/*"
                      disabled={uploadingId === s._id}
                      onChange={(e) => handleIconUpload(e, s._id, 'stats')}
                      hidden
                    />
                  </label>
                  <button onClick={() => handleDeleteStat(s._id, s.name)} className="metadata-delete-btn" title="Delete">
                    <Trash2 size={18} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
