const express = require('express');
const cors = require('cors');
const { SpeedTestEngine } = require('@coveragemap/speed-test');

const app = express();
app.use(cors());
app.use(express.json());

// Speedtest endpoint
app.get('/speedtest', async (req, res) => {
  try {
    const results = { latency: null, download: null, upload: null };

    const engine = new SpeedTestEngine({
      application: {
        id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        name: 'KlarNetz',
        version: '1.0.0',
        organization: 'KlarNetz',
        type: 'web',
        website: 'https://klarnetz.com',
      },
      callbacks: {
        onDownloadProgress: (snap) => { results.download = Math.round(snap.speedMbps); },
        onUploadProgress: (snap) => { results.upload = Math.round(snap.speedMbps); },
        onError: (error, stage) => console.error(stage, error.message),
      },
    });

    const result = await engine.run();
    const m = result.results.measurements;

    res.json({
      latency: Math.round(m.latency?.avgMs || 0),
      download: Math.round(m.download?.avgSpeedMbps || results.download || 0),
      upload: Math.round(m.upload?.avgSpeedMbps || results.upload || 0),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Health check
app.get('/', (req, res) => res.send('KlarNetz Speedtest API läuft ✓'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server läuft auf Port ${PORT}`));
