import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Enable CORS for all routes
app.use(cors());

// Serve static files from the src directory
app.use(express.static(path.join(__dirname, 'src')));

// Proxy route for images
app.get('/proxy-image', async (req, res) => {
    try {
        const imageUrl = req.query.url;
        if (!imageUrl) {
            return res.status(400).send('No URL provided');
        }

        const response = await fetch(imageUrl);
        if (!response.ok) {
            return res.status(response.status).send('Failed to fetch image');
        }

        // Forward the content type
        res.set('Content-Type', response.headers.get('content-type'));
        
        // Pipe the image data directly to the response
        response.body.pipe(res);
    } catch (error) {
        console.error('Proxy error:', error);
        res.status(500).send('Error fetching image');
    }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Proxy server running on http://localhost:${PORT}`);
});
