/**
 * NFT Owner Portfolio Example
 * 
 * This example demonstrates how to view an owner's NFT portfolio:
 * - Fetching all NFTs owned by an address
 * - Grouping NFTs by collection
 * - Analyzing portfolio composition
 * - Filtering by collection types
 */

import { SurfluxNFTClient, SurfluxNetwork } from '../src/index';

async function main() {
  const client = new SurfluxNFTClient({
    apiKey: process.env.SURFLUX_API_KEY || 'your-api-key-here',
    network: SurfluxNetwork.TESTNET,
  });

  const ownerAddress = '0x0000000000000000000000000000000000000000000000000000000000000000'; // Replace with actual address

  try {
    console.log(`Fetching NFT portfolio for: ${ownerAddress}\n`);

    // Fetch all NFTs owned by the address
    let allNfts = [];
    let currentPage = 1;
    let hasMore = true;

    while (hasMore) {
      const response = await client.getNFTsByOwner({
        address: ownerAddress,
        page: currentPage,
        per_page: 50,
      });

      allNfts = [...allNfts, ...response.items];
      hasMore = !response.isLastPage;
      currentPage++;

      console.log(`  Page ${response.currentPage}: ${response.items.length} NFTs`);

      // Limit to first 5 pages for demo
      if (currentPage > 5) {
        break;
      }
    }

    console.log(`\nTotal NFTs: ${allNfts.length}`);

    if (allNfts.length === 0) {
      console.log('No NFTs found for this address.');
      return;
    }

    // Group NFTs by collection type
    console.log('\n=== Portfolio by Collection ===');
    const collectionGroups: Record<string, Array<import('../src/types').NFTToken>> = {};
    
    allNfts.forEach(nft => {
      const collectionType = nft.object_type;
      if (!collectionGroups[collectionType]) {
        collectionGroups[collectionType] = [];
      }
      collectionGroups[collectionType].push(nft);
    });

    Object.entries(collectionGroups)
      .sort((a, b) => b[1].length - a[1].length)
      .forEach(([collectionType, nfts]) => {
        console.log(`\n${collectionType}:`);
        console.log(`  Count: ${nfts.length}`);
        console.log(`  Sample NFT IDs:`);
        nfts.slice(0, 3).forEach(nft => {
          console.log(`    - ${nft.object_id}`);
        });
      });

    // Portfolio statistics
    console.log('\n=== Portfolio Statistics ===');
    console.log(`Total collections: ${Object.keys(collectionGroups).length}`);
    console.log(`Largest collection: ${Object.values(collectionGroups).reduce((a, b) => a.length > b.length ? a : b).length} NFTs`);
    console.log(`Smallest collection: ${Object.values(collectionGroups).reduce((a, b) => a.length < b.length ? a : b).length} NFTs`);

    // NFTs with decoded fields
    const nftsWithFields = allNfts.filter(nft => 
      nft.decoded_fields && Object.keys(nft.decoded_fields).length > 0
    );
    console.log(`\nNFTs with metadata: ${nftsWithFields.length}`);

    // NFTs in kiosks
    const nftsInKiosks = allNfts.filter(nft => nft.kiosk_object_id);
    console.log(`NFTs in kiosks: ${nftsInKiosks.length}`);

    // Example: Filter by specific collections
    console.log('\n=== Filtering by Collections ===');
    const targetCollections = Object.keys(collectionGroups).slice(0, 2); // Get first 2 collections
    
    if (targetCollections.length > 0) {
      const filteredResponse = await client.getNFTsByOwner({
        address: ownerAddress,
        collections: targetCollections,
        page: 1,
        per_page: 20,
      });
      
      console.log(`Filtered NFTs (${targetCollections.length} collections):`);
      console.log(`  Found: ${filteredResponse.items.length} NFTs`);
      console.log(`  Collections: ${targetCollections.join(', ')}`);
    }

  } catch (error) {
    if (error instanceof Error && error.message.includes('404')) {
      console.error(`Address ${ownerAddress} not found or has no NFTs. Please replace with a valid address.`);
    } else {
      console.error('Error:', error instanceof Error ? error.message : error);
    }
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

