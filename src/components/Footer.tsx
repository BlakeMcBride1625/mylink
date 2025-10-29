import { Link } from 'react-router-dom';
import { Shield, FileText } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative z-10 border-t border-white border-opacity-10 bg-dark-900 bg-opacity-50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 py-6 lg:px-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Copyright */}
          <div className="text-gray-500 text-sm font-mono">
            © {currentYear} MY HUB by EpilDevConnect. All rights reserved.
          </div>

          {/* Links */}
          <div className="flex items-center gap-6">
            <Link
              to="/privacy"
              className="flex items-center gap-2 text-gray-400 hover:text-quantum-glow transition-colors text-sm font-mono"
            >
              <Shield className="w-4 h-4" />
              Privacy Policy
            </Link>
            <Link
              to="/terms"
              className="flex items-center gap-2 text-gray-400 hover:text-quantum-glow transition-colors text-sm font-mono"
            >
              <FileText className="w-4 h-4" />
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

