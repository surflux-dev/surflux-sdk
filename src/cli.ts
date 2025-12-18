#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { generateTypes } from './generator';
import * as path from 'path';
import * as fs from 'fs-extra';
import * as readline from 'readline';

const program = new Command();

type Language = 'typescript' | 'javascript';

function promptLanguage(): Promise<Language> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    console.log(chalk.blue('\nSelect output language:'));
    console.log(chalk.cyan('  1) TypeScript (.ts)'));
    console.log(chalk.cyan('  2) JavaScript (.js with JSDoc)\n'));

    rl.question(chalk.yellow('Enter your choice (1 or 2): '), (answer) => {
      rl.close();
      const choice = answer.trim();
      if (choice === '1' || choice.toLowerCase() === 'typescript' || choice.toLowerCase() === 'ts') {
        resolve('typescript');
      } else if (choice === '2' || choice.toLowerCase() === 'javascript' || choice.toLowerCase() === 'js') {
        resolve('javascript');
      } else {
        console.log(chalk.yellow('Invalid choice. Defaulting to TypeScript.\n'));
        resolve('typescript');
      }
    });
  });
}

if (process.argv.length === 2) {
  console.log(chalk.blue.bold('\n@surflux/sdk - TypeScript Type Generator for Sui Package Events\n'));
  console.log(chalk.white('Description:'));
  console.log(
    chalk.gray('  Generates TypeScript types for Sui package events from a published Sui package.')
  );
  console.log(chalk.gray('  The generator fetches event structures from the Sui blockchain and creates'));
  console.log(chalk.gray('  type-safe TypeScript interfaces for use in your applications.\n'));

  console.log(chalk.white('Usage:'));
  console.log(chalk.cyan('  npx @surflux/sdk <packageId> <network> [options]\n'));

  console.log(chalk.white('Required Inputs:'));
  console.log(chalk.yellow('  packageId'));
  console.log(chalk.gray('    The Sui package ID you want to generate types for (e.g., 0x123...abc)\n'));
  console.log(chalk.yellow('  network'));
  console.log(chalk.gray('    The Sui network to use. Can be one of:'));
  console.log(chalk.gray('    - mainnet'));
  console.log(chalk.gray('    - testnet'));
  console.log(chalk.gray('    - devnet'));
  console.log(chalk.gray('    - A custom RPC URL (e.g., https://fullnode.mainnet.sui.io:443)\n'));

  console.log(chalk.white('Options:'));
  console.log(chalk.cyan('  -o, --output <path>'));
  console.log(chalk.gray('    Output directory for generated types (default: ./sui-events)\n'));

  console.log(chalk.white('Example:'));
  console.log(chalk.cyan('  npx @surflux/sdk 0x123...abc mainnet'));
  console.log(chalk.cyan('  npx @surflux/sdk 0x123...abc testnet -o ./my-types\n'));

  process.exit(0);
}

program
  .name('@surflux/sdk')
  .description('Generate TypeScript types for Sui package events')
  .version('1.0.0')
  .argument('<packageId>', 'Sui package ID')
  .argument('<network>', 'Network (mainnet, testnet, devnet, or custom RPC URL)')
  .option('-o, --output <path>', 'Output directory for generated types', './sui-events')
  .action(async (packageId: string, network: string, options: { output: string }) => {
    try {
      const language = await promptLanguage();

      console.log(chalk.blue('Fetching package events...'));
      console.log(chalk.gray(`Package ID: ${packageId}`));
      console.log(chalk.gray(`Network: ${network}`));
      console.log(chalk.gray(`Language: ${language === 'typescript' ? 'TypeScript' : 'JavaScript'}\n`));

      const baseOutputDir = path.resolve(options.output);
      await fs.ensureDir(baseOutputDir);

      const packageOutputDir = path.join(baseOutputDir, packageId);
      await fs.ensureDir(packageOutputDir);

      const types = await generateTypes(packageId, network, language);

      const fileExtension = language === 'typescript' ? 'ts' : 'js';
      const typesPath = path.join(packageOutputDir, `types.${fileExtension}`);
      await fs.writeFile(typesPath, types);

      const indexPath = path.join(packageOutputDir, `index.${fileExtension}`);
      let indexContent: string;

      if (language === 'typescript') {
        indexContent = `// Re-export types and client for convenience
export * from './types';
export { SurfluxPackageEventsClient } from '@surflux/sdk';

// Helper to create a typed client instance
import { SurfluxPackageEventsClient } from '@surflux/sdk';
import packageInfo from './package-info.json';

/**
 * Create a SurfluxPackageEventsClient instance for this package
 * @param streamKey Your Surflux stream key
 * @param typesPath Optional path to the generated types directory (defaults to current directory)
 */
export function createEventClient(streamKey: string, typesPath?: string): SurfluxPackageEventsClient {
  return new SurfluxPackageEventsClient({
    streamKey,
    network: packageInfo.network
  });
}
`;
      } else {
        indexContent = `// Re-export types and client for convenience
const types = require('./types');
const { SurfluxPackageEventsClient } = require('@surflux/sdk');
const packageInfo = require('./package-info.json');

// Re-export all types
Object.keys(types).forEach((key) => {
  if (key !== 'default') {
    module.exports[key] = types[key];
  }
});

module.exports.SurfluxPackageEventsClient = SurfluxPackageEventsClient;

/**
 * Create a SurfluxPackageEventsClient instance for this package
 * @param {string} streamKey Your Surflux stream key
 * @param {string} [typesPath] Optional path to the generated types directory (defaults to current directory)
 * @returns {SurfluxPackageEventsClient}
 */
function createEventClient(streamKey, typesPath) {
  return new SurfluxPackageEventsClient({
    streamKey,
    network: packageInfo.network
  });
}

module.exports.createEventClient = createEventClient;
`;
      }

      await fs.writeFile(indexPath, indexContent);

      const packageInfoPath = path.join(packageOutputDir, 'package-info.json');
      await fs.writeFile(
        packageInfoPath,
        JSON.stringify({ packageId, network, language, generatedAt: new Date().toISOString() }, null, 2)
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
