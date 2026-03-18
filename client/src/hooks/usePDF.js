import { useCallback, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import * as mammoth from 'mammoth';

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export const usePDF = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const extractTextFromPDF = useCallback(async (file) => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const numPages = pdf.numPages;
      let fullText = '';

      for (let i = 1; i <= numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map(item => item.str).join(' ');
        fullText += pageText + '\n\n';
      }

      return {
        text: fullText.trim(),
        pageCount: numPages
      };
    } catch (err) {
      console.error('PDF extraction error:', err);
      throw new Error('Failed to extract text from PDF');
    }
  }, []);

  const extractTextFromDocx = useCallback(async (file) => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      return {
        text: result.value.trim(),
        pageCount: Math.ceil(result.value.length / 2000) || 1
      };
    } catch (err) {
      console.error('DOCX extraction error:', err);
      throw new Error('Failed to extract text from Word document');
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

  return { parseDocument, loading, error };
};

export default usePDF;
