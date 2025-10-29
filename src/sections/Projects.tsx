import { motion } from 'framer-motion';
import { ExternalLink, Github, FolderGit2 } from 'lucide-react';

const projects = [
  {
    id: 1,
    title: 'MY HUB',
    description: 'Real-time personal dashboard with live API integrations featuring Discord presence, Last.fm music tracking, and WakaTime coding stats',
    tech: ['React', 'TypeScript', 'Tailwind CSS', 'Node.js', 'Express', 'Framer Motion'],
    github: 'https://github.com/BlakeMcBride1625/MyLink',
    demo: 'https://developer.epildevconnect.uk/myhub/',
    featured: true,
  },
  {
    id: 2,
    title: '8BP Rewards V3',
    description: 'Rewards system application built with modern web technologies',
    tech: ['React', 'TypeScript', 'Node.js'],
    github: 'https://github.com/BlakeMcBride1625/8bp-rewards-v3',
    demo: '#',
    featured: true,
  },
];

export default function Projects() {
  return (
    <div className="min-h-screen px-4 py-20 lg:px-12 lg:py-24">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <div className="flex items-center gap-4 mb-4">
            <FolderGit2 className="w-9 h-9 text-quantum-glow" />
            <h1 className="text-5xl lg:text-7xl font-bold section-heading tracking-tight">
              Projects
            </h1>
          </div>
          <p className="text-lg text-gray-400 font-mono">
            A collection of my work and contributions
          </p>
        </motion.div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className={`glass glass-hover rounded-2xl p-6 flex flex-col ${
                project.featured ? 'ring-2 ring-quantum-glow ring-opacity-30' : ''
              }`}
            >
              {project.featured && (
                <span className="inline-block px-3 py-1 bg-quantum-glow bg-opacity-20 text-quantum-glow text-xs font-mono rounded-lg mb-4 w-fit">
                  FEATURED
                </span>
              )}

              <h3 className="text-xl font-mono font-bold mb-3">{project.title}</h3>
              <p className="text-gray-400 text-sm mb-4 flex-grow">
                {project.description}
              </p>

              {/* Tech Stack */}
              <div className="flex flex-wrap gap-2 mb-4">
                {project.tech.map((tech, i) => (
                  <span
                    key={i}
                    className="px-2 py-1 bg-white bg-opacity-5 text-xs font-mono rounded"
                  >
                    {tech}
                  </span>
                ))}
              </div>

              {/* Links */}
              <div className="flex gap-3 pt-4 border-t border-gray-700">
                <a
                  href={project.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-white bg-opacity-5 hover:bg-opacity-10 rounded-lg transition-all text-sm font-mono"
                >
                  <Github className="w-4 h-4" />
                  Code
                </a>
                <a
                  href={project.demo}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-quantum-glow bg-opacity-20 hover:bg-opacity-30 text-quantum-glow rounded-lg transition-all text-sm font-mono"
                >
                  <ExternalLink className="w-4 h-4" />
                  Demo
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}


