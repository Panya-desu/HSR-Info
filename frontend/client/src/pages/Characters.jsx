import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';
import { slugify } from '../utils/slugify';

export default function Characters() {
  const [characters, setCharacters] = useState([]);
  const [paths, setPaths] = useState([]);
  const [types, setTypes] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedPath, setSelectedPath] = useState('All');
  const [selectedType, setSelectedType] = useState('All');
  const [selectedStar, setSelectedStar] = useState('All');

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [charRes, pathsRes, typesRes] = await Promise.all([
          fetch(`${apiUrl}/characters`),
          fetch(`${apiUrl}/metadata/paths`),
          fetch(`${apiUrl}/metadata/types`)
        ]);

        const [charData, pathsData, typesData] = await Promise.all([
          charRes.json(),
          pathsRes.json(),
          typesRes.json()
        ]);

        if (Array.isArray(charData)) setCharacters(charData);
        setPaths(pathsData);
        setTypes(typesData);
      } catch (err) {
        console.log('Error fetching data:', err);
      }
    };
    fetchData();
  }, [apiUrl]);

  const filteredChars = useMemo(() => {
    return characters.filter(c => {
      const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase());
      const matchesPath = selectedPath === 'All' || c.path === selectedPath;
      const matchesType = selectedType === 'All' || c.type === selectedType;
      const matchesStar = selectedStar === 'All' || c.star === Number(selectedStar);
      return matchesSearch && matchesPath && matchesType && matchesStar;
    });
  }, [characters, search, selectedPath, selectedType, selectedStar]);

  return (
    <div className="characters-page">
      <div className="search-bar-container">
        <div className="search-row">
          <input 
            type="text" 
            className="search-input" 
            placeholder="Character name..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <div className="filter-divider" />

          <div className="filters-wrapper">
            <div className="filter-group">
              <div className="filter-label">Element</div>
              <div className="filter-options">
                <button 
                  className={`filter-btn ${selectedType === 'All' ? 'active' : ''}`}
                  onClick={() => setSelectedType('All')}
                >
                  All
                </button>
                {types.map(t => (
                  <button 
                    key={t._id}
                    className={`filter-btn ${selectedType === t.name ? 'active' : ''}`}
                    onClick={() => setSelectedType(t.name)}
                  >
                    {t.icon?.url ? <img src={t.icon.url} alt={t.name} title={t.name} /> : t.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="filter-divider" />

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
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="characters-grid">
        {filteredChars.map((char) => {
          const typeIcon = types.find(t => t.name === char.type)?.icon?.url;
          const pathIcon = paths.find(p => p.name === char.path)?.icon?.url;

          return (
            <Link key={char._id} to={`/characters/${slugify(char.name)}`} className="character-card-link">
              <div className="character-card">
                <div className="card-image-placeholder">
                  {(char.icon?.url || char.image?.url) && (
                    <img src={char.icon?.url || char.image?.url} alt={char.name} className="character-image" />
                  )}
                  
                  {/* Floating Icons */}
                  <div className="card-floating-icons">
                    {typeIcon && (
                      <div className="floating-icon-box type">
                        <img src={typeIcon} alt={char.type} />
                      </div>
                    )}
                    {pathIcon && (
                      <div className="floating-icon-box path">
                        <img src={pathIcon} alt={char.path} />
                      </div>
                    )}
                  </div>
                </div>
                <div className="card-info">
                  <div className="card-top">
                    <h3 className="character-name">{char.name}</h3>
                    <div className="stars">
                      {[...Array(char.star || 5)].map((_, i) => (
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
