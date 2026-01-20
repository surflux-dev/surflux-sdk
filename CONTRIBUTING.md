# Contributing to Surflux SDK

Thank you for your interest in contributing to the Surflux SDK! This document provides guidelines and instructions for contributing.

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment for all contributors.

## Getting Started

### Prerequisites

- Node.js 18+ and npm 9+
- TypeScript 4.0+
- Git

### Development Setup

1. **Fork and clone the repository**
   ```bash
   git clone https://github.com/surflux-dev/surflux-sdk.git
   cd surflux-sdk
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Build the project**
   ```bash
   npm run build
   ```

4. **Run tests**
   ```bash
   npm test
   ```

5. **Run linter**
   ```bash
   npm run lint
   ```

## Development Workflow

### Making Changes

1. **Create a branch**
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/your-bug-fix
   ```

2. **Make your changes**
   - Write clean, readable code
   - Follow the existing code style
   - Add tests for new features
   - Update documentation as needed

3. **Run tests and linter**
   ```bash
   npm test
   npm run lint
   ```

4. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   ```

   Use conventional commit messages:
   - `feat:` for new features
   - `fix:` for bug fixes
   - `docs:` for documentation changes
   - `test:` for test additions/changes
   - `refactor:` for code refactoring
   - `chore:` for maintenance tasks

5. **Push and create a Pull Request**
   ```bash
   git push origin feature/your-feature-name
   ```

### Code Style

- Follow the existing TypeScript/ESLint configuration
- Use 2 spaces for indentation
- Use meaningful variable and function names
- Add JSDoc comments for public APIs
- Keep functions focused and small
- Handle errors appropriately

### Testing

- Write unit tests for new features
- Ensure all tests pass before submitting
- Aim for good test coverage
- Test both success and error cases

### Documentation

- Update README.md if adding new features
- Update CHANGELOG.md for user-facing changes
- Add JSDoc comments for public APIs
- Include code examples when appropriate

## Pull Request Process

1. **Ensure your PR is ready**
   - All tests pass
   - Linter passes without errors
   - Code is properly formatted
   - Documentation is updated

2. **Create a descriptive PR**
   - Clear title describing the change
   - Detailed description of what changed and why
   - Reference any related issues
   - Include screenshots/examples if applicable

3. **Respond to feedback**
   - Address review comments promptly
   - Make requested changes
   - Discuss any concerns or questions

4. **Wait for approval**
   - At least one maintainer must approve
   - All CI checks must pass
   - Conflicts must be resolved

## Project Structure

```
surflux-sdk/
├── src/              # Source code
│   ├── clients/      # API clients
│   ├── utils/        # Utility functions
│   ├── types.ts      # TypeScript types
│   └── index.ts      # Main exports
├── test/             # Tests
│   ├── unit/         # Unit tests
│   └── e2e/          # End-to-end tests
├── examples/         # Example code
└── scripts/          # Build and utility scripts
```

## Adding New Features

When adding a new feature:

1. **Design the API**
   - Consider backward compatibility
   - Follow existing patterns
   - Keep it simple and intuitive

2. **Implement the feature**
   - Write the code
   - Add TypeScript types
   - Handle errors appropriately

3. **Add tests**
   - Unit tests for the feature
   - Edge cases and error handling

4. **Update documentation**
   - README.md with usage examples
   - CHANGELOG.md with the new feature
   - JSDoc comments for public APIs

5. **Update types**
   - Export new types from `src/types.ts` or create new type files
   - Ensure types are exported from `src/index.ts`

## Reporting Issues

### Bug Reports

When reporting a bug, please include:

- Clear description of the issue
- Steps to reproduce
- Expected vs actual behavior
- Environment details (Node.js version, OS, etc.)
- Error messages or stack traces
- Minimal code example if possible

### Feature Requests

When requesting a feature, please include:

- Clear description of the feature
- Use case and motivation
- Proposed API design (if applicable)
- Examples of how it would be used

## Release Process

Releases are managed by maintainers:

1. Update version in `package.json`
2. Update `CHANGELOG.md`
3. Create a git tag: `git tag -a v0.2.0 -m "Release v0.2.0"`
4. Push tag: `git push --tags`
5. GitHub Actions will automatically publish to npm

## Questions?

- Open an issue for questions or discussions
- Check existing issues and PRs first
- Be respectful and patient

Thank you for contributing! 🎉
