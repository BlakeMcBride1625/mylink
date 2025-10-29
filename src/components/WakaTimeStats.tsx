import { motion } from 'framer-motion';
import { Code2, Clock } from 'lucide-react';

interface WakaTimeStatsProps {
  data: any;
  isLoading: boolean;
  error: Error | null;
}

export default function WakaTimeStats({
  data,
  isLoading,
  error,
}: WakaTimeStatsProps) {
  if (isLoading) {
    return (
      <div className="glass rounded-2xl p-6 h-full">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-700 rounded w-1/2"></div>
          <div className="h-20 bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  if (error || !data?.data) {
    return (
      <div className="glass rounded-2xl p-6 h-full">
        <div className="text-gray-500 text-center">
          <Code2 className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No coding activity</p>
        </div>
      </div>
    );
  }

  const stats = data.data;
  const topLanguages = stats.languages?.slice(0, 5) || [];
  const totalTime = stats.human_readable_total || '0 hrs 0 mins';

  return (
    <motion.div
      layout
      className="glass glass-hover rounded-2xl p-6 h-full"
    >
      <div className="flex items-center gap-2 mb-6">
        <Code2 className="w-5 h-5 text-quantum-glow" />
        <h3 className="font-mono text-lg font-semibold">Current Coding Activity</h3>
      </div>

      <div className="space-y-4">
        {/* Total Time */}
        <div className="bg-quantum-glow bg-opacity-10 rounded-xl p-4 border border-quantum-glow border-opacity-20">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-4 h-4 text-quantum-glow" />
            <span className="text-xs font-mono text-quantum-glow">Last 7 Days</span>
          </div>
          <p className="text-2xl font-mono font-bold">{totalTime}</p>
        </div>

        {/* Top Languages */}
        {topLanguages.length > 0 && (
          <div>
            <p className="text-xs font-mono text-gray-400 mb-3">TOP LANGUAGES</p>
            <div className="space-y-2">
              {topLanguages.map((lang: any, index: number) => (
                <div key={index}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="font-mono">{lang.name}</span>
                    <span className="text-gray-400 text-xs">{lang.text}</span>
                  </div>
                  <div className="w-full bg-dark-700 rounded-full h-1.5 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${lang.percent}%` }}
                      transition={{ duration: 1, delay: index * 0.1 }}
                      className="h-full bg-gradient-to-r from-quantum-glow to-quantum-500"
                    ></motion.div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Active Project */}
        {stats.best_day && (
          <div className="text-xs">
            <p className="text-gray-400 mb-1">Best Day</p>
            <p className="font-mono">
              {new Date(stats.best_day.date).toLocaleDateString()} -{' '}
              <span className="text-quantum-glow">{stats.best_day.text}</span>
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
}


