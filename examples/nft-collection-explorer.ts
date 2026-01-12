/**
 * NFT Collection Explorer Example
 * 
 * This example demonstrates how to explore NFT collections:
 * - Fetching all NFTs in a collection
 * - Analyzing collection statistics
 * - Viewing collection holders
 * - Filtering NFTs by fields
 */

import { SurfluxNFTClient, SurfluxNetwork } from '../src/index';

async function main() {
  const client = new SurfluxNFTClient({
    apiKey: process.env.SURFLUX_API_KEY || 'your-api-key-here',
    network: SurfluxNetwork.TESTNET,
  });

  const collectionType = '0x0000000000000000000000000000000000000000000000000000000000000000::test::NFT'; // Replace with actual collection type

  try {
    console.log(`Exploring collection: ${collectionType}\n`);

    // Fetch all NFTs in the collection (with pagination)
    console.log('Fetching NFTs in collection...');
    let allNfts: Array<import('../src/types').NFTToken> = [];
    let currentPage = 1;
    let hasMore = true;

    while (hasMore) {
      const response = await client.getNFTsForCollection({
        type: collectionType,
        page: currentPage,
        per_page: 50,
      });

      allNfts = [...allNfts, ...response.items];
      hasMore = !response.isLastPage;
      currentPage++;

      console.log(`  Page ${response.currentPage}: ${response.items.length} NFTs`);

      // Limit to first 3 pages for demo
      if (currentPage > 3) {
        break;
      }
    }

    console.log(`\nTotal NFTs fetched: ${allNfts.length}`);

    if (allNfts.length > 0) {
      // Analyze collection statistics
      console.log('\n=== Collection Statistics ===');

      // Count unique owners
      const uniqueOwners = new Set(
        allNfts
          .map(nft => nft.owner)
          .filter(owner => owner !== null)
      );
      console.log(`Unique owners: ${uniqueOwners.size}`);

      // Count NFTs by type (if multiple types exist)
      const typeCounts: Record<string, number> = {};
      allNfts.forEach(nft => {
        typeCounts[nft.object_type] = (typeCounts[nft.object_type] || 0) + 1;
      });
      console.log(`\nNFTs by type:`);
      Object.entries(typeCounts).forEach(([type, count]) => {
        console.log(`  ${type}: ${count}`);
      });

      // Analyze decoded fields (if available)
      const nftsWithFields = allNfts.filter(nft =>
        nft.decoded_fields && Object.keys(nft.decoded_fields).length > 0
      );
      console.log(`\nNFTs with decoded fields: ${nftsWithFields.length}`);

      if (nftsWithFields.length > 0) {
        console.log('\nSample decoded fields:');
        const sampleNft = nftsWithFields[0];
        Object.entries(sampleNft.decoded_fields).slice(0, 5).forEach(([key, value]) => {
          console.log(`  ${key}: ${JSON.stringify(value)}`);
        });
      }
    }

    // Get collection holders
    console.log('\n=== Collection Holders ===');
    const holdersResponse = await client.getCollectionHolders({
      type: collectionType,
      page: 1,
      per_page: 100,
    });

    console.log(`Total holders: ${holdersResponse.total}`);
    console.log(`\nTop 10 holders:`);
    holdersResponse.holders.slice(0, 10).forEach((holder, index) => {
      console.log(`  ${index + 1}. ${holder.address}: ${holder.count} NFTs`);
    });

    // Example: Filter NFTs by fields
    console.log('\n=== Filtering NFTs by Fields ===');
    try {
      const filteredNfts = await client.getNFTsForCollection({
        type: collectionType,
        fields: {
          // Example: filter by rarity if the collection has this field
          // rarity: 'legendary',
        },
        page: 1,
        per_page: 10,
      });
      console.log(`Found ${filteredNfts.items.length} NFTs matching filter criteria`);
    } catch (error) {
      console.log('Field filtering not available or collection not found');
    }

  } catch (error) {
    if (error instanceof Error && error.message.includes('404')) {
      console.error(`Collection ${collectionType} not found. Please replace with a valid collection type.`);
    } else {
      console.error('Error:', error instanceof Error ? error.message : error);
    }
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

