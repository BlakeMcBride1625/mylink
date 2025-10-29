import { motion } from 'framer-motion';
import { Wrench, ExternalLink } from 'lucide-react';

interface TechItem {
  name: string;
  url: string;
}

const techStack: Record<string, TechItem[]> = {
  Languages: [
    { name: 'TypeScript', url: 'https://www.typescriptlang.org/' },
    { name: 'JavaScript', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript' },
    { name: 'Python', url: 'https://www.python.org/' },
    { name: 'C++', url: 'https://isocpp.org/' },
    { name: 'SQL', url: 'https://www.iso.org/standard/63555.html' },
  ],
  'Frontend Frameworks': [
    { name: 'React', url: 'https://react.dev/' },
    { name: 'Next.js', url: 'https://nextjs.org/' },
    { name: 'Vue.js', url: 'https://vuejs.org/' },
    { name: 'Tailwind CSS', url: 'https://tailwindcss.com/' },
    { name: 'Framer Motion', url: 'https://www.framer.com/motion/' },
  ],
  'Backend & APIs': [
    { name: 'Node.js', url: 'https://nodejs.org/' },
    { name: 'Express', url: 'https://expressjs.com/' },
    { name: 'GraphQL', url: 'https://graphql.org/' },
    { name: 'REST', url: 'https://restfulapi.net/' },
    { name: 'WebSocket', url: 'https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API' },
  ],
  'Databases & Storage': [
    { name: 'PostgreSQL', url: 'https://www.postgresql.org/' },
    { name: 'MongoDB', url: 'https://www.mongodb.com/' },
    { name: 'MySQL', url: 'https://www.mysql.com/' },
    { name: 'Supabase', url: 'https://supabase.com/' },
  ],
  'DevOps & Tools': [
    { name: 'Docker', url: 'https://www.docker.com/' },
    { name: 'GitHub Actions', url: 'https://github.com/features/actions' },
    { name: 'AWS', url: 'https://aws.amazon.com/' },
    { name: 'Cloudflare', url: 'https://www.cloudflare.com/' },
    { name: 'Nginx', url: 'https://nginx.org/' },
    { name: 'Linux', url: 'https://www.linux.org/' },
  ],
  'Audio & Media': [
    { name: 'Ableton Live', url: 'https://www.ableton.com/' },
    { name: 'Logic Pro', url: 'https://www.apple.com/logic-pro/' },
    { name: 'Pro Tools', url: 'https://www.avid.com/pro-tools' },
    { name: 'FL Studio', url: 'https://www.image-line.com/fl-studio/' },
    { name: 'OBS Studio', url: 'https://obsproject.com/' },
  ],
};

export default function TechStack() {
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
            <Wrench className="w-9 h-9 text-quantum-glow" />
            <h1 className="text-5xl lg:text-7xl font-bold section-heading tracking-tight">
              Tech Stack
            </h1>
          </div>
          <p className="text-lg text-gray-400 font-mono">
            Tools and technologies I work with
          </p>
        </motion.div>

        {/* Tech Categories */}
        <div className="space-y-8">
          {Object.entries(techStack).map(([category, items], categoryIndex) => (
            <motion.div
              key={category}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: categoryIndex * 0.1 }}
              className="glass glass-hover rounded-2xl p-6"
            >
              <h3 className="text-xl font-mono font-bold mb-6 text-quantum-glow">
                {category}
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {items.map((item, itemIndex) => (
                  <motion.a
                    key={item.name}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{
                      duration: 0.3,
                      delay: categoryIndex * 0.1 + itemIndex * 0.05,
                    }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center justify-between gap-3 p-4 bg-white bg-opacity-5 hover:bg-opacity-10 rounded-xl transition-all group cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-quantum-glow rounded-full group-hover:scale-150 transition-transform"></div>
                      <span className="font-mono text-sm">{item.name}</span>
                    </div>
                    <ExternalLink className="w-3 h-3 text-gray-500 group-hover:text-quantum-glow transition-colors opacity-0 group-hover:opacity-100" />
                  </motion.a>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Additional Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-12 glass rounded-2xl p-6"
        >
          <p className="text-gray-400 text-sm font-mono text-center">
            Always learning and exploring new technologies 🚀
          </p>
        </motion.div>
      </div>
    </div>
  );
}


