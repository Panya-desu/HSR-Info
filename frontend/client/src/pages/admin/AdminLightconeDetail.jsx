import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, Edit2 } from 'lucide-react';
import { slugify } from '../../utils/slugify';

export default function AdminLightconeDetail() {
  const { name } = useParams();
  const [lightcone, setLightcone] = useState(null);
  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const token = localStorage.getItem('adminToken');

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
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
        const data = await res.json();
        setLightcone(data);
      } catch (err) {
        console.error('Error fetching lightcone:', err);
        navigate('/admin/lightcones');
      }
    };
    fetchLightcone();
  }, [name, navigate, token, apiUrl]);

  if (!lightcone) return <div className="admin-page">Loading...</div>;

  return (
    <div className="admin-page">
      <div className="admin-header admin-detail-header">
        <Link to="/admin/lightcones" className="action-btn" style={{ background: '#f1f5f9', color: '#64748b', textDecoration: 'none', width: 'fit-content' }}>
          <ChevronLeft size={20} /> Back to List
        </Link>
        <Link to={`/admin/lightcones/${slugify(lightcone.name)}/edit`} className="edit-btn-large">
          <Edit2 size={20} /> Edit Lightcone
        </Link>
      </div>

      <div className="detail-container">
        {/* Banner Section */}
        <div className="detail-banner" style={{ display: 'flex', justifyContent: 'center', background: '#000', borderRadius: '20px', overflow: 'hidden' }}>
          <img 
            src={lightcone.image?.url || '/api/placeholder/1200/400'} 
            alt={lightcone.name} 
            className="detail-splash"
            style={{ objectFit: 'contain', maxHeight: '500px', width: 'auto' }}
          />
        </div>

        {/* Content Section */}
        <div className="detail-content">
          <div className="detail-header-info">
            <div className="detail-name-row">
              <h1 className="detail-name">{lightcone.name}</h1>
              {lightcone.version && <div className="detail-version">v{lightcone.version}</div>}
            </div>
            
            <div className="detail-tags">
              <span className="tag path-tag">
                {lightcone.path}
              </span>
              <span className="tag star-tag">
                {lightcone.star}★
              </span>
            </div>
          </div>

          <div className="detail-grid">
            {/* Left Column: Stats & Basic Info */}
            <div className="detail-left">
              <div className="detail-section">
                <h3>Base Stats (Max)</h3>
                <div className="stats-grid-view">
                  <div className="stat-box-view">
                    <span className="stat-label">HP</span>
                    <span className="stat-value">{lightcone.baseStats?.hp || 0}</span>
                  </div>
                  <div className="stat-box-view">
                    <span className="stat-label">ATK</span>
                    <span className="stat-value">{lightcone.baseStats?.atk || 0}</span>
                  </div>
                  <div className="stat-box-view">
                    <span className="stat-label">DEF</span>
                    <span className="stat-value">{lightcone.baseStats?.def || 0}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Ability */}
            <div className="detail-right">
              <div className="detail-section">
                <h3>Lightcone Ability: {lightcone.abilityName || 'Unknown'}</h3>
                <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '12px', lineHeight: '1.6' }}>
                  {lightcone.description || 'No description provided.'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
