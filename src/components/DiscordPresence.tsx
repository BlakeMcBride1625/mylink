import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Music, Code } from 'lucide-react';

interface DiscordPresenceProps {
  data: any;
  profileData?: any;
  isLoading: boolean;
  error: Error | null;
  hideDetails: boolean;
}

function formatElapsedTime(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  
  if (hours > 0) {
    return `${hours}:${String(minutes % 60).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')} elapsed`;
  }
  return `${minutes}:${String(seconds % 60).padStart(2, '0')} elapsed`;
}

function calculateAge(birthDate: Date): number {
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
}

// Discord official profile badges (from public_flags) + detectable features
const badgeInfo: Record<string, { name: string; icon: string; useLocal?: boolean }> = {
  staff: { name: 'Discord Staff', icon: '5e74e9b61934fc1f67c65515d1f7e60d' },
  partner: { name: 'Partnered Server Owner', icon: '3f9748e53446a137a052f3454e2de41e' },
  hypesquad: { name: 'HypeSquad Events', icon: 'bf01d1073931f921909045f3a39fd264' },
  bug_hunter_level_1: { name: 'Bug Hunter', icon: '2717692c7dca7289b35297368a940dd0' },
  hypesquad_online_house_1: { name: 'HypeSquad Bravery', icon: `${import.meta.env.BASE_URL}badges/hypesquadbravery.svg`, useLocal: true },
  hypesquad_online_house_2: { name: 'HypeSquad Brilliance', icon: '011940fd013da3f7fb926e4a1cd2e618' },
  hypesquad_online_house_3: { name: 'HypeSquad Balance', icon: '3aa41de486fa12454c3761e8e223442e' },
  premium_early_supporter: { name: 'Early Supporter', icon: '7060786766c9c840eb3019e725d2b358' },
  bug_hunter_level_2: { name: 'Bug Hunter Level 2', icon: '848f79194d4be5ff5f81505cbd0ce1e6' },
  verified_developer: { name: 'Early Verified Bot Developer', icon: '6bdc42827a38498929a4920da12695d9' },
  certified_moderator: { name: 'Moderator Programs Alumni', icon: 'fee1624003e2fee35cb398e125dc479b' },
  active_developer: { name: 'Active Developer', icon: `${import.meta.env.BASE_URL}badges/activedeveloper.svg`, useLocal: true },
  nitro_gold: { name: 'Nitro', icon: `${import.meta.env.BASE_URL}badges/nitro-gold.svg`, useLocal: true },
  premium_guild_subscriber: { name: 'Server Booster', icon: `${import.meta.env.BASE_URL}badges/serverboost1.svg`, useLocal: true },
  quest_completed: { name: 'Completed A Quest', icon: `${import.meta.env.BASE_URL}badges/quest.png`, useLocal: true },
  apprentice: { name: 'Apprentice', icon: `${import.meta.env.BASE_URL}badges/OrbsApprentice.webp`, useLocal: true },
};

export default function DiscordPresence({
  data,
  profileData,
  isLoading,
  error,
  hideDetails,
}: DiscordPresenceProps) {
  const birthDate = new Date(2004, 2, 2); // March 2, 2004
  const age = calculateAge(birthDate);
  const discordUserId = import.meta.env.VITE_DISCORD_USER_ID || '850726663289700373';
  const discordProfileUrl = `https://discord.com/users/${discordUserId}`;

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

  if (error || !data?.success) {
    return (
      <div className="glass rounded-2xl p-6 h-full">
        <div className="text-gray-500 text-center">
          <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">Currently offline</p>
        </div>
      </div>
    );
  }

  const presence = data.data;
  const activities = presence.activities || [];
  const spotify = activities.find((a: any) => a.type === 2);

  const statusIcons = {
    online: `${import.meta.env.BASE_URL}status-icons/online.png`,
    idle: `${import.meta.env.BASE_URL}status-icons/idle.png`,
    dnd: `${import.meta.env.BASE_URL}status-icons/dnd.png`,
    offline: `${import.meta.env.BASE_URL}status-icons/invisible-offline.png`,
    invisible: `${import.meta.env.BASE_URL}status-icons/invisible-offline.png`,
  };

  return (
    <a
      href={discordProfileUrl}
      target="_blank"
      rel="noopener noreferrer"
      title="Click to view my Discord profile"
      className="block h-full"
    >
      <motion.div
        layout
        className="glass glass-hover rounded-2xl p-6 h-full cursor-pointer transition-all duration-300 hover:scale-[1.02]"
        style={{
          '--hover-shadow': '0 20px 60px rgba(0, 217, 255, 0.3)',
        } as React.CSSProperties}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
              <div className="flex items-center gap-2 mb-6">
                <Activity className="w-5 h-5 text-quantum-glow" />
                <h3 className="font-mono text-lg font-semibold">Discord Profile</h3>
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
            {/* Avatar & Status */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <img
                  src={`https://cdn.discordapp.com/avatars/${presence.discord_user.id}/${presence.discord_user.avatar}.png?size=128`}
                  alt="Avatar"
                  className="w-16 h-16 rounded-full ring-2 ring-quantum-glow"
                />
                <img
                  src={statusIcons[presence.discord_status as keyof typeof statusIcons]}
                  alt={presence.discord_status}
                  className="absolute bottom-0 right-0 w-5 h-5 rounded-full border-2 border-dark-800"
                />
              </div>
              <div>
                <p className="font-mono font-semibold">
                  {presence.discord_user.username}
                </p>
              </div>
            </div>

            {/* Badges */}
            {profileData?.badges && profileData.badges.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {profileData.badges.map((badge: string) => {
                  // Special handling for clan badge
                  if (badge === 'clan_badge' && profileData.clan) {
                    return (
                      <div
                        key={badge}
                        className="group relative"
                        title={`Clan: ${profileData.clan.tag}`}
                      >
                        <img
                          src={`https://cdn.discordapp.com/clan-badges/${profileData.clan.identity_guild_id}/${profileData.clan.badge}.png?size=64`}
                          alt={`Clan ${profileData.clan.tag}`}
                          className="w-6 h-6 hover:scale-110 transition-transform"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-dark-800 text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                          Clan: {profileData.clan.tag}
                        </div>
                      </div>
                    );
                  }
                  
                  const badgeData = badgeInfo[badge];
                  if (!badgeData) return null;
                  
                  return (
                    <div
                      key={badge}
                      className="group relative"
                      title={badgeData.name}
                    >
                      <img
                        src={badgeData.useLocal ? badgeData.icon : `https://cdn.discordapp.com/badge-icons/${badgeData.icon}.png?size=64`}
                        alt={badgeData.name}
                        className="w-6 h-6 hover:scale-110 transition-transform"
                        onError={(e) => {
                          console.error(`Badge failed to load: ${badge} (${badgeData.name})`);
                          console.error(`Icon URL: ${badgeData.useLocal ? badgeData.icon : `https://cdn.discordapp.com/badge-icons/${badgeData.icon}.png`}`);
                          // Show a placeholder instead of hiding
                          e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"%3E%3Crect width="24" height="24" fill="%2300d9ff" opacity="0.2" rx="4"/%3E%3Ctext x="12" y="16" font-family="Arial" font-size="12" fill="%2300d9ff" text-anchor="middle"%3E?%3C/text%3E%3C/svg%3E';
                        }}
                      />
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-dark-800 text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                        {badgeData.name}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Bio */}
            <div className="space-y-2 text-sm text-gray-300 leading-relaxed">
              <p>
                Hey, I'm Blake. I'm <span className="text-quantum-glow font-semibold">{age}</span> and based in{' '}
                <span className="text-quantum-glow">Hythe, Southampton, England</span>.
              </p>
              <p>
                I'm a coding engineer who spends way too much time debugging things that I probably broke in the first place. 
                When I'm not deep in code, I'm producing music, mixing sounds, and chasing that perfect track that hits just right.
              </p>
              <p>
                Technology and music pretty much run my life; if it has wires or rhythm, I'm into it.
              </p>
            </div>

            {/* Spotify Activity */}
            {spotify && (
              <div className="bg-[#1DB954] bg-opacity-10 rounded-xl p-3 border border-[#1DB954] border-opacity-20">
                <div className="flex items-center gap-2 mb-2">
                  <Music className="w-4 h-4 text-[#1DB954]" />
                  <span className="text-xs font-mono text-[#1DB954]">Listening to Spotify</span>
                </div>
                <p className="text-sm font-semibold truncate">{spotify.details}</p>
                <p className="text-xs text-gray-400 truncate">{spotify.state}</p>
              </div>
            )}

            {/* Other Activities */}
            {activities
              .filter((a: any) => a.type !== 2 && a.type !== 4)
              .map((activity: any, index: number) => {
                const activityType = activity.type === 0 ? 'Playing' : 
                                    activity.type === 1 ? 'Streaming' : 
                                    activity.type === 3 ? 'Watching' : 
                                    activity.type === 5 ? 'Competing in' : 
                                    'Activity';
                
                return (
                  <div
                    key={index}
                    className="bg-quantum-glow bg-opacity-10 rounded-xl p-3 border border-quantum-glow border-opacity-20"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Code className="w-4 h-4 text-quantum-glow" />
                      <span className="text-xs font-mono text-quantum-glow">
                        {activityType} {activity.name}
                      </span>
                    </div>
                    {activity.details && (
                      <p className="text-sm truncate">{activity.details}</p>
                    )}
                    {activity.state && (
                      <p className="text-xs text-gray-400 truncate">{activity.state}</p>
                    )}
                    {activity.timestamps?.start && (
                      <p className="text-xs text-gray-500 mt-1">
                        {formatElapsedTime(Date.now() - activity.timestamps.start)}
                      </p>
                    )}
                  </div>
                );
              })}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
    </a>
  );
}


