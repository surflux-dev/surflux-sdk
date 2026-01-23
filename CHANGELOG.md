# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.2.1] - 2026-01-23

### Fixed
- CLI compatibility with chalk v5+ by converting CLI to ESM format

## [0.2.0] - 2026-01-23

### Added
- NFT API client for querying collections, tokens, and holders
- Deepbook API client for trading pools, order books, trades, and OHLCV data
- Package Events client for real-time Sui package event streaming
- Deepbook Events client for live trades and order book updates
- CLI tool for generating TypeScript types from package events
- Comprehensive unit tests with near 100% branch coverage
- Examples demonstrating SDK usage
- Improved error handling with custom error classes
- TypeScript documentation (JSDoc) for all public APIs

### Changed
- Refactored client architecture into modular design
- Improved type safety across all clients
- Enhanced event source implementation for better cross-platform support
- Changed package access from restricted to public

### Fixed
- Event source connection issues in Node.js environments
- Event deduplication logic for timestamp-based filtering
- Wildcard pattern matching for event subscriptions

## [0.1.0] - 2025-12-09

### Added
- Initial release
- Basic SDK structure

[Unreleased]: https://github.com/surflux-dev/surflux-sdk/compare/v0.2.1...HEAD
[0.2.1]: https://github.com/surflux-dev/surflux-sdk/compare/v0.2.0...v0.2.1
[0.2.0]: https://github.com/surflux-dev/surflux-sdk/compare/0.1.0...v0.2.0
[0.1.0]: https://github.com/surflux-dev/surflux-sdk/releases/tag/0.1.0
