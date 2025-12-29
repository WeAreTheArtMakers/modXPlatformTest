import React from 'react';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle
} from './ui/card';
import { Button } from './ui/button';
import {
  Dialog,
  DialogTrigger,
  DialogPortal,
  DialogOverlay,
  DialogContent,
  DialogHeader,
  DialogTitle
} from './ui/dialog';

interface NFTCardProps {
  tokenId: number;
  image: string;
  license: string;
  history: { license: string; timestamp: number }[];
  downloadUrl: string;
  onBurn: (tokenId: number) => void;
  onTransfer: (tokenId: number) => void;
}

export const NFTCard: React.FC<NFTCardProps> = ({
  tokenId,
  image,
  license,
  history,
  downloadUrl,
  onBurn,
  onTransfer,
}) => {
  // Determine if asset is image; otherwise use fallback cover
  const ext = image.split('?')[0].split('.').pop()?.toLowerCase();
  const isImage = ext && ['png','jpg','jpeg','gif'].includes(ext);
  const cover = isImage
    ? image
    : 'https://modfxmarket.com/nft/modXNFTmusic.png';

  return (
    <Card className="backdrop-blur-lg bg-black/20 border border-cyan-400/30 rounded-2xl overflow-hidden shadow-lg hover:shadow-[0_0_20px_rgba(0,150,255,0.7)] transition-all">
      <CardHeader className="bg-transparent p-3">
        <CardTitle className="flex items-baseline text-white">
          <span className="opacity-70 text-sm font-light uppercase mr-2">Token</span>
          <span className="text-lg font-extrabold">#{tokenId}</span>
        </CardTitle>
      </CardHeader>

      {/* FULLSCREEN PREVIEW DIALOG */}
      <Dialog>
        <DialogTrigger asChild>
          <div className="cursor-pointer p-0">
            <img
              src={cover}
              alt={`NFT ${tokenId}`}
              className="w-full h-48 object-cover border-t border-b border-purple-700/40"
            />
          </div>
        </DialogTrigger>
        <DialogPortal>
          <DialogOverlay className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100]" />
          <DialogContent className="
            fixed top-1/2 left-1/2
            transform -translate-x-1/2 -translate-y-1/2
            z-[110] p-4
            bg-black/30 backdrop-blur-lg
            rounded-lg shadow-lg
            max-w-[90vw] max-h-[90vh]
            overflow-auto
          ">
            {isImage ? (
              <img
                src={image}
                alt={`NFT full ${tokenId}`}
                className="max-w-full max-h-full object-contain rounded-md shadow-[0_0_20px_rgba(255,255,255,0.3)]"
              />
            ) : (
              <div className="flex flex-col items-center justify-center space-y-4">
                <div className="text-white mb-2">▶️ Audio Preview</div>
                <audio
                  src={image}
                  controls
                  autoPlay
                  className="w-full rounded-md bg-black/50 backdrop-blur-md p-2 shadow-[0_0_20px_rgba(0,255,255,0.5)]"
                />
              </div>
            )}
          </DialogContent>
        </DialogPortal>
      </Dialog>

      <CardContent className="px-4 pt-4 pb-2 bg-black/30 backdrop-blur-sm">
        <p className="text-gray-200 text-sm">
          <strong>License:</strong> {license}
        </p>
      </CardContent>

      <CardFooter className="
        flex flex-wrap justify-end gap-3
        px-6 pb-6 pt-4
        bg-black/30 backdrop-blur-sm
        rounded-b-2xl
      ">
        {/* History */}
        <Dialog>
          <DialogTrigger asChild>
            <Button className="
              bg-cyan-600/20 hover:bg-cyan-600/40
              ring-1 ring-cyan-600/50
              text-white text-xs font-medium
              h-8 px-3 rounded-md
              transition-transform duration-200
              hover:-translate-y-1
            ">
              History
            </Button>
          </DialogTrigger>
          <DialogPortal>
            <DialogOverlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]" />
            <DialogContent className="
              fixed top-1/2 left-1/2
              transform -translate-x-1/2 -translate-y-1/2
              z-[110]
              w-[90vw] max-w-md max-h-[80vh]
              overflow-auto
              bg-gray-900 rounded-lg p-6
              backdrop-blur-lg shadow-lg
            ">
              <DialogHeader>
                <DialogTitle className="text-white">License History</DialogTitle>
              </DialogHeader>
              <ul className="mt-4 space-y-3">
                {history && history.length > 0 ? (
                  history.map((e, i) => {
                    const rawTs = e.timestamp;
                    const tsNumber = typeof rawTs === 'bigint' ? Number(rawTs) : rawTs;
                    const dateString = new Date(tsNumber * 1000).toLocaleString();
                    return (
                      <li key={i} className="
                        p-3 bg-gray-800 rounded-md
                        hover:bg-gray-700 transition
                      ">
                        <p className="text-gray-200"><strong>License:</strong> {e.license}</p>
                        <p className="text-gray-400 text-xs mt-1"><strong>When:</strong> {dateString}</p>
                      </li>
                    );
                  })
                ) : (
                  <p className="text-gray-500 text-center">No history yet.</p>
                )}
              </ul>
            </DialogContent>
          </DialogPortal>
        </Dialog>

        {/* Send */}
        <Button
          onClick={() => onTransfer(tokenId)}
          className="
            bg-cyan-600/20 hover:bg-cyan-600/40
            ring-1 ring-cyan-600/50
            text-white text-xs font-medium
            h-8 px-3 rounded-md
            transition-transform duration-200
            hover:-translate-y-1
          "
        >
          Send
        </Button>

        {/* Download */}
        {downloadUrl && (
          <a href={downloadUrl} download>
            <Button className="
              bg-cyan-600/20 hover:bg-cyan-600/40
              ring-1 ring-cyan-600/50
              text-white text-xs font-medium
              h-8 px-3 rounded-md
              transition-transform duration-200
              hover:-translate-y-1
            ">
              Download
            </Button>
          </a>
        )}

        {/* Delete */}
        <Button
          variant="destructive"
          onClick={() => onBurn(tokenId)}
          className="
            bg-red-600/20 hover:bg-red-600/40
            ring-1 ring-red-600/50
            text-white text-xs font-medium
            h-8 px-3 rounded-md
            transition-transform duration-200
            hover:-translate-y-1
          "
        >
          Delete
        </Button>
      </CardFooter>
    </Card>
  );
};
