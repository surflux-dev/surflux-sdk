/**
 * Basic NFT Client Example
 * 
 * This example demonstrates basic usage of the SurfluxNFTClient
 * to query NFT collections, tokens, and holders.
 */

import { SurfluxNFTClient, SurfluxNetwork } from '../src/index';

async function main() {
  // Initialize the client
  const client = new SurfluxNFTClient({
    apiKey: process.env.SURFLUX_API_KEY || 'your-api-key-here',
    network: SurfluxNetwork.TESTNET,
  });

  try {
    // Example: Get NFT by object ID
    console.log('Fetching NFT by object ID...');
    const objectId = '0x0000000000000000000000000000000000000000000000000000000000000000'; // Replace with actual NFT object ID
    try {
      const nft = await client.getNFTById({ object_id: objectId });
      console.log(`NFT found: ${nft.object_id}`);
      console.log(`  Type: ${nft.object_type}`);
      console.log(`  Owner: ${nft.owner || 'None'}`);
      console.log(`  Checkpoint: ${nft.checkpoint_id}`);
      if (nft.decoded_fields && Object.keys(nft.decoded_fields).length > 0) {
        console.log(`  Fields:`, nft.decoded_fields);
      }
    } catch (error) {
      console.log(`NFT ${objectId} not found (this is expected with placeholder ID)`);
    }

    // Example: Get NFTs for an owner
    console.log('\nFetching NFTs for an address...');
    const ownerAddress = '0x0000000000000000000000000000000000000000000000000000000000000000'; // Replace with actual address
    try {
      const ownerNfts = await client.getNFTsForOwner({
        address: ownerAddress,
        page: 1,
        per_page: 10,
      });
      console.log(`Found ${ownerNfts.items.length} NFTs`);
      console.log(`  Current page: ${ownerNfts.currentPage}`);
      console.log(`  Per page: ${ownerNfts.perPage}`);
      console.log(`  Is last page: ${ownerNfts.isLastPage}`);

      if (ownerNfts.items.length > 0) {
        const firstNft = ownerNfts.items[0];
        console.log(`\nFirst NFT:`);
        console.log(`  Object ID: ${firstNft.object_id}`);
        console.log(`  Type: ${firstNft.object_type}`);
      }
    } catch (error) {
      console.log(`No NFTs found for address ${ownerAddress} (this is expected with placeholder address)`);
    }

    // Example: Get NFTs for a collection
    console.log('\nFetching NFTs for a collection...');
    const collectionType = '0x0000000000000000000000000000000000000000000000000000000000000000::test::NFT'; // Replace with actual collection type
    try {
      const collectionNfts = await client.getNFTsForCollection({
        type: collectionType,
        page: 1,
        per_page: 10,
      });
      console.log(`Found ${collectionNfts.items.length} NFTs in collection`);
      console.log(`  Current page: ${collectionNfts.currentPage}`);
      console.log(`  Per page: ${collectionNfts.perPage}`);
      console.log(`  Is last page: ${collectionNfts.isLastPage}`);

      if (collectionNfts.items.length > 0) {
        const firstNft = collectionNfts.items[0];
        console.log(`\nFirst NFT:`);
        console.log(`  Object ID: ${firstNft.object_id}`);
        console.log(`  Owner: ${firstNft.owner || 'None'}`);
      }
    } catch (error) {
      console.log(`Collection ${collectionType} not found (this is expected with placeholder type)`);
    }

    // Example: Get collection holders
    console.log('\nFetching collection holders...');
    try {
      const holders = await client.getCollectionHolders({
        type: collectionType,
        page: 1,
        per_page: 50,
      });
      console.log(`Found ${holders.holders.length} holders`);
      console.log(`  Total holders: ${holders.total}`);
      console.log(`  Current page: ${holders.page}`);
      console.log(`  Per page: ${holders.per_page}`);

      if (holders.holders.length > 0) {
        const topHolder = holders.holders[0];
        console.log(`\nTop holder:`);
        console.log(`  Address: ${topHolder.address}`);
        console.log(`  NFT count: ${topHolder.count}`);
      }
    } catch (error) {
      console.log(`Collection holders not found (this is expected with placeholder type)`);
    }
  } catch (error) {
    console.error('Error:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

// Run the example
if (require.main === module) {
  main();
}

