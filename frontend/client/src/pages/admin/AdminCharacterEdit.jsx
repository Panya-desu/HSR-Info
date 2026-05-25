import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ChevronLeft, Save, Plus, Trash2, Upload, Image } from 'lucide-react';
import { slugify } from '../../utils/slugify';

// We will fetch STAT_TYPES from metadata now

export default function AdminCharacterEdit() {
  const { name } = useParams();
  const isEdit = !!name;
  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const token = localStorage.getItem('adminToken');

  const [formData, setFormData] = useState({
    name: '',
    version: '',
    path: '',
    type: '',
    star: 5,
    voiceActor: '',
    baseStats: { hp: 0, atk: 0, def: 0, spd: 0, maxEnergy: 0 },
    image: null,
    icon: null,
    skills: [],
    traces: Array.from({ length: 3 }, () => ({ name: '', description: '', image: null })),
    eidolons: Array.from({ length: 6 }, () => ({ name: '', description: '', image: null })),
    statBonuses: Array.from({ length: 3 }, () => ({ type: '', value: '' }))
  });

  const [previews, setPreviews] = useState({
    image: null,
    icon: null,
    traces: Array(3).fill(null),
    eidolons: Array(6).fill(null)
  });

  const [paths, setPaths] = useState([]);
  const [types, setTypes] = useState([]);
  const [stats, setStats] = useState([]);
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
      fetchCharacter();
    }
  }, [name, token]);

  const fetchMetadata = async () => {
    try {
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

      // Default selection for new characters
      if (!isEdit) {
        setFormData(prev => ({
          ...prev,
          path: prev.path || (pathsData[0]?.name || ''),
          type: prev.type || (typesData[0]?.name || '')
        }));
      }
    } catch (err) {
      console.error('Error fetching metadata:', err);
    }
  };

  const fetchCharacter = async () => {
    try {
      const res = await fetch(`${apiUrl}/admin/characters/${name}`, {
        headers: { 'Authorization': `Bearer ${token}` },
        credentials: 'include'
      });
      if (res.status === 401) {
        localStorage.removeItem('adminToken');
        navigate('/login');
        return;
      }
      const char = await res.json();
      setFormData({
        name: char.name || '',
        version: char.version || '',
        path: char.path || '',
        type: char.type || '',
        star: char.star || 5,
        voiceActor: char.voiceActor || '',
        baseStats: char.baseStats || { hp: 0, atk: 0, def: 0, spd: 0, maxEnergy: 0 },
        image: char.image || null,
        icon: char.icon || null,
        skills: char.skills || [],
        traces: (char.traces && char.traces.length === 3) 
          ? char.traces.map(t => ({...t})) 
          : Array.from({ length: 3 }, () => ({ name: '', description: '', image: null })),
        eidolons: (char.eidolons && char.eidolons.length === 6) 
          ? char.eidolons.map(e => ({...e})) 
          : Array.from({ length: 6 }, () => ({ name: '', description: '', image: null })),
        statBonuses: (char.statBonuses && char.statBonuses.length > 0)
          ? char.statBonuses.map(s => ({...s}))
          : Array.from({ length: 3 }, () => ({ type: '', value: '' }))
      });
      setPreviews({
        image: char.image?.url || null,
        icon: char.icon?.url || null,
        traces: char.traces ? char.traces.map(t => t.image?.url || null) : Array(3).fill(null),
        eidolons: char.eidolons ? char.eidolons.map(e => e.image?.url || null) : Array(6).fill(null)
      });
    } catch (err) {
      console.error('Error fetching character:', err);
    }
  };

  const handleFileChange = (e, field, index = null, type = null) => {
    const file = e.target.files[0];
    if (!file) return;

    const previewUrl = createBlobUrl(file);

    if (type === 'traces') {
      const oldUrl = previews.traces[index];
      revokeBlobUrl(oldUrl);

      const newTraces = [...formData.traces];
      newTraces[index] = { ...newTraces[index], image: file };
      setFormData({ ...formData, traces: newTraces });
      
      const newTracePreviews = [...previews.traces];
      newTracePreviews[index] = previewUrl;
      setPreviews({ ...previews, traces: newTracePreviews });
    } else if (type === 'eidolons') {
      const oldUrl = previews.eidolons[index];
      revokeBlobUrl(oldUrl);

      const newEidolons = [...formData.eidolons];
      newEidolons[index] = { ...newEidolons[index], image: file };
      setFormData({ ...formData, eidolons: newEidolons });

      const newEidolonPreviews = [...previews.eidolons];
      newEidolonPreviews[index] = previewUrl;
      setPreviews({ ...previews, eidolons: newEidolonPreviews });
    } else {
      const oldUrl = previews[field];
      revokeBlobUrl(oldUrl);

      setFormData({ ...formData, [field]: file });
      setPreviews({ ...previews, [field]: previewUrl });
    }
  };

  const handleTraceEidolonChange = (type, index, field, value) => {
    const newData = [...formData[type]];
    newData[index] = { ...newData[index], [field]: value };
    setFormData({ ...formData, [type]: newData });
  };

  const handleAddSkill = () => {
    setFormData({
      ...formData,
      skills: [...formData.skills, { name: '', type: '', description: '', energy: '', toughness: '', spChange: '' }]
    });
  };

  const handleStatBonusChange = (index, field, value) => {
    const newBonuses = [...formData.statBonuses];
    newBonuses[index] = { ...newBonuses[index], [field]: value };
    setFormData({ ...formData, statBonuses: newBonuses });
  };

  const handleRemoveSkill = (index) => {
    const newSkills = formData.skills.filter((_, i) => i !== index);
    setFormData({ ...formData, skills: newSkills });
  };

  const handleSkillChange = (index, field, value) => {
    const newSkills = [...formData.skills];
    newSkills[index] = { ...newSkills[index], [field]: value };
    setFormData({ ...formData, skills: newSkills });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const submitData = new FormData();
    submitData.append('name', formData.name);
    if (formData.version) submitData.append('version', formData.version);
    submitData.append('path', formData.path);
    submitData.append('type', formData.type);
    submitData.append('star', formData.star);
    submitData.append('voiceActor', formData.voiceActor);
    submitData.append('baseStats', JSON.stringify(formData.baseStats));
    submitData.append('skills', JSON.stringify(formData.skills));
    submitData.append('statBonuses', JSON.stringify(formData.statBonuses));

    // Fix Bug: Handle Traces/Eidolons images correctly
    const tracesToSend = formData.traces.map((t, i) => {
      if (t.image instanceof File) {
        submitData.append(`trace_${i}_image`, t.image);
        return { name: t.name, description: t.description, image: null };
      }
      return { name: t.name, description: t.description, image: t.image };
    });
    submitData.append('traces', JSON.stringify(tracesToSend));

    const eidolonsToSend = formData.eidolons.map((eid, i) => {
      if (eid.image instanceof File) {
        submitData.append(`eidolon_${i}_image`, eid.image);
        return { name: eid.name, description: eid.description, image: null };
      }
      return { name: eid.name, description: eid.description, image: eid.image };
    });
    submitData.append('eidolons', JSON.stringify(eidolonsToSend));

    if (formData.image instanceof File) submitData.append('image', formData.image);
    if (formData.icon instanceof File) submitData.append('icon', formData.icon);

    const url = isEdit 
      ? `${apiUrl}/admin/characters/${name}` 
      : `${apiUrl}/admin/characters`;
    const method = isEdit ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Authorization': `Bearer ${token}` },
        credentials: 'include',
        body: submitData
      });

      if (res.status === 401) {
        localStorage.removeItem('adminToken');
        navigate('/login');
        return;
      }

      if (res.ok) {
        navigate(isEdit ? `/admin/characters/${slugify(formData.name)}` : '/admin/characters');
      } else {
        const errorData = await res.json();
        alert(errorData.message || 'Operation failed');
      }
    } catch (err) {
      console.error('Error saving character:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="admin-edit-page">
      {saving && (
        <div className="loading-overlay">
          <div className="spinner"></div>
          <div className="loading-text">Uploading & Saving...</div>
          <div className="loading-subtext">Please wait, this might take a moment if you uploaded large images.</div>
        </div>
      )}
      <div className="admin-edit-header">
        <div className="header-navigation">
          <Link to="/admin/characters" className="nav-btn list-btn">
            <ChevronLeft size={18} /> Back to List
          </Link>
          {isEdit && (
            <Link to={`/admin/characters/${name}`} className="nav-btn detail-btn">
              View Character Detail
            </Link>
          )}
        </div>
        <div className="header-title">
          <h1>{isEdit ? `Edit : ${formData.name || name}` : 'Add New Character'}</h1>
          <div className="title-underline"></div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="admin-form">
        <div className="form-sections-container">
          {/* Basic Info */}
          <section className="form-section">
            <h3>Basic Information</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>Name</label>
                <input 
                  type="text" 
                  value={formData.name} 
                  onChange={(e) => setFormData({...formData, name: e.target.value})} 
                  required 
                />
              </div>
              <div className="form-group">
                <label>Version Release</label>
                <input 
                  type="text" 
                  value={formData.version} 
                  onChange={(e) => setFormData({...formData, version: e.target.value})} 
                  placeholder="e.g. 1.0, 2.3"
                />
              </div>
              <div className="form-group">
                <label>Path</label>
                <div className="select-with-icon">
                  {formData.path && paths.find(p => p.name === formData.path)?.icon?.url && (
                    <img src={paths.find(p => p.name === formData.path).icon.url} alt="path icon" className="input-icon-preview" />
                  )}
                  <select 
                    value={formData.path} 
                    onChange={(e) => setFormData({...formData, path: e.target.value})} 
                    required
                    className="form-select"
                  >
                    <option value="" disabled>Select Path</option>
                    {paths.map(p => (
                      <option key={p._id} value={p.name}>{p.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Type (Element)</label>
                <div className="select-with-icon">
                  {formData.type && types.find(t => t.name === formData.type)?.icon?.url && (
                    <img src={types.find(t => t.name === formData.type).icon.url} alt="type icon" className="input-icon-preview" />
                  )}
                  <select 
                    value={formData.type} 
                    onChange={(e) => setFormData({...formData, type: e.target.value})} 
                    required
                    className="form-select"
                  >
                    <option value="" disabled>Select Element</option>
                    {types.map(t => (
                      <option key={t._id} value={t.name}>{t.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Stars</label>
                <input 
                  type="number" 
                  min="1" max="5"
                  value={formData.star} 
                  onChange={(e) => setFormData({...formData, star: parseInt(e.target.value)})} 
                  required 
                />
              </div>
              <div className="form-group">
                <label>Voice Actor</label>
                <input 
                  type="text" 
                  value={formData.voiceActor} 
                  onChange={(e) => setFormData({...formData, voiceActor: e.target.value})} 
                />
              </div>
            </div>
          </section>

          {/* Stats */}
          <section className="form-section">
            <h3>Base Stats</h3>
            <div className="stats-grid">
              {Object.keys(formData.baseStats).map(stat => (
                <div className="form-group" key={stat}>
                  <label>{stat.toUpperCase()}</label>
                  <input 
                    type="number" 
                    value={formData.baseStats[stat]} 
                    onChange={(e) => setFormData({
                      ...formData, 
                      baseStats: { ...formData.baseStats, [stat]: parseFloat(e.target.value) }
                    })} 
                  />
                </div>
              ))}
            </div>
          </section>

          {/* Media */}
          <section className="form-section">
            <h3>Media</h3>
            <div className="media-grid">
              {/* Icon Upload */}
              <div className="media-upload-card">
                <label className="media-label">Icon</label>
                <div className="media-preview-box icon-box">
                  {previews.icon ? (
                    <img src={previews.icon} alt="icon preview" />
                  ) : (
                    <div className="media-placeholder">
                      <Image size={24} />
                      <span>No icon</span>
                    </div>
                  )}
                </div>
                <label className="upload-btn">
                  <Upload size={14} /> Choose File
                  <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'icon')} hidden />
                </label>
              </div>

              {/* Splash Image Upload */}
              <div className="media-upload-card splash-card">
                <label className="media-label">Splash Image</label>
                <div className="media-preview-box splash-box">
                  {previews.image ? (
                    <img src={previews.image} alt="splash preview" />
                  ) : (
                    <div className="media-placeholder">
                      <Image size={32} />
                      <span>No splash image</span>
                    </div>
                  )}
                </div>
                <label className="upload-btn">
                  <Upload size={14} /> Choose File
                  <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'image')} hidden />
                </label>
              </div>
            </div>
          </section>

          {/* Skills */}
          <section className="form-section">
            <div className="section-header">
              <h3>Skills</h3>
              <button type="button" onClick={handleAddSkill} className="add-skill-btn">
                <Plus size={16} /> Add Skill
              </button>
            </div>
            {formData.skills.length === 0 && (
              <div className="empty-state">
                <p>No skills added yet. Click "Add Skill" to get started.</p>
              </div>
            )}
            <div className="skills-edit-list">
              {formData.skills.map((skill, i) => (
                <div key={i} className="skill-edit-card">
                  <div className="skill-edit-header">
                    <span className="skill-number">Skill {i + 1}</span>
                    <button type="button" onClick={() => handleRemoveSkill(i)} className="remove-skill-btn" title="Remove skill">
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <div className="skill-edit-fields">
                    <div className="skill-row">
                      <input 
                        placeholder="Skill Name"
                        value={skill.name}
                        onChange={(e) => handleSkillChange(i, 'name', e.target.value)}
                      />
                      <input 
                        placeholder="Skill Type (e.g. Basic ATK)"
                        value={skill.type}
                        onChange={(e) => handleSkillChange(i, 'type', e.target.value)}
                      />
                    </div>
                    <div className="skill-row three-cols">
                      <input 
                        placeholder="Energy Regen (e.g. 20)"
                        value={skill.energy || ''}
                        onChange={(e) => handleSkillChange(i, 'energy', e.target.value)}
                      />
                      <input 
                        placeholder="Toughness (e.g. Single: 10)"
                        value={skill.toughness || ''}
                        onChange={(e) => handleSkillChange(i, 'toughness', e.target.value)}
                      />
                      <input 
                        placeholder="SP Change (e.g. +1)"
                        value={skill.spChange || ''}
                        onChange={(e) => handleSkillChange(i, 'spChange', e.target.value)}
                      />
                    </div>
                    <textarea 
                      placeholder="Description"
                      value={skill.description}
                      onChange={(e) => handleSkillChange(i, 'description', e.target.value)}
                      rows={3}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Traces */}
          <section className="form-section">
            <h3>Traces</h3>
            <div className="traces-grid-edit">
              {formData.traces.map((trace, i) => (
                <div key={i} className="trace-eidolon-edit-card">
                  <h4>Trace {i + 1}</h4>
                  <div className="te-preview-box">
                    {previews.traces[i] ? (
                      <img src={previews.traces[i]} alt={`trace ${i + 1}`} />
                    ) : (
                      <div className="media-placeholder small">
                        <Image size={20} />
                      </div>
                    )}
                  </div>
                  <label className="upload-btn small">
                    <Upload size={12} /> Upload
                    <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, null, i, 'traces')} hidden />
                  </label>
                  <input 
                    placeholder="Trace Name"
                    value={trace.name}
                    onChange={(e) => handleTraceEidolonChange('traces', i, 'name', e.target.value)}
                  />
                  <textarea 
                    placeholder="Description"
                    value={trace.description}
                    onChange={(e) => handleTraceEidolonChange('traces', i, 'description', e.target.value)}
                    rows={3}
                  />
                </div>
              ))}
            </div>
          </section>

          {/* Stat Bonuses */}
          <section className="form-section">
            <div className="section-header">
              <h3>Total Stat Bonus</h3>
            </div>
            <div className="stats-grid bonus-grid">
              {formData.statBonuses.slice(0, 3).map((bonus, i) => {
                const selectedStat = stats.find(s => s.name === bonus.type);
                return (
                  <div key={i} className="stat-bonus-edit-item">
                    <div className="stat-bonus-header-row">
                      <div className="mini-icon-display">
                        {selectedStat?.icon?.url ? (
                          <img src={selectedStat.icon.url} alt="stat icon" />
                        ) : (
                          <div className="icon-placeholder"><Image size={14} /></div>
                        )}
                      </div>
                      <select 
                        value={bonus.type}
                        onChange={(e) => handleStatBonusChange(i, 'type', e.target.value)}
                        className="form-select mini"
                      >
                        <option value="">Select Stat</option>
                        {stats.map(s => (
                          <option key={s._id} value={s.name}>{s.name}</option>
                        ))}
                      </select>
                    </div>
                    <input 
                      placeholder="Value (e.g. 18%)"
                      value={bonus.value}
                      onChange={(e) => handleStatBonusChange(i, 'value', e.target.value)}
                      className="bonus-value-input"
                    />
                  </div>
                );
              })}
            </div>
          </section>

          {/* Eidolons */}
          <section className="form-section">
            <h3>Eidolons</h3>
            <div className="eidolons-grid-edit">
              {formData.eidolons.map((eid, i) => (
                <div key={i} className="trace-eidolon-edit-card">
                  <h4>Eidolon {i + 1}</h4>
                  <div className="te-preview-box">
                    {previews.eidolons[i] ? (
                      <img src={previews.eidolons[i]} alt={`eidolon ${i + 1}`} />
                    ) : (
                      <div className="media-placeholder small">
                        <Image size={20} />
                      </div>
                    )}
                  </div>
                  <label className="upload-btn small">
                    <Upload size={12} /> Upload
                    <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, null, i, 'eidolons')} hidden />
                  </label>
                  <input 
                    placeholder="Eidolon Name"
                    value={eid.name}
                    onChange={(e) => handleTraceEidolonChange('eidolons', i, 'name', e.target.value)}
                  />
                  <textarea 
                    placeholder="Description"
                    value={eid.description}
                    onChange={(e) => handleTraceEidolonChange('eidolons', i, 'description', e.target.value)}
                    rows={3}
                  />
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="form-footer">
          <button type="submit" className="save-btn-large" disabled={saving}>
            <Save size={20} /> {saving ? 'Saving...' : (isEdit ? 'Save Changes' : 'Create Character')}
          </button>
        </div>
      </form>
    </div>
  );
}
