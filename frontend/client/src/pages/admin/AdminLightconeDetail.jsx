import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, Edit2, Star, Heart, Sword, Shield } from 'lucide-react';
import { slugify } from '../../utils/slugify';
import '../../styles/LightconeDetail.css';

export default function AdminLightconeDetail() {
  const { name } = useParams();
  const [lightcone, setLightcone] = useState(null);
  const [paths, setPaths] = useState([]);
  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const token = localStorage.getItem('adminToken');

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      try {
        const [lcRes, pathsRes] = await Promise.all([
          fetch(`${apiUrl}/admin/lightcones/${name}`, {
            headers: { 'Authorization': `Bearer ${token}` },
            credentials: 'include'
          }),
          fetch(`${apiUrl}/metadata/paths`)
        ]);

        if (lcRes.status === 401) {
          localStorage.removeItem('adminToken');
          navigate('/login');
          return;
        }
        if (!lcRes.ok) throw new Error("Lightcone not found");

        const [lcData, pathsData] = await Promise.all([
          lcRes.json(),
          pathsRes.json()
        ]);

        setLightcone(lcData);
        setPaths(pathsData);
      } catch (err) {
        console.error('Error fetching data:', err);
        navigate('/admin/lightcones');
      }
    };

    fetchData();
  }, [name, navigate, token, apiUrl]);

  if (!lightcone) return <div className="loading">Loading lightcone...</div>;

  const pathIcon = paths.find(p => p.name === lightcone.path)?.icon?.url;

  return (
    <div className="detail-page lightcone-detail-page">
      <div className="admin-detail-header">
        <Link to="/admin/lightcones" className="nav-btn list-btn">
          <ChevronLeft size={20} /> Back to List
        </Link>
        <div className="admin-header-actions">
          <Link to={`/admin/lightcones/${slugify(lightcone.name)}/edit`} className="edit-btn-large">
            <Edit2 size={20} /> Edit Lightcone
          </Link>
        </div>
      </div>

      <div className="detail-container expanded">
        <div className="detail-main-info">
          <div className="detail-visual-wrapper">
            <div className="splash-container floating">
              <img
                src={lightcone.image?.url || lightcone.icon?.url}
                alt={lightcone.name}
                className="splash-image"
              />
            </div>
          </div>

          <div className="detail-content-panel">
            <div className="detail-name-row">
              <h1 className="detail-name">{lightcone.name}</h1>
              {lightcone.version && <span className="detail-version">v{lightcone.version}</span>}
            </div>

            <div className="detail-stars">
              {[...Array(lightcone.star || 5)].map((_, i) => (
                <Star key={i} size={20} className="star-icon" />
              ))}
            </div>

            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">Path</span>
                <div className="metadata-badge">
                  {pathIcon && <img src={pathIcon} alt={lightcone.path} />}
                  <span>{lightcone.path}</span>
                </div>
              </div>
            </div>

            <div className="base-stats-panel">
              <h3>Base Stats</h3>
              <div className="stats-list">
                <div className="stat-row">
                  <div className="stat-label-group">
                    <Heart size={16} className="stat-icon hp" />
                    <span className="stat-name">HP</span>
                  </div>
                  <span className="stat-val">{lightcone.baseStats?.hp || 0}</span>
                </div>
                <div className="stat-row">
                  <div className="stat-label-group">
                    <Sword size={16} className="stat-icon atk" />
                    <span className="stat-name">ATK</span>
                  </div>
                  <span className="stat-val">{lightcone.baseStats?.atk || 0}</span>
                </div>
                <div className="stat-row">
                  <div className="stat-label-group">
                    <Shield size={16} className="stat-icon def" />
                    <span className="stat-name">DEF</span>
                  </div>
                  <span className="stat-val">{lightcone.baseStats?.def || 0}</span>
                </div>
              </div>
            </div>

            <div className="detail-ability-section">
              <div className="ability-info">
                <h3 className="ability-title">{lightcone.abilityName || 'Superimposition'}</h3>
                <p className="ability-desc">{lightcone.description}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
