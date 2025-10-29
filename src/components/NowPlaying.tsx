import { motion, AnimatePresence } from 'framer-motion';
import { Music } from 'lucide-react';

interface NowPlayingProps {
  data: any;
  isLoading: boolean;
  error: Error | null;
  hideDetails: boolean;
}

export default function NowPlaying({
  data,
  isLoading,
  error,
  hideDetails,
}: NowPlayingProps) {
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

  if (error || !data?.recenttracks?.track?.[0]) {
    return (
      <div className="glass rounded-2xl p-6 h-full">
        <div className="text-gray-500 text-center">
          <Music className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No music playing</p>
        </div>
      </div>
    );
  }

  const track = data.recenttracks.track[0];
  const isNowPlaying = track['@attr']?.nowplaying === 'true';

  return (
    <motion.div
      layout
      className="glass glass-hover rounded-2xl p-6 h-full"
    >
      <div className="flex items-center gap-2 mb-6">
        <Music className="w-5 h-5 text-quantum-glow" />
        <h3 className="font-mono text-lg font-semibold">Now Playing</h3>
        {isNowPlaying && (
          <span className="ml-auto">
            <span className="flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
          </span>
        )}
      </div>

      <AnimatePresence mode="wait">
        {hideDetails ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-gray-500 text-sm text-center py-8"
          >
            Details hidden (idle mode)
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            {/* Album Art */}
            {track.image?.[3]?.['#text'] && (
              <img
                src={track.image[3]['#text']}
                alt="Album Art"
                className="w-full aspect-square rounded-xl object-cover ring-2 ring-quantum-glow ring-opacity-20"
              />
            )}

            {/* Track Info */}
            <div>
              <p className="font-semibold text-lg truncate mb-1">{track.name}</p>
              <p className="text-gray-400 text-sm truncate">{track.artist['#text']}</p>
              {track.album?.['#text'] && (
                <p className="text-gray-500 text-xs truncate mt-1">
                  {track.album['#text']}
                </p>
              )}
            </div>

            {/* Status Badge */}
            <div className="flex items-center justify-between text-xs font-mono">
              <span className={isNowPlaying ? 'text-green-400' : 'text-gray-500'}>
                {isNowPlaying ? 'Playing now' : 'Recently played'}
              </span>
              {!isNowPlaying && track.date && (
                <span className="text-gray-600">
                  {new Date(parseInt(track.date.uts) * 1000).toLocaleTimeString()}
                </span>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}


