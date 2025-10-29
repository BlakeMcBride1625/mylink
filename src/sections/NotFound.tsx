import { motion } from 'framer-motion';
import { Home, Search, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center max-w-2xl"
      >
        {/* 404 Number */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', delay: 0.2 }}
          className="mb-8"
        >
          <h1 className="text-9xl lg:text-[12rem] font-bold glow-text leading-none">
            404
          </h1>
        </motion.div>

        {/* Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', delay: 0.4 }}
          className="mb-6"
        >
          <Search className="w-16 h-16 mx-auto text-quantum-glow opacity-50" />
        </motion.div>

        {/* Message */}
        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-3xl lg:text-5xl font-bold mb-4 section-heading"
        >
          Page Not Found
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="text-gray-400 text-lg mb-8 font-mono"
        >
          The page you're looking for doesn't exist or has been moved.
        </motion.p>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate(-1)}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-white bg-opacity-10 text-white rounded-xl font-semibold hover:bg-opacity-20 transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
            Go Back
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/')}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-quantum-glow text-dark-900 rounded-xl font-semibold hover:opacity-90 transition-all"
          >
            <Home className="w-5 h-5" />
            Go Home
          </motion.button>
        </motion.div>

        {/* Quick Links */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-12 glass rounded-xl p-6"
        >
          <p className="text-sm text-gray-500 mb-4">Quick links:</p>
          <div className="flex flex-wrap gap-3 justify-center">
            {[
              { name: 'Home', path: '/' },
              { name: 'Projects', path: '/projects' },
              { name: 'Tech Stack', path: '/tech-stack' },
              { name: 'Experience', path: '/experience' },
              { name: 'Contact', path: '/contact' },
            ].map((link) => (
              <button
                key={link.path}
                onClick={() => navigate(link.path)}
                className="px-4 py-2 text-sm bg-white bg-opacity-5 hover:bg-opacity-10 rounded-lg transition-all text-gray-300 hover:text-quantum-glow font-mono"
              >
                {link.name}
              </button>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

