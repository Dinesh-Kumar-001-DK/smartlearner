import { useCallback, useState } from 'react';
import * as mammoth from 'mammoth';
import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.worker.min.js`;

export const usePDF = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const extractTextFromPDF = useCallback(async (file) => {
    try {
      setLoading(true);
      setError(null);
      
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ 
        data: new Uint8Array(arrayBuffer),
        useSystemFonts: true,
      }).promise;
      
      const numPages = pdf.numPages;
      let fullText = '';

      for (let pageNum = 1; pageNum <= numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map(item => item.str).join(' ');
        fullText += pageText + '\n\n';
      }

      const extractedText = fullText.trim();

      if (!extractedText || extractedText.length < 50) {
        throw new Error('SCANNED_PDF');
      }

      return {
        text: extractedText,
        pageCount: numPages
      };
    } catch (err) {
      console.error('PDF extraction error:', err);
      if (err.message === 'SCANNED_PDF') {
        throw new Error('This PDF appears to be scanned. OCR technology is required to extract text.');
      }
      throw new Error('Failed to extract text from PDF. The file may be corrupted or password-protected.');
    } finally {
      setLoading(false);
    }
  }, []);

  const extractTextFromDocx = useCallback(async (file) => {
    try {
      setLoading(true);
      setError(null);
      
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      
      const extractedText = result.value.trim();

      if (!extractedText || extractedText.length < 50) {
        throw new Error('EMPTY_DOCX');
      }

      return {
        text: extractedText,
        pageCount: Math.ceil(extractedText.length / 2000) || 1
      };
    } catch (err) {
      console.error('DOCX extraction error:', err);
      if (err.message === 'EMPTY_DOCX') {
        throw new Error('This Word document appears to be empty or contains no extractable text.');
      }
      throw new Error('Failed to extract text from Word document.');
    } finally {
      setLoading(false);
    }
  }, []);

  const parseDocument = useCallback(async (file) => {
    setLoading(true);
    setError(null);

    try {
      const fileName = file.name.toLowerCase();
      const isDocx = fileName.endsWith('.docx');
      const isPdf = fileName.endsWith('.pdf');

      if (!isPdf && !isDocx) {
        throw new Error('Please upload a PDF or Word (.docx) file');
      }

      let result;
      if (isDocx) {
        result = await extractTextFromDocx(file);
      } else {
        result = await extractTextFromPDF(file);
      }

      const blobUrl = URL.createObjectURL(file);

      return {
        name: file.name,
        text: result.text,
        pageCount: result.pageCount,
        url: blobUrl,
        originalUrl: blobUrl,
        fileType: isDocx ? 'docx' : 'pdf',
        originalFileType: isDocx ? 'docx' : 'pdf',
        file: file
      };
    } catch (err) {
      console.error('Document parsing error:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [extractTextFromPDF, extractTextFromDocx]);

  return { parseDocument, loading, error, setError };
};

export default usePDF;
