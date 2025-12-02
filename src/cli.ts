#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { generateTypes } from './generator';
import * as path from 'path';
import * as fs from 'fs-extra';

const program = new Command();

program
  .name('sui-event-catcher')
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

      const normalizedPackageId = packageId.replace(/^0x/, '');
      const packageOutputDir = path.join(baseOutputDir, normalizedPackageId);
      await fs.ensureDir(packageOutputDir);

      const types = await generateTypes(packageId, network);

      const typesPath = path.join(packageOutputDir, 'types.ts');
      await fs.writeFile(typesPath, types);

      const indexPath = path.join(packageOutputDir, 'index.ts');
      const indexContent = `// Re-export types and client for convenience
export * from './types';
export { EventClient } from 'sui-event-catcher';

// Helper to create a typed client instance
import { EventClient } from 'sui-event-catcher';
import packageInfo from './package-info.json';

/**
 * Create an EventClient instance for this package
 * @param apiKey Your Surflux API key
 * @param typesPath Optional path to the generated types directory (defaults to current directory)
 */
export function createEventClient(apiKey: string, typesPath?: string): EventClient {
  return new EventClient(apiKey, packageInfo.packageId, typesPath || __dirname);
}
`;
      await fs.writeFile(indexPath, indexContent);

      const packageInfoPath = path.join(packageOutputDir, 'package-info.json');
      await fs.writeFile(
        packageInfoPath,
        JSON.stringify({ packageId, network, generatedAt: new Date().toISOString() }, null, 2)
      );

      const rootIndexPath = path.join(baseOutputDir, 'index.ts');
      let existingExports: string[] = [];

      if (await fs.pathExists(rootIndexPath)) {
        const existingContent = await fs.readFile(rootIndexPath, 'utf-8');
        const exportMatches = existingContent.match(/export \* from ['"]\.\/([^'"]+)['"]/g);
        if (exportMatches) {
          existingExports = exportMatches
            .map((match) => {
              const packageMatch = match.match(/\.\/([^'"]+)/);
              return packageMatch ? packageMatch[1] : '';
            })
            .filter(Boolean);
        }
      }

      if (!existingExports.includes(normalizedPackageId)) {
        existingExports.push(normalizedPackageId);
      }

      const rootIndexContent = `// Auto-generated root index - exports all packages
${existingExports.map((pkg) => `export * from './${pkg}';`).join('\n')}
`;
      await fs.writeFile(rootIndexPath, rootIndexContent);

      console.log(chalk.green('Types generated successfully!'));
      console.log(chalk.gray(`Output: ${packageOutputDir}`));
      console.log(chalk.gray(`Types: ${typesPath}`));
    } catch (error: any) {
      console.error(chalk.red('Error generating types:'), error.message);
      process.exit(1);
    }
  });

program.parse();
