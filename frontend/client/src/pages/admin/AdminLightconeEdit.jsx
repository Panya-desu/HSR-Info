import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ChevronLeft, Save, Upload, Image, Eye } from 'lucide-react';
import { slugify } from '../../utils/slugify';

export default function AdminLightconeEdit() {
  const { name } = useParams();
  const isEdit = !!name;
  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const token = localStorage.getItem('adminToken');

  const [formData, setFormData] = useState({
    name: '',
    version: '',
    path: '',
    star: 5,
    baseStats: { hp: 0, atk: 0, def: 0 },
    abilityName: '',
    description: '',
    image: null,
    icon: null
  });

  const [previews, setPreviews] = useState({
    image: null,
    icon: null
  });

  const [paths, setPaths] = useState([]);
  const [saving, setSaving] = useState(false);

  const blobUrlsRef = useRef(new Set());

  const createBlobUrl = (file) => {
    const url = URL.createObjectURL(file);
    blobUrlsRef.current.add(url);
    return url;
  };

  const revokeBlobUrl = (url) => {
    if (url && typeof url === 'string' && url.startsWith('blob:')) {
      URL.revokeObjectURL(url);
      blobUrlsRef.current.delete(url);
    }
  };

  useEffect(() => {
    return () => {
      blobUrlsRef.current.forEach(url => {
        URL.revokeObjectURL(url);
      });
      blobUrlsRef.current.clear();
    };
  }, []);

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    fetchMetadata();
    if (isEdit) {
      fetchLightcone();
    }
  }, [name, token]);

  const fetchMetadata = async () => {
    try {
      const res = await fetch(`${apiUrl}/metadata/paths`);
      const pathsData = await res.json();
      setPaths(pathsData);

      if (!isEdit && pathsData.length > 0) {
        setFormData(prev => ({ ...prev, path: pathsData[0].name }));
      }
    } catch (err) {
      console.error('Error fetching paths:', err);
    }
  };

  const fetchLightcone = async () => {
    try {
      const res = await fetch(`${apiUrl}/admin/lightcones/${name}`, {
        headers: { 'Authorization': `Bearer ${token}` },
        credentials: 'include'
      });
      if (res.status === 401) {
        localStorage.removeItem('adminToken');
        navigate('/login');
        return;
      }
      if (!res.ok) throw new Error("Lightcone not found");
      const lc = await res.json();

      setFormData({
        name: lc.name || '',
        version: lc.version || '',
        path: lc.path || '',
        star: lc.star || 5,
        baseStats: lc.baseStats || { hp: 0, atk: 0, def: 0 },
        abilityName: lc.abilityName || '',
        description: lc.description || '',
        image: lc.image || null,
        icon: lc.icon || null
      });

      setPreviews({
        image: lc.image?.url || null,
        icon: lc.icon?.url || null
      });
    } catch (err) {
      console.error('Error fetching lightcone:', err);
      navigate('/admin/lightcones');
    }
  };

  const handleImageChange = (e, field) => {
    const file = e.target.files[0];
    if (file) {
      const oldUrl = previews[field];
      revokeBlobUrl(oldUrl);

      const previewUrl = createBlobUrl(file);
      setFormData(prev => ({ ...prev, [field]: file }));
      setPreviews(prev => ({ ...prev, [field]: previewUrl }));
    }
  };

  const handleStatChange = (stat, value) => {
    setFormData(prev => ({
      ...prev,
      baseStats: { ...prev.baseStats, [stat]: Number(value) }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const data = new FormData();

      const textFields = ['name', 'version', 'path', 'star', 'abilityName', 'description'];
      textFields.forEach(field => {
        data.append(field, formData[field]);
      });

      data.append('baseStats', JSON.stringify(formData.baseStats));

      if (formData.image instanceof File) data.append('image', formData.image);
      if (formData.icon instanceof File) data.append('icon', formData.icon);

      const url = isEdit ? `${apiUrl}/admin/lightcones/${slugify(formData.name)}` : `${apiUrl}/admin/lightcones`;
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Authorization': `Bearer ${token}` },
        credentials: 'include',
        body: data
      });

      if (res.status === 401) {
        localStorage.removeItem('adminToken');
        navigate('/login');
        return;
      }

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      navigate('/admin/lightcones');
    } catch (err) {
      console.error('Save error:', err);
      alert('Error saving lightcone');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="admin-edit-page">
      <div className="admin-header">
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <Link to="/admin/lightcones" className="action-btn" style={{ background: '#f1f5f9', color: '#64748b', textDecoration: 'none', width: 'fit-content' }}>
            <ChevronLeft size={20} /> Back to List
          </Link>
          {isEdit && (
            <Link to={`/admin/lightcones/${name}`} className="action-btn" style={{ background: '#e0f2fe', color: '#0284c7', textDecoration: 'none', width: 'fit-content' }}>
              View Lightcone
            </Link>
          )}
        </div>
        <h1>{isEdit ? 'Edit Lightcone' : 'Add New Lightcone'}</h1>
        <button onClick={handleSubmit} disabled={saving} className="add-btn">
          <Save size={20} /> {saving ? 'Saving...' : 'Save Lightcone'}
        </button>
      </div>

      <form className="admin-form" onSubmit={handleSubmit}>
        <div className="form-sections-container">

          {/* Basic Info */}
          <div className="form-section">
            <h3>Basic Information</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Version Release</label>
                <input
                  type="text"
                  value={formData.version}
                  onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                  placeholder="e.g. 1.0, 4.2"
                />
              </div>
              <div className="form-group">
                <label>Path</label>
                <select
                  className="form-select"
                  value={formData.path}
                  onChange={(e) => setFormData({ ...formData, path: e.target.value })}
                >
                  {paths.map(p => <option key={p._id} value={p.name}>{p.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Rarity (Star)</label>
                <select
                  className="form-select"
                  value={formData.star}
                  onChange={(e) => setFormData({ ...formData, star: Number(e.target.value) })}
                >
                  <option value={5}>5★</option>
                  <option value={4}>4★</option>
                  <option value={3}>3★</option>
                </select>
              </div>
            </div>
          </div>

          {/* Base Stats */}
          <div className="form-section">
            <h3>Base Stats (Max Level)</h3>
            <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
              {['hp', 'atk', 'def'].map(stat => (
                <div key={stat} className="form-group">
                  <label>{stat.toUpperCase()}</label>
                  <input
                    type="number"
                    value={formData.baseStats[stat]}
                    onChange={(e) => handleStatChange(stat, e.target.value)}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Ability */}
          <div className="form-section">
            <h3>Lightcone Ability</h3>
            <div className="form-group" style={{ marginBottom: '15px' }}>
              <label>Ability Name</label>
              <input
                type="text"
                value={formData.abilityName}
                onChange={(e) => setFormData({ ...formData, abilityName: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Ability Description</label>
              <textarea
                rows="4"
                style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', border: '1px solid #e2e8f0' }}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
          </div>

          {/* Media */}
          <div className="form-section">
            <h3>Media Upload</h3>
            <div className="media-grid">

              <div className="media-upload-card icon-card">
                <div className="media-label">Icon</div>
                <div className="media-preview-box icon-box">
                  {previews.icon ? (
                    <img src={previews.icon} alt="Icon preview" />
                  ) : (
                    <div className="media-placeholder">
                      <Image size={32} />
                      <span>No icon uploaded</span>
                    </div>
                  )}
                </div>
                <label className="upload-btn">
                  <Upload size={16} /> Choose Image
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageChange(e, 'icon')}
                    style={{ display: 'none' }}
                  />
                </label>
              </div>

              <div className="media-upload-card splash-card">
                <div className="media-label">Full Artwork</div>
                <div className="media-preview-box splash-box">
                  {previews.image ? (
                    <img src={previews.image} alt="Full preview" />
                  ) : (
                    <div className="media-placeholder">
                      <Image size={48} />
                      <span>No artwork uploaded</span>
                    </div>
                  )}
                </div>
                <label className="upload-btn">
                  <Upload size={16} /> Choose Image
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageChange(e, 'image')}
                    style={{ display: 'none' }}
                  />
                </label>
              </div>

            </div>
          </div>

        </div>

        <button type="submit" disabled={saving} className="save-btn-large">
          <Save size={24} />
          {saving ? 'Saving...' : 'Save Lightcone'}
        </button>
      </form>
    </div>
  );
}
