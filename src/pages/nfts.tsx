import React, { useState, useEffect, useCallback } from 'react';
import { useWeb3 } from '@/context/Web3Context';
import { useLicensedNFT, NFTMetadata } from '../hooks/useLicensedNFT';
import { logger } from '@/lib/logger';
import { uploadToServer } from '../lib/uploadToServer';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import { Input } from '../components/ui/input';
import { NFTCard } from '../components/NFTCard';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

const NFTDashboard: React.FC = () => {
  const { account } = useWeb3();
  const { isReady, mintNFT, burnNFT, transferNFT, listOwnedNFTs } = useLicensedNFT();
  const [nfts, setNfts] = useState<NFTMetadata[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [license, setLicense] = useState('');
  const [isMinting, setIsMinting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [showTransferModal, setShowTransferModal] = useState(false);
  const [selectedToken, setSelectedToken] = useState<number | null>(null);
  const [transferAddress, setTransferAddress] = useState('');
  const [isTransferring, setIsTransferring] = useState(false);

  const load = useCallback(async () => {
    if (!account) return;
    setIsLoading(true);
    setError(null);
    try {
      const items = await listOwnedNFTs();
      setNfts(items);
    } catch (e) {
      logger.error(e);
      setError("Failed to load NFTs.");
    } finally {
      setIsLoading(false);
    }
  }, [listOwnedNFTs, account]);

  useEffect(() => {
    if (isReady) {
      load();
    }
  }, [isReady, load]);

  const handleMint = async () => {
    if (!file || !license) {
      setError("Please select a file and enter a license.");
      return;
    }
    if (!account) {
      setError("Please connect your wallet before minting.");
      return;
    }
    setIsMinting(true);
    setError(null);
    setSuccess(null);
    try {
      const mintedTokenId = await mintNFT("", license);
      const uploadRes = await uploadToServer(
        file,
        license,
        mintedTokenId,
        account
      );
      logger.log("Upload successful:", uploadRes);
      setSuccess(`Mint successful! Token #${mintedTokenId}`);
      await load();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Mint or upload failed";
      setError(errorMessage);
    } finally {
      setIsMinting(false);
    }
  };

  const handleBurn = async (tokenId: number) => {
    if (!confirm(`Burn NFT #${tokenId}?`)) return;
    setIsLoading(true);
    try {
      await burnNFT(tokenId);
      setNfts((prev) => prev.filter((n) => n.tokenId !== tokenId));
    } catch (e) {
      logger.error(e);
      setError('Burn failed');
    } finally {
      setIsLoading(false);
    }
  };

  const openTransferModal = (tokenId: number) => {
    setSelectedToken(tokenId);
    setShowTransferModal(true);
  };

  const doTransfer = async () => {
    if (selectedToken == null || !transferAddress) return;
    setIsTransferring(true);
    try {
      await transferNFT(selectedToken, transferAddress);
      setNfts((prev) => prev.filter((n) => n.tokenId !== selectedToken));
      setShowTransferModal(false);
      setTransferAddress('');
      setSelectedToken(null);
    } catch (e) {
      logger.error(e);
      setError('Transfer failed');
    } finally {
      setIsTransferring(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Header />
      <main className="pt-24 pb-16 container mx-auto px-4">
        {/* Mint Form */}
        <Card className="mb-8 bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-xl">Mint New NFT</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <Input type="file" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
              <Textarea
                placeholder="Enter license info..."
                value={license}
                onChange={(e) => setLicense(e.target.value)}
              />
              <Button
                onClick={handleMint}
                disabled={isMinting || !isReady}
                className="bg-gradient-to-r from-blue-400 to-purple-600 text-white shadow-[0_0_8px_rgba(0,255,255,0.7)] hover:scale-105 transform transition"
              >
                {isMinting ? 'Minting...' : 'Mint NFT'}
              </Button>
              {error && <p className="text-red-500">{error}</p>}
              {success && <p className="text-green-400">{success}</p>}
            </div>
          </CardContent>
        </Card>

        {/* NFT Grid */}
        <h2 className="text-3xl font-bold mb-6">Your NFTs</h2>
        {isLoading ? (
          <p>Loading...</p>
        ) : nfts.length === 0 ? (
          <p>No NFTs found</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {nfts.map((nft) => (
              <NFTCard
                key={nft.tokenId}
                tokenId={nft.tokenId}
                image={nft.image}
                license={nft.license}
                history={nft.history ?? []}
                downloadUrl={nft.downloadUrl}
                onBurn={handleBurn}
                onTransfer={openTransferModal}
              />
            ))}
          </div>
        )}
      </main>
      <Footer />

      {/* Transfer Modal */}
      <Dialog open={showTransferModal} onOpenChange={setShowTransferModal}>
        <DialogContent className="bg-gray-800 text-white rounded-lg p-6">
          <DialogHeader>
            <DialogTitle>Send NFT #{selectedToken}</DialogTitle>
          </DialogHeader>
          <Input
            placeholder="Recipient Address"
            value={transferAddress}
            onChange={(e) => setTransferAddress(e.target.value)}
            className="mt-4"
          />
          <DialogFooter className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowTransferModal(false)}>
              Cancel
            </Button>
            <Button
              onClick={doTransfer}
              disabled={isTransferring || !transferAddress}
              className="bg-gradient-to-r from-green-400 to-teal-500 text-white"
            >
              {isTransferring ? 'Sending...' : 'Send'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default NFTDashboard;
