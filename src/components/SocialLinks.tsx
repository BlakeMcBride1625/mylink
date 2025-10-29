import { 
  Twitter, 
  Instagram, 
  Youtube, 
  Facebook,
  Send,
  Music2
} from 'lucide-react';

const socialLinks = [
  { 
    name: 'Twitter', 
    icon: Twitter, 
    url: import.meta.env.VITE_SOCIAL_TWITTER || '#',
    color: 'hover:text-[#1DA1F2]'
  },
  { 
    name: 'Instagram', 
    icon: Instagram, 
    url: import.meta.env.VITE_SOCIAL_INSTAGRAM || '#',
    color: 'hover:text-[#E4405F]'
  },
  { 
    name: 'YouTube', 
    icon: Youtube, 
    url: import.meta.env.VITE_SOCIAL_YOUTUBE || '#',
    color: 'hover:text-[#FF0000]'
  },
  { 
    name: 'TikTok', 
    icon: Music2, 
    url: import.meta.env.VITE_SOCIAL_TIKTOK || '#',
    color: 'hover:text-[#00f2ea]'
  },
  { 
    name: 'Telegram', 
    icon: Send, 
    url: import.meta.env.VITE_SOCIAL_TELEGRAM || '#',
    color: 'hover:text-[#0088cc]'
  },
  { 
    name: 'Facebook', 
    icon: Facebook, 
    url: import.meta.env.VITE_SOCIAL_FACEBOOK || '#',
    color: 'hover:text-[#1877F2]'
  },
];

export default function SocialLinks() {
  return (
    <div className="fixed bottom-8 left-8 z-50 hidden lg:block">
      <div className="flex flex-col gap-4 glass rounded-2xl p-4 glow-box">
        {socialLinks.map((social) => (
          <a
            key={social.name}
            href={social.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`p-3 rounded-xl transition-all duration-300 text-gray-400 hover:bg-white hover:bg-opacity-5 ${social.color}`}
            aria-label={social.name}
          >
            <social.icon className="w-5 h-5" />
          </a>
        ))}
      </div>
    </div>
  );
}


