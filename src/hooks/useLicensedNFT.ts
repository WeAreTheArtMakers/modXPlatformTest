import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import contractAbi from '../../conracts/modXLicensedNFT.json';
import { useWeb3 } from '../context/Web3Context';
import { logger } from '@/lib/logger';

const NFT_ADDRESS = import.meta.env.VITE_MODX_NFT_ADDRESS;

export interface NFTMetadata {
  tokenId: number;
  image: string;
  license: string;
  downloadUrl: string;
  history?: { license: string; timestamp: number }[];
}

interface MetadataFileInfo {
  filename: string;
  owner: string;
}

interface NFTMetadataResponse {
  image: string;
  license: string;
  download_url?: string;
}

export function useLicensedNFT() {
  const { signer, account } = useWeb3();
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (signer && NFT_ADDRESS) {
      try {
        const contractInstance = new ethers.Contract(NFT_ADDRESS, contractAbi, signer);
        setContract(contractInstance);
      } catch (error) {
        logger.error("Failed to create contract instance:", error);
        setContract(null);
      }
    } else {
      setContract(null);
    }
  }, [signer]);

  useEffect(() => {
    setIsReady(!!contract && !!account);
  }, [contract, account]);

  const mintNFT = useCallback(async (uri: string, license: string): Promise<number> => {
    if (!contract || !account) throw new Error('Not initialized');
    try {
      const tx = await contract.mintNFT(uri, license);
      const receipt = await tx.wait();
      logger.log('Mint receipt logs:', receipt.logs);

      const parsed = receipt.logs
        .map((log: ethers.Log) => {
          try { return contract.interface.parseLog(log); }
          catch { return null; }
        })
        .find((evt: ethers.LogDescription | null) => evt && evt.name === 'Transfer');
      
      if (!parsed) {
        logger.error('Parsed events:', receipt.logs);
        throw new Error('Transfer event not found');
      }

      const raw = parsed.args.tokenId ?? parsed.args[2];
      const tokenId = typeof raw === 'bigint' ? Number(raw) : Number(raw);
      logger.log('Minted tokenId:', tokenId);
      return tokenId;
    } catch (err: unknown) {
      logger.error('mintNFT error:', err);
      const errorMessage = err instanceof Error ? err.message : String(err);
      throw new Error(`Mint failed: ${errorMessage}`);
    }
  }, [contract, account]);

  const burnNFT = useCallback(async (tokenId: number) => {
    if (!contract || !account) throw new Error('Not initialized');
    const tx = await contract.burn(tokenId);
    await tx.wait();
    return tokenId;
  }, [contract, account]);

  const transferNFT = useCallback(async (tokenId: number, to: string) => {
    if (!contract || !account) throw new Error('Not initialized');
    const tx = await contract.safeTransferFrom(account, to, tokenId);
    await tx.wait();
    return to;
  }, [contract, account]);

  const currentLicense = useCallback(async (tokenId: number) => {
    if (!contract) throw new Error('Not initialized');
    return await contract.currentLicense(tokenId);
  }, [contract]);

  const getLicenseHistory = useCallback(async (tokenId: number) => {
    if (!contract) throw new Error('Not initialized');
    return await contract.getLicenseHistory(tokenId);
  }, [contract]);

  const listOwnedNFTs = useCallback(async (): Promise<NFTMetadata[]> => {
    if (!contract || !account) return [];
    
    const nfts: NFTMetadata[] = [];
    try {
      const allFiles: MetadataFileInfo[] = await fetch('https://modfxmarket.com/api/list-metadata.php')
                         .then(r => r.json());

      for (const fileInfo of allFiles) {
        const tokenId = Number(fileInfo.filename.match(/^meta_(\d+)\.json$/)?.[1] || 0);
        if (tokenId === 0) continue;

        try {
          const onChainOwner = await contract.ownerOf(tokenId);
          
          if (onChainOwner.toLowerCase() === account.toLowerCase()) {
            const url = `https://modfxmarket.com/nft/metadata/${fileInfo.filename}`;
            const res = await fetch(url);

            if (!res.ok) {
              logger.warn(`Failed to fetch metadata for owned token ${tokenId}: ${res.statusText}`);
              continue;
            }

            const meta: NFTMetadataResponse = await res.json();
            const history = await getLicenseHistory(tokenId);

            nfts.push({
              tokenId,
              image: meta.image,
              license: meta.license,
              downloadUrl: meta.download_url || meta.image,
              history: history,
            });
          }
        } catch {
          logger.log(`Could not verify owner for token ${tokenId}, it may have been burned or still processing.`);
        }
      }
    } catch (err) {
      logger.error('Error fetching metadata file list:', err);
    }
    return nfts;
  }, [contract, account, getLicenseHistory]);

  useEffect(() => {
    setIsReady(!!contract && !!account);
  }, [contract, account]);

  return {
    isReady,
    mintNFT,
    burnNFT,
    transferNFT,
    currentLicense,
    getLicenseHistory,
    listOwnedNFTs,
    account,
  };
}
