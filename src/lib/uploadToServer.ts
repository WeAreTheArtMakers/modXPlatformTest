import { logger } from './logger';

export async function uploadToServer(
  file: File,
  license: string,
  tokenId: number,
  owner: string
): Promise<{ metadataUrl: string; mediaUrl: string }> {
  if (!owner) {
    throw new Error('Owner address is required for upload');
  }
  const form = new FormData();
  form.append('file', file);
  form.append('license', license);
  form.append('tokenId', tokenId.toString());
  form.append('owner', owner.toLowerCase());

  const response = await fetch('https://modfxmarket.com/api/upload-nft.php', {
    method: 'POST',
    body: form
  });

  const text = await response.text();
  if (!response.ok) {
    throw new Error(`Upload failed (${response.status} ${response.statusText}): ${text}`);
  }

  const data = JSON.parse(text);
  logger.log('uploadToServer response:', data);
  return {
    metadataUrl: data.metadataUrl,
    mediaUrl: data.mediaUrl
  };
}
