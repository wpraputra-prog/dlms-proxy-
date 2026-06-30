const express = require('express');
const cors = require('cors');
const ytdl = require('@distube/ytdl-core');

const app = express();

// Mengizinkan web HTML Anda mengakses server ini dari mana saja
app.use(cors());

app.get('/api/stream', async (req, res) => {
    try {
        const ytUrl = req.query.url;
        if (!ytUrl) {
            return res.status(400).json({ error: 'URL YouTube wajib diisi' });
        }

        res.setHeader('Content-Type', 'audio/mpeg');
        res.setHeader('Transfer-Encoding', 'chunked');

        const stream = ytdl(ytUrl, {
            filter: 'audioonly',
            quality: 'highestaudio',
            highWaterMark: 1 << 25
        });

        stream.on('error', (err) => {
            console.error('Stream Error:', err.message);
            if (!res.headersSent) res.status(500).send('Gagal streaming audio YouTube');
        });

        stream.pipe(res);

    } catch (error) {
        console.error('Server Error:', error.message);
        if (!res.headersSent) res.status(500).json({ error: 'Terjadi kesalahan server proxy' });
    }
});

// Menggunakan PORT dari server cloud, atau 3000 jika lokal
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Proxy YouTube Aktif di port ${PORT}`);
});