import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';
import { slugify } from '../utils/slugify';

export default function Lightcones() {
  const [lightcones, setLightcones] = useState([]);
  const [paths, setPaths] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedPath, setSelectedPath] = useState('All');
  const [selectedStar, setSelectedStar] = useState('All');

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [lcRes, pathsRes] = await Promise.all([
          fetch(`${apiUrl}/lightcones`),
          fetch(`${apiUrl}/metadata/paths`)
        ]);

        const [lcData, pathsData] = await Promise.all([
          lcRes.json(),
          pathsRes.json()
        ]);

        if (Array.isArray(lcData)) setLightcones(lcData);
        setPaths(pathsData);
      } catch (err) {
        console.log('Error fetching data:', err);
      }
    };
    fetchData();
  }, [apiUrl]);

  const filteredLCs = useMemo(() => {
    return lightcones.filter(lc => {
      const matchesSearch = lc.name.toLowerCase().includes(search.toLowerCase());
      const matchesPath = selectedPath === 'All' || lc.path === selectedPath;
      const matchesStar = selectedStar === 'All' || lc.star === Number(selectedStar);
      return matchesSearch && matchesPath && matchesStar;
    });
  }, [lightcones, search, selectedPath, selectedStar]);

  return (
    <div className="characters-page">
      <div className="search-bar-container">
        <div className="search-row">
          <input 
            type="text" 
            className="search-input" 
            placeholder="Lightcone name..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <div className="filter-divider" />

          <div className="filters-wrapper">
            <div className="filter-group">
              <div className="filter-label">Path</div>
              <div className="filter-options">
                <button 
                  className={`filter-btn ${selectedPath === 'All' ? 'active' : ''}`}
                  onClick={() => setSelectedPath('All')}
                >
                  All
                </button>
                {paths.map(p => (
                  <button 
                    key={p._id}
                    className={`filter-btn ${selectedPath === p.name ? 'active' : ''}`}
                    onClick={() => setSelectedPath(p.name)}
                  >
                    {p.icon?.url ? <img src={p.icon.url} alt={p.name} title={p.name} /> : p.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="filter-divider" />

            <div className="filter-group">
              <div className="filter-label">Rarity</div>
              <div className="filter-options">
                <button 
                  className={`filter-btn ${selectedStar === 'All' ? 'active' : ''}`}
                  onClick={() => setSelectedStar('All')}
                >
                  All
                </button>
                <button 
                  className={`filter-btn ${selectedStar === 5 ? 'active' : ''}`}
                  onClick={() => setSelectedStar(5)}
                >
                  5★
                </button>
                <button 
                  className={`filter-btn ${selectedStar === 4 ? 'active' : ''}`}
                  onClick={() => setSelectedStar(4)}
                >
                  4★
                </button>
                <button 
                  className={`filter-btn ${selectedStar === 3 ? 'active' : ''}`}
                  onClick={() => setSelectedStar(3)}
                >
                  3★
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="characters-grid">
        {filteredLCs.map((lc) => {
          const pathIcon = paths.find(p => p.name === lc.path)?.icon?.url;

          return (
            <Link key={lc._id} to={`/lightcones/${slugify(lc.name)}`} className="character-card-link">
              <div className="character-card">
                <div className="card-image-placeholder">
                  {(lc.icon?.url || lc.image?.url) && (
                    <img src={lc.icon?.url || lc.image?.url} alt={lc.name} className="character-image" />
                  )}
                  
                  {/* Floating Icons */}
                  <div className="card-floating-icons">
                    {pathIcon && (
                      <div className="floating-icon-box path">
                        <img src={pathIcon} alt={lc.path} />
                      </div>
                    )}
                  </div>
                </div>
                <div className="card-info">
                  <div className="card-top">
                    <h3 className="character-name">{lc.name}</h3>
                    <div className="stars">
                      {[...Array(lc.star || 5)].map((_, i) => (
                        <Star key={i} size={12} className="star-icon"  />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
