
import { createLogger } from '@mastra/core/logger';
import { Mastra } from '@mastra/core/mastra';
import { VercelDeployer } from "@mastra/deployer-vercel";
import { aimWriter } from './agents/aim-writer';

import dotenv from 'dotenv';

dotenv.config();

export const mastra = new Mastra({
  workflows: {},
  agents: { aimWriter },
  logger: createLogger({
    name: 'Mastra',
    level: 'info',
  }),
  deployer: new VercelDeployer({
    teamId: process.env.VERCEL_TEAM_ID || '',
    projectName: process.env.VERCEL_PROJECT_NAME || '',
    token: process.env.VERCEL_TOKEN || '',
  }),
});
