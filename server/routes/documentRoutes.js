import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { verifyJWT } from '../middleware/authMiddleware.js';
import libre from 'libreoffice-convert';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads'));
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
    if (allowedTypes.includes(file.mimetype) || 
        file.originalname.endsWith('.pdf') || 
        file.originalname.endsWith('.docx')) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF and Word documents are allowed.'));
    }
  }
});

const convertToPdf = (docxPath) => {
  return new Promise((resolve, reject) => {
    const pdfPath = docxPath.replace('.docx', '.pdf');
    libre.convert(docxPath, '.pdf', undefined, (err, done) => {
      if (err) {
        reject(err);
      } else {
        const inputData = fs.readFileSync(docxPath);
        fs.writeFileSync(pdfPath, inputData);
        resolve(pdfPath);
      }
    });
  });
};

router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const isDocx = req.file.originalname.toLowerCase().endsWith('.docx');
    let fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    let pdfFilename = req.file.filename;
    let originalFileType = isDocx ? 'docx' : 'pdf';

    if (isDocx) {
      try {
        const pdfFilenameNew = req.file.filename.replace('.docx', '.pdf');
        const pdfPath = path.join(__dirname, '../uploads', pdfFilenameNew);
        const originalFileUrl = fileUrl;
        
        await new Promise((resolve, reject) => {
          libre.convert(req.file.path, ['.pdf'], undefined, async (err, done) => {
            if (err) {
              console.error('LibreOffice conversion error:', err);
              reject(err);
            } else {
              try {
                if (done && done.length > 0) {
                  fs.writeFileSync(pdfPath, done[0]);
                  fileUrl = `${req.protocol}://${req.get('host')}/uploads/${pdfFilenameNew}`;
                  pdfFilename = pdfFilenameNew;
                } else {
                  const docxData = fs.readFileSync(req.file.path);
                  fs.writeFileSync(pdfPath, docxData);
                }
                resolve();
              } catch (writeErr) {
                reject(writeErr);
              }
            }
          });
        });
      } catch (convertErr) {
        console.error('PDF conversion failed, will use original docx:', convertErr);
      }
    }

    res.json({
      message: 'File uploaded successfully',
      file: {
        filename: pdfFilename,
        originalName: req.file.originalname,
        url: fileUrl,
        path: path.join(__dirname, '../uploads', pdfFilename),
        size: req.file.size,
        fileType: 'pdf',
        originalFileType
      }
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Upload failed' });
  }
});

router.get('/file/:filename', verifyJWT, (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, '../uploads', filename);
    
    res.sendFile(filePath);
  } catch (error) {
    console.error('File not found:', error);
    res.status(404).json({ message: 'File not found' });
  }
});

router.delete('/file/:filename', verifyJWT, (req, res) => {
  try {
    const filename = req.params.filename;
    const fs = require('fs');
    const filePath = path.join(__dirname, '../uploads', filename);
    
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      res.json({ message: 'File deleted successfully' });
    } else {
      res.status(404).json({ message: 'File not found' });
    }
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ message: 'Delete failed' });
  }
});

export default router;
