import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import logoSrc from '../../assets/logo.png';
import { useAuth } from '../../lib/AuthContext';

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const loc = useLocation();
  const { user, logOut } = useAuth();
  const home = user?.role === 'caterer' ? { to: '/dashboard', label: 'My dashboard' } : { to: '/my-inquiries', label: 'My inquiries' };
  const active = (p: string) => loc.pathname === p;
  const onAuth = ['/login', '/signup', '/partner-login', '/partner-signup'].includes(loc.pathname);
  const onPartner = loc.pathname.startsWith('/partner');
  const isSignup = loc.pathname.endsWith('signup');
  const roleStyle = (on: boolean) => (on ? { background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,.1)' } : {});

  return (
   
