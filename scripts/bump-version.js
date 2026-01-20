#!/usr/bin/env node

/**
 * Version bumping script for semantic versioning
 * Usage:
 *   npm run version:patch  (0.1.0 -> 0.1.1)
 *   npm run version:minor  (0.1.0 -> 0.2.0)
 *   npm run version:major  (0.1.0 -> 1.0.0)
 */

const fs = require('fs');
const path = require('path');

const packageJsonPath = path.join(__dirname, '..', 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

const currentVersion = packageJson.version;
const versionParts = currentVersion.split('.').map(Number);

const bumpType = process.argv[2];

if (!bumpType || !['major', 'minor', 'patch'].includes(bumpType)) {
  console.error('Usage: node scripts/bump-version.js [major|minor|patch]');
  process.exit(1);
}

let newVersion;
if (bumpType === 'major') {
  newVersion = `${versionParts[0] + 1}.0.0`;
} else if (bumpType === 'minor') {
  newVersion = `${versionParts[0]}.${versionParts[1] + 1}.0`;
} else {
  newVersion = `${versionParts[0]}.${versionParts[1]}.${versionParts[2] + 1}`;
}

packageJson.version = newVersion;
fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');

console.log(`Version bumped from ${currentVersion} to ${newVersion}`);
console.log('\nNext steps:');
console.log('1. Review the changes');
console.log('2. Update CHANGELOG.md');
console.log('3. Commit: git add -A && git commit -m "chore: bump version to ${newVersion}"');
console.log('4. Tag: git tag -a v${newVersion} -m "Release v${newVersion}"');
console.log('5. Push: git push && git push --tags');
