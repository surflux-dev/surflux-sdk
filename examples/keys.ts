/**
 * Surflux API Keys Configuration
 * 
 * This file contains your Surflux API keys. Follow the instructions below to obtain your keys.
 * 
 * IMPORTANT: Never commit this file to version control! It's already in .gitignore.
 */

// ============================================================================
// HOW TO OBTAIN YOUR SURFLUX KEYS
// ============================================================================
//
// Step 1: Visit the Surflux Dashboard
//   - Go to https://dashboard.surflux.dev
//   - Sign up or log in to your account
//
// Step 2: Get Your API Key (for REST API clients)
//   - Navigate to the "API Keys Management" section in the dashboard
//   - Click "Create API Key" or use an existing one
//   - Copy the API key and paste it below
//   - API keys are used for:
//     * SurfluxIndexerClient (Deepbook API, NFT API)
//
// Step 3: Get Your Stream Key (for Event Streaming clients)
//   - Navigate to the "Your Active Flux Streams" section in the dashboard
//   - Click "Create New Flux Stream" or use an existing one
//   - Copy the stream key and paste it below
//   - Stream keys are used for:
//     * SurfluxPackageEventsClient (Package event streaming)
//     * SurfluxDeepbookEventsClient (Deepbook event streaming)
//
// Step 4: Configure Your Keys
//   - Replace the placeholder values below with your actual keys
//   - Configure the network (default is TESTNET, change to MAINNET for production)
//   - Save this file
//
// ============================================================================

export const SURFLUX_API_KEY = 'your-api-key-here';
export const SURFLUX_STREAM_KEY = 'f84f4621-0cf4-4d5b-9a27-75908ad2cc86';

// Network configuration
// Options: SurfluxNetwork.TESTNET, SurfluxNetwork.MAINNET, SurfluxNetwork.CUSTOM
// Default: TESTNET (change to MAINNET for production use)
import { SurfluxNetwork } from '../dist';
export const SURFLUX_NETWORK = SurfluxNetwork.TESTNET;

// ============================================================================
// KEY USAGE GUIDE
// ============================================================================
//
// API Key Usage:
//   - Used with SurfluxIndexerClient for REST API calls
//   - Examples: deepbook-basic.ts, nft-basic.ts
//
// Stream Key Usage:
//   - Used with SurfluxPackageEventsClient for package event streaming
//   - Used with SurfluxDeepbookEventsClient for Deepbook event streaming
//   - Examples: package-events-basic.ts, deepbook-events-basic.ts
//
// ============================================================================
