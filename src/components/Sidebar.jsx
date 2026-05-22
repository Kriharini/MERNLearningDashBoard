import { NavLink } from 'react-router-dom'

const NAV = [
  { to: '/',          label: 'Overview'   },
  { to: '/mongodb',   label: 'MongoDB',   color: '#00ED64' },
  { to: '/express',   label: 'Express',   color: '#8b5cf6' },
  { to: '/react',     label: 'React',     color: '#61DAFB' },
  { to: '/node',      label: 'Node.js',   color: '#68a063' },
  { to: '/notes',     label: 'Notes'      },
  { to: '/interview', label: 'Interview'  },
]

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">MERN Hub</div>
      <nav>
        {NAV.map(({ to, label, color }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
          >
            {color && <span className="nav-dot" style={{ background: color }} />}
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="sidebar-footer">
        <span>MERN Stack</span>
        <span>Learning Dashboard</span>
      </div>
    </aside>
  )
}
