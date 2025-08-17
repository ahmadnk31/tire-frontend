import { Link, useLocation } from 'react-router-dom';

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/login', label: 'Login' },
  { to: '/register', label: 'Register' },
];

export default function Navbar() {
  const location = useLocation();
  return (
    <nav className="w-full bg-primary text-primary-foreground shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <span className="font-bold text-xl tracking-tight">Tyre Vision</span>
        <div className="flex gap-6">
          {navLinks.map(link => (
            <Link
              key={link.to}
              to={link.to}
              className={`font-medium text-base px-3 py-2 rounded transition-colors duration-200 hover:bg-accent hover:text-accent-foreground ${location.pathname === link.to ? 'bg-accent text-accent-foreground' : ''}`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
