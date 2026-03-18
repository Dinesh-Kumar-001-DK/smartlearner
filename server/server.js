import express from 'express';
import multer from 'multer';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';
import authRoutes from './routes/authRoutes.js';
import geminiProxy from './routes/geminiProxy.js';
import documentRoutes from './routes/documentRoutes.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors({
  origin: [process.env.CLIENT_URL, 'http://localhost:5173', 'http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002', 'http://localhost:3003', 'http://localhost:3004'],
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, 'uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, uniqueSuffix + ext);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF and Word documents are allowed.'));
    }
  }
});

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error('MongoDB Error:', err));

app.use('/auth', authRoutes);
app.use('/api/gemini', geminiProxy);
app.use('/api/documents', documentRoutes);

app.post('/api/convert', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const inputPath = req.file.path;
  const outputPath = path.join(__dirname, 'uploads', `${path.parse(req.file.filename).name}.pdf`);

  try {
    const libreOfficePath = process.env.LIBREOFFICE_PATH || 'soffice';
    
    const result = await new Promise((resolve, reject) => {
      const proc = spawn(libreOfficePath, [
        '--headless',
        '--convert-to',
        'pdf',
        '--outdir',
        path.join(__dirname, 'uploads'),
        inputPath
      ], { shell: true });

      let stderr = '';
      proc.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      proc.on('close', (code) => {
        if (code === 0) {
          const expectedPdf = path.join(__dirname, 'uploads', `${path.parse(req.file.filename).name}.pdf`);
          resolve(expectedPdf);
        } else {
          reject(new Error(stderr || 'Conversion failed'));
        }
      });

      proc.on('error', (err) => {
        reject(err);
      });
    });

    const fs = await import('fs');
    const pdfBuffer = fs.readFileSync(result);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=converted.pdf');
    res.send(pdfBuffer);

    fs.unlink(inputPath, () => {});
    fs.unlink(result, () => {});
  } catch (error) {
    console.error('Conversion error:', error);
    res.status(500).json({ error: 'Conversion failed' });
  }
});

app.get('/', (req, res) => {
  res.json({ message: 'AI Learn API Running', status: 'ok' });
});

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
