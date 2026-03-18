import { useState, useEffect } from 'react';
import { FileText, Download, Loader2, AlertCircle, RefreshCw, ZoomIn, ZoomOut, ChevronLeft, ChevronRight } from 'lucide-react';

const PDFViewer = ({ fileUrl, fileType, fileName, originalFileUrl, originalFileType }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    setLoading(true);
    setError(false);
  }, [fileUrl]);

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    setLoading(true);
    setError(false);
  };

  if (!fileUrl) {
    return (
      <div className="h-full flex items-center justify-center bg-dark-800 rounded-xl">
        <p className="text-gray-500">No document available</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-dark-800 rounded-xl overflow-hidden">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-dark-800 z-10">
          <Loader2 className="animate-spin text-violet-500" size={48} />
        </div>
      )}
      {error ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <AlertCircle size={48} className="text-red-400 mb-4" />
          <h3 className="font-semibold text-lg mb-2">Unable to load document</h3>
          <p className="text-gray-400 mb-6">
            The file could not be loaded. This may happen with corrupted or password-protected files.
          </p>
          <div className="flex gap-3">
            <button
              onClick={handleRetry}
              className="flex items-center gap-2 px-4 py-2 bg-dark-700 rounded-xl hover:bg-dark-600 transition-colors"
            >
              <RefreshCw size={16} />
              Retry
            </button>
            {originalFileUrl && (
              <a
                href={originalFileUrl}
                download={fileName || 'document'}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-teal-500 rounded-xl hover:bg-teal-600 transition-colors text-white"
              >
                <Download size={16} />
                Download
              </a>
            )}
          </div>
        </div>
      ) : (
        <>
          <iframe
            key={`pdf-${retryCount}`}
            src={fileUrl}
            className="w-full h-full border-0"
            title={fileName || 'Document'}
            onLoad={() => setLoading(false)}
            onError={() => {
              setLoading(false);
              setError(true);
            }}
            style={{ visibility: loading ? 'hidden' : 'visible' }}
          />
          <div className="p-3 bg-dark-700 border-t border-dark-600 flex items-center justify-between">
            <span className="text-sm text-gray-400">{fileName}</span>
            <a
              href={fileUrl}
              download={fileName || 'document'}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
            >
              <Download size={14} />
              Download
            </a>
          </div>
        </>
      )}
    </div>
  );
};

export default PDFViewer;
