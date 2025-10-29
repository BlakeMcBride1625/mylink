import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home, 
  FolderGit2, 
  Wrench, 
  Briefcase, 
  Code2, 
  Mail, 
  MessageSquare,
  Shield,
  Menu, 
  X 
} from 'lucide-react';
import axios from 'axios';

const baseNavItems = [
  { name: 'Home', path: '/', icon: Home },
  { name: 'Projects', path: '/projects', icon: FolderGit2 },
  { name: 'Tech Stack', path: '/tech-stack', icon: Wrench },
  { name: 'Experience', path: '/experience', icon: Briefcase },
  { name: 'Code Viewer', path: '/code-viewer', icon: Code2 },
  { name: 'Messages', path: '/messages', icon: MessageSquare },
  { name: 'Contact', path: '/contact', icon: Mail },
];

const adminNavItem = { name: 'Admin', path: '/admin', icon: Shield };

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [navItems, setNavItems] = useState(baseNavItems);

  useEffect(() => {
    checkAdminStatus();
  }, []);

  const checkAdminStatus = async () => {
    try {
      const response = await axios.get(`http://localhost:${import.meta.env.VITE_BACKEND_PORT || 1600}/auth/user`, {
        withCredentials: true,
      });
      
      const userId = response.data.user?.profile?.id;
      const adminId = import.meta.env.VITE_ADMIN_DISCORD_ID || '850726663289700373';
      
      if (userId === adminId) {
        setIsAdmin(true);
        setNavItems([...baseNavItems, adminNavItem]);
      }
    } catch (error) {
      // User not logged in or error occurred
      setIsAdmin(false);
      setNavItems(baseNavItems);
    }
  };

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden lg:flex fixed right-8 top-1/2 -translate-y-1/2 z-50">
        <div className="flex flex-col gap-4 glass rounded-2xl p-4 glow-box">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `p-3 rounded-xl transition-all duration-300 group relative ${
                  isActive
                    ? 'bg-quantum-glow bg-opacity-20 text-quantum-glow'
                    : 'text-gray-400 hover:text-quantum-glow hover:bg-white hover:bg-opacity-5'
                }`
              }
            >
              <item.icon className="w-6 h-6" />
              <span className="absolute right-full mr-4 top-1/2 -translate-y-1/2 px-3 py-2 bg-dark-800 rounded-lg text-sm font-mono whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                {item.name}
              </span>
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Mobile Navigation Toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-6 right-6 z-50 glass rounded-xl p-3 text-quantum-glow"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Mobile Navigation Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.nav
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="lg:hidden fixed top-20 right-6 z-40 glass rounded-2xl p-4 min-w-[200px]"
          >
            <div className="flex flex-col gap-2">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 p-3 rounded-xl transition-all duration-300 ${
                      isActive
                        ? 'bg-quantum-glow bg-opacity-20 text-quantum-glow'
                        : 'text-gray-400 hover:text-quantum-glow hover:bg-white hover:bg-opacity-5'
                    }`
                  }
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-mono text-sm">{item.name}</span>
                </NavLink>
              ))}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </>
  );
}


