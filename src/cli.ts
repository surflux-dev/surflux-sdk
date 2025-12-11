#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { generateTypes } from './generator';
import * as path from 'path';
import * as fs from 'fs-extra';

const program = new Command();

program
  .name('@surflux/sdk')
  .description('Generate TypeScript types for Sui package events')
  .version('1.0.0')
  .argument('<packageId>', 'Sui package ID')
  .argument('<network>', 'Network (mainnet, testnet, devnet, or custom RPC URL)')
  .option('-o, --output <path>', 'Output directory for generated types', './sui-events')
  .action(async (packageId: string, network: string, options: { output: string }) => {
    try {
      console.log(chalk.blue('Fetching package events...'));
      console.log(chalk.gray(`Package ID: ${packageId}`));
      console.log(chalk.gray(`Network: ${network}`));

      const baseOutputDir = path.resolve(options.output);
      await fs.ensureDir(baseOutputDir);

      const packageOutputDir = path.join(baseOutputDir, packageId);
      await fs.ensureDir(packageOutputDir);

      const types = await generateTypes(packageId, network);

      const typesPath = path.join(packageOutputDir, 'types.ts');
      await fs.writeFile(typesPath, types);

      const indexPath = path.join(packageOutputDir, 'index.ts');
      const indexContent = `// Re-export types and client for convenience
export * from './types';
export { SurfluxPackageEventsClient } from '@surflux/sdk';

// Helper to create a typed client instance
import { SurfluxPackageEventsClient } from '@surflux/sdk';
import packageInfo from './package-info.json';

/**
 * Create a SurfluxPackageEventsClient instance for this package
 * @param apiKey Your Surflux API key
 * @param typesPath Optional path to the generated types directory (defaults to current directory)
 */
export function createEventClient(apiKey: string, typesPath?: string): SurfluxPackageEventsClient {
  return new SurfluxPackageEventsClient(
    apiKey,
    packageInfo.packageId,
    typesPath || __dirname,
    packageInfo.network
  );
}
`;
      await fs.writeFile(indexPath, indexContent);

      const packageInfoPath = path.join(packageOutputDir, 'package-info.json');
      await fs.writeFile(
        packageInfoPath,
        JSON.stringify({ packageId, network, generatedAt: new Date().toISOString() }, null, 2)
      );

      console.log(chalk.green('Types generated successfully!'));
      console.log(chalk.gray(`Output: ${packageOutputDir}`));
      console.log(chalk.gray(`Types: ${typesPath}`));
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(chalk.red('Error generating types:'), errorMessage);
      process.exit(1);
    }
  });

program.parse();
