
import { createLogger } from '@mastra/core/logger';
import { Mastra } from '@mastra/core/mastra';
import { VercelDeployer } from "@mastra/deployer-vercel";
import { aimWriter } from './agents/aim-writer';
export const mastra = new Mastra({
  workflows: {},
  agents: { aimWriter },
  logger: createLogger({
    name: 'Mastra',
    level: 'info',
  }),
  deployer: new VercelDeployer({
    teamId: 'team_222222222222222222222222',
    projectName: 'memos-agent',
    token: 'vercel_token_222222222222222222222222',
  }),
});
