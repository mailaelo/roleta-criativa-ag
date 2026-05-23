import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));


// Helper to extract Drive Folder ID
function extractFolderId(url: string): string | null {
  // Matches typical Drive folder IDs which are ~33 chars of alphanumeric, dashes, underscores
  const match = url.match(/[-\w]{25,}/);
  return match ? match[0] : null;
}

app.post('/api/drive-files', async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ error: 'Folder URL is required' });
    }

    if (url === 'mock' || url.includes('mock')) {
      return res.json({
        files: [
          {
            id: 'mock-1',
            name: 'Referência de Anatomia.jpg',
            type: 'image',
            url: 'https://picsum.photos/800/600?random=1',
            thumbnail: 'https://picsum.photos/200/150?random=1',
            mimeType: 'image/jpeg'
          },
          {
            id: 'mock-2',
            name: 'Estudo de Cores.jpg',
            type: 'image',
            url: 'https://picsum.photos/800/600?random=2',
            thumbnail: 'https://picsum.photos/200/150?random=2',
            mimeType: 'image/jpeg'
          },
          {
            id: 'mock-3',
            name: 'Perspectiva de Cenário.jpg',
            type: 'image',
            url: 'https://picsum.photos/800/600?random=3',
            thumbnail: 'https://picsum.photos/200/150?random=3',
            mimeType: 'image/jpeg'
          }
        ]
      });
    }

    const folderId = extractFolderId(url);
    if (!folderId) {
      return res.status(400).json({ error: 'Invalid Google Drive Folder URL' });
    }

    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey || apiKey === 'YOUR_GOOGLE_API_KEY') {
      return res.status(500).json({ error: 'Server is missing Google API Key' });
    }

    // Google Drive API files.list endpoint
    const driveApiUrl = `https://www.googleapis.com/drive/v3/files?q='${folderId}'+in+parents+and+(mimeType+contains+'image/'+or+mimeType+contains+'video/')&key=${apiKey}&fields=files(id,name,mimeType,webContentLink,webViewLink,thumbnailLink)&pageSize=1000`;

    const response = await fetch(driveApiUrl);
    const data = await response.json();

    if (!response.ok) {
      console.error('Drive API Error:', data);
      return res.status(response.status).json({ error: 'Failed to fetch files from Google Drive. Ensure the folder is public and the API key is valid.' });
    }

    // Format the response
    const files = data.files.map((file: any) => ({
      id: file.id,
      name: file.name,
      type: file.mimeType.includes('video') ? 'video' : 'image',
      url: `https://www.googleapis.com/drive/v3/files/${file.id}?alt=media&key=${apiKey}`,
      thumbnail: file.thumbnailLink,
      mimeType: file.mimeType
    }));

    res.json({ files });
  } catch (error) {
    console.error('Error in /api/drive-files:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
