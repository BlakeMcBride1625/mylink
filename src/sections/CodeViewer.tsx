import { useState } from 'react';
import { motion } from 'framer-motion';
import { Code2, Copy, Check, Github, ExternalLink } from 'lucide-react';
import { Highlight, themes } from 'prism-react-renderer';

const codeExamples = [
  {
    id: 1,
    title: '8BP Rewards - Puppeteer Browser Setup',
    language: 'typescript',
    code: `import puppeteer, { Browser, Page } from 'puppeteer';
import * as cron from 'node-cron';
import { config } from './config';
import { Logger } from './logger';

export class EightBallPoolClaimer {
  private browser: Browser | null = null;
  private logger: Logger;

  constructor() {
    this.logger = new Logger();
  }

  private async setupBrowser(): Promise<Browser> {
    this.logger.info('Setting up browser...');
    
    const browser = await puppeteer.launch({
      headless: config.headless ? "new" : false,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--disable-web-security',
        '--window-size=1920,1080',
        '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
      ],
      timeout: 60000,
      protocolTimeout: 60000
    });

    this.logger.info('Browser setup complete');
    return browser;
  }
}`,
  },
  {
    id: 2,
    title: '8BP Rewards - Discord Bot Service',
    language: 'javascript',
    code: `const DiscordService = require('./services/discord-service');
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

class DiscordBot {
  constructor() {
    this.discordService = new DiscordService();
    this.app = express();
    this.port = process.env.DISCORD_API_PORT || 2700;
    
    this.setupApiServer();
  }

  setupApiServer() {
    this.app.use(cors());
    this.app.use(express.json());
    
    // Health check
    this.app.get('/health', (req, res) => {
      res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        discordReady: this.discordService.isReady
      });
    });

    // Get bot status
    this.app.get('/api/bot-status', async (req, res) => {
      try {
        const status = await this.discordService.getBotStatus();
        res.json(status);
      } catch (error) {
        res.status(500).json({
          success: false,
          error: error.message
        });
      }
    });
  }
}`,
  },
  {
    id: 3,
    title: '8BP Rewards - Configuration System',
    language: 'typescript',
    code: `import dotenv from 'dotenv';

dotenv.config();

export interface Config {
  userIds: string[];
  shopUrl: string;
  headless: boolean;
  timeout: number;
  delayBetweenUsers: number;
}

export const config: Config = {
  userIds: getUserIdList(),
  shopUrl: process.env.SHOP_URL || 'https://8ballpool.com/en/shop',
  headless: process.env.HEADLESS === 'true',
  timeout: parseInt(process.env.TIMEOUT || '30000', 10),
  delayBetweenUsers: parseInt(process.env.DELAY_BETWEEN_USERS || '5000', 10)
};

function getUserIdList(): string[] {
  const userIds = process.env.USER_IDS;
  const singleUserId = process.env.USER_ID;
  
  if (userIds) {
    return userIds.split(',').map(id => id.trim()).filter(id => id.length > 0);
  } else if (singleUserId) {
    return [singleUserId.trim()];
  } else {
    return ['1826254746'];
  }
}`,
  },
];

export default function CodeViewer() {
  const [selectedExample, setSelectedExample] = useState(codeExamples[0]);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(selectedExample.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen px-4 py-20 lg:px-12 lg:py-24">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <div className="flex items-center gap-4 mb-4">
            <Code2 className="w-9 h-9 text-quantum-glow" />
            <h1 className="text-5xl lg:text-7xl font-bold section-heading tracking-tight">
              Code Viewer
            </h1>
          </div>
          <p className="text-lg text-gray-400 font-mono mb-6">
            Explore code samples and implementations
          </p>
          <div className="flex gap-4">
            <a
              href="https://github.com/BlakeMcBride1625/8bp-rewards-v3"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 glass glass-hover rounded-xl font-mono text-sm"
            >
              <Github className="w-4 h-4" />
              View 8BP Rewards on GitHub
            </a>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Sidebar - Code Examples List */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-1"
          >
            <div className="glass rounded-2xl p-4 space-y-2">
              {codeExamples.map((example) => (
                <button
                  key={example.id}
                  onClick={() => setSelectedExample(example)}
                  className={`w-full text-left p-3 rounded-xl transition-all font-mono text-sm ${
                    selectedExample.id === example.id
                      ? 'bg-quantum-glow bg-opacity-20 text-quantum-glow'
                      : 'text-gray-400 hover:bg-white hover:bg-opacity-5'
                  }`}
                >
                  {example.title}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Code Display */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-3"
          >
            <div className="glass rounded-2xl overflow-hidden">
              {/* VS Code-like Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  </div>
                  <span className="font-mono text-sm text-gray-400">
                    {selectedExample.title}
                  </span>
                </div>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-2 px-3 py-1.5 bg-white bg-opacity-5 hover:bg-opacity-10 rounded-lg transition-all text-sm font-mono"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 text-green-400" />
                      <span className="text-green-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>

              {/* Code Content */}
              <div className="p-6 overflow-x-auto max-h-[600px] overflow-y-auto scrollbar-hide">
                <Highlight
                  theme={themes.nightOwl}
                  code={selectedExample.code}
                  language={selectedExample.language as any}
                >
                  {({ className, style, tokens, getLineProps, getTokenProps }) => (
                    <pre className={`${className} text-sm`} style={style} suppressHydrationWarning>
                      {tokens.map((line, i) => (
                        <div key={i} {...getLineProps({ line })}>
                          <span className="inline-block w-12 text-right mr-4 text-gray-600 select-none">
                            {i + 1}
                          </span>
                          {line.map((token, key) => (
                            <span key={key} {...getTokenProps({ token })} />
                          ))}
                        </div>
                      ))}
                    </pre>
                  )}
                </Highlight>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}


