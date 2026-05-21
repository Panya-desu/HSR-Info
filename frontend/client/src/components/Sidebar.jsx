import { NavLink, useLocation } from 'react-router-dom';

export default function Sidebar() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  return (
    <aside className="sidebar">
      <nav className="nav-menu">
        <NavLink 
          to={isAdmin ? "/admin/characters" : "/characters"} 
          className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}
        >
          Character
        </NavLink>
        <NavLink 
          to={isAdmin ? "/admin/lightcones" : "/lightcones"} 
          className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}
        >
          Light Cone
        </NavLink>
        <NavLink 
          to={isAdmin ? "/admin/relics" : "/relics"} 
          className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}
        >
          Relics
        </NavLink>
        <NavLink 
          to={isAdmin ? "/admin/etc" : "/etc"} 
          className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}
        >
          Etc.
        </NavLink>
        {isAdmin && (
          <NavLink 
            to="/admin/metadata" 
            className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}
            style={{ marginTop: '20px', borderTop: '1px solid #f1f5f9', paddingTop: '20px' }}
          >
            Manage Attributes
          </NavLink>
        )}
      </nav>
    </aside>
  );
}
