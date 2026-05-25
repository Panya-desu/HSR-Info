import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ChevronLeft, Heart, Sword, Shield, Zap, Target, ShieldAlert, Sparkles,
  RefreshCw, Activity, Flame, Snowflake, Wind, Atom, Sun, PlusCircle, Star
} from 'lucide-react';

export default function CharacterDetail() {
  const { name } = useParams();
  const [character, setCharacter] = useState(null);
  const [paths, setPaths] = useState([]);
  const [types, setTypes] = useState([]);
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [charRes, pathsRes, typesRes, statsRes] = await Promise.all([
          fetch(`${apiUrl}/characters/${name}`),
          fetch(`${apiUrl}/metadata/paths`),
          fetch(`${apiUrl}/metadata/types`),
          fetch(`${apiUrl}/metadata/stats`)
        ]);

        const [charData, pathsData, typesData, statsData] = await Promise.all([
          charRes.json(),
          pathsRes.json(),
          typesRes.json(),
          statsRes.json()
        ]);

        setCharacter(charData);
        setPaths(pathsData);
        setTypes(typesData);
        setStats(statsData);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setLoading(false);
      }
    };

    fetchData();
  }, [name, apiUrl]);

  if (loading) return <div className="loading">Loading character...</div>;
  if (!character) return <div className="error">Character not found</div>;

  const typeIcon = types.find(t => t.name === character.type)?.icon?.url;
  const pathIcon = paths.find(p => p.name === character.path)?.icon?.url;

  const getStatIcon = (type) => {
    const statMetadata = stats.find(s => s.name === type);
    if (statMetadata?.icon?.url) {
      return <img src={statMetadata.icon.url} alt={type} className="stat-icon-img" />;
    }

    // Fallback to lucide icons if no metadata icon exists
    const iconSize = 32;
    switch (type) {
      case 'HP': return <Heart size={iconSize} className="stat-icon hp" />;
      case 'ATK': return <Sword size={iconSize} className="stat-icon atk" />;
      case 'DEF': return <Shield size={iconSize} className="stat-icon def" />;
      case 'SPD': return <Zap size={iconSize} className="stat-icon spd" />;
      case 'Crit Rate': return <Target size={iconSize} className="stat-icon crit" />;
      case 'Crit DMG': return <Target size={iconSize} className="stat-icon crit-dmg" />;
      case 'Effect Hit Rate': return <Sparkles size={iconSize} className="stat-icon ehr" />;
      case 'Effect RES': return <ShieldAlert size={iconSize} className="stat-icon res" />;
      case 'Break Effect': return <Activity size={iconSize} className="stat-icon break" />;
      case 'Energy Regeneration Rate': return <RefreshCw size={iconSize} className="stat-icon err" />;
      case 'Outgoing Healing Boost': return <PlusCircle size={iconSize} className="stat-icon heal" />;
      default: return <Sparkles size={iconSize} />;
    }
  };

  return (
    <div className="detail-page">
      <div className="detail-header">
        <Link to="/characters" className="nav-btn list-btn">
          <ChevronLeft size={20} /> Back to List
        </Link>
      </div>

      <div className="detail-container expanded">
        <div className="detail-main-info">
          <div className="detail-visual-wrapper">
            <div className="splash-container floating">
              <img
                src={character.image?.url || character.icon?.url}
                alt={character.name}
                className="splash-image"
              />
            </div>
          </div>

          <div className="detail-content-panel">
            <div className="detail-name-row">
              <h1 className="detail-name">{character.name}</h1>
              {character.version && <span className="detail-version">{character.version}</span>}
            </div>
            <div className="detail-stars">
              {[...Array(character.star || 5)].map((_, i) => (
                <Star key={i} size={20} className="star-icon" />
              ))}
            </div>

            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">Element</span>
                <div className={`metadata-badge ${character.type?.toLowerCase()}`}>
                  {typeIcon && <img src={typeIcon} alt={character.type} />}
                  <span>{character.type}</span>
                </div>
              </div>
              <div className="info-item">
                <span className="info-label">Path</span>
                <div className="metadata-badge">
                  {pathIcon && <img src={pathIcon} alt={character.path} />}
                  <span>{character.path}</span>
                </div>
              </div>
              <div className="info-item full-width">
                <span className="info-label">Voice Actor</span>
                <span className="info-value">{character.voiceActor || '-'}</span>
              </div>
            </div>

            <div className="base-stats-panel">
              <h3>Base Stats</h3>
              <div className="stats-list">
                {character.baseStats ? Object.entries(character.baseStats).map(([key, val]) => (
                  <div key={key} className="stat-row">
                    <span className="stat-name">{key.toUpperCase()}</span>
                    <span className="stat-val">{val}</span>
                  </div>
                )) : <p>No stats available</p>}
              </div>
            </div>
          </div>
        </div>

        <div className="detail-sections">
          <section className="detail-section">
            <h2 className="section-title">Character Skills</h2>
            <div className="skills-grid">
              {character.skills?.map((skill, index) => (
                <div key={index} className="skill-card-detailed">
                  <div className="skill-card-main">
                    <div className="skill-card-header">
                      <span className="skill-type-tag">{skill.type}</span>
                      <h4>{skill.name}</h4>
                    </div>
                    <p>{skill.description}</p>
                  </div>

                  {(skill.energy || skill.toughness || skill.spChange) && (
                    <>
                      <div className="skill-card-divider" />
                      <div className="skill-extra-info">
                        {skill.energy && <span className="extra-tag energy">Energy: {skill.energy}</span>}
                        {skill.toughness && <span className="extra-tag toughness">Toughness: {skill.toughness}</span>}
                        {skill.spChange && (
                          <span className={`extra-tag sp ${skill.spChange.includes('-') ? 'negative' : 'positive'}`}>
                            SP: {skill.spChange}
                          </span>
                        )}
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </section>

          <section className="detail-section">
            <h2 className="section-title">Traces</h2>
            <div className="traces-display-grid">
              {character.traces?.map((trace, index) => (
                <div key={index} className="trace-card">
                  {trace.image?.url && (
                    <div className="trace-img-box">
                      <img src={trace.image.url} alt={trace.name} />
                    </div>
                  )}
                  <div className="trace-info">
                    <h4>{trace.name}</h4>
                    <p>{trace.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {character.statBonuses && character.statBonuses.length > 0 && (
            <section className="detail-section">
              <h2 className="section-title">Total Stat Bonus</h2>
              <div className="stat-bonuses-grid">
                {character.statBonuses.map((bonus, index) => (
                  <div key={index} className="stat-bonus-card">
                    <div className="stat-bonus-icon-wrapper">
                      {getStatIcon(bonus.type)}
                    </div>
                    <div className="stat-bonus-info">
                      <span className="stat-bonus-label">{bonus.type}</span>
                      <span className="stat-bonus-value">{bonus.value}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          <section className="detail-section">
            <h2 className="section-title">Eidolons</h2>
            <div className="eidolons-display-grid">
              {character.eidolons?.map((eid, index) => (
                <div key={index} className="eidolon-card">
                  <div className="eidolon-number">{index + 1}</div>
                  {eid.image?.url && (
                    <div className="eidolon-img-box">
                      <img src={eid.image.url} alt={eid.name} />
                    </div>
                  )}
                  <div className="eidolon-info">
                    <h4>{eid.name}</h4>
                    <p>{eid.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
