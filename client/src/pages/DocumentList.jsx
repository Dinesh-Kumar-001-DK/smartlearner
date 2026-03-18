import React from 'react';
import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useDropzone } from "react-dropzone";
import { Upload, FileText, Trash2, Clock, ChevronLeft, Loader2 } from 'lucide-react';
import toast from "react-hot-toast";
import { useStudyStore } from "../stores/studyStore";
import usePDF from "../hooks/usePDF";
import GlowCard from "../components/ui/GlowCard";

const DocumentList = () => {
  const navigate = useNavigate();
  const { documents, addDocument, removeDocument } = useStudyStore();
  const { parseDocument, loading } = usePDF();
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const onDrop = useCallback(
    async (acceptedFiles) => {
      const file = acceptedFiles[0];
      if (!file) return;

      const validExtensions = ['.pdf', '.docx'];
      const fileName = file.name.toLowerCase();

      const isValid = validExtensions.some(ext => fileName.endsWith(ext));

      if (!isValid) {
        toast.error("Please upload a PDF or Word (.docx) file");
        return;
      }

      const isDocx = fileName.endsWith('.docx');
      const loadingMessage = isDocx 
        ? "Processing Word document..." 
        : "Extracting text from PDF...";

      const loadingToast = toast.loading(loadingMessage, { duration: Infinity });

      try {
        const result = await parseDocument(file);

        if (!result.text || result.text.length < 50) {
          toast.error("Could not extract enough text. Try a different file.", { id: loadingToast });
          return;
        }

        addDocument({
          name: result.name,
          text: result.text,
          pageCount: result.pageCount,
          url: result.url,
          originalUrl: result.originalUrl,
          fileType: result.fileType,
          originalFileType: result.originalFileType
        });

        toast.success(`"${result.name}" uploaded!`, { id: loadingToast });
      } catch (err) {
        console.error('Upload error:', err);
        
        if (err.message.includes('scanned') || err.message.includes('OCR')) {
          toast.error('This PDF appears to be scanned. OCR is required.', { id: loadingToast });
        } else {
          toast.error(err.message || 'Failed to process document', { id: loadingToast });
        }
      }
    },
    [parseDocument, addDocument],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    maxFiles: 1,
    disabled: loading,
  });

  const handleDelete = (doc) => {
    setDeleteConfirm(doc);
  };

  const confirmDelete = () => {
    if (deleteConfirm) {
      removeDocument(deleteConfirm.id);
      toast.success("Document deleted");
      setDeleteConfirm(null);
    }
  };

  return (
    <div className="min-h-screen bg-dark-900 p-8">
      <div className="max-w-6xl mx-auto">
        <button
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
        >
          <ChevronLeft size={20} />
          <span>Back to Dashboard</span>
        </button>

        <motion.div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-2xl p-12 text-center mb-8 cursor-pointer transition-all ${
            isDragActive
              ? "border-teal-500 bg-teal-500/10"
              : loading
              ? "border-yellow-500 bg-yellow-500/5 cursor-wait"
              : "border-dark-600 hover:border-dark-500 bg-dark-800/50"
          }`}
        >
          <input {...getInputProps()} />
          
          {loading ? (
            <div className="space-y-4">
              <Loader2 className="animate-spin text-teal-400 mx-auto" size={48} />
              <p className="text-teal-400">Extracting text...</p>
            </div>
          ) : (
            <>
              <Upload className={`mx-auto mb-4 ${isDragActive ? "text-teal-400" : "text-gray-500"}`} size={48} />
              <h3 className="font-heading font-semibold text-xl mb-2">
                {isDragActive ? "Drop your document here" : "Upload Document"}
              </h3>
              <p className="text-gray-400">PDF or Word (.docx)</p>
            </>
          )}
        </motion.div>

        {documents.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {documents.map((doc, i) => {
                const IconColor = doc.fileType === 'docx' ? 'teal' : 'violet';
                return (
                  <motion.div
                    key={doc.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <GlowCard glowColor={IconColor} className="p-5 group relative">
                      <button
                        onClick={() => handleDelete(doc)}
                        className="absolute top-3 right-3 p-2 bg-red-500/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/40 z-10"
                      >
                        <Trash2 size={16} className="text-red-400" />
                      </button>

                      <button
                        onClick={() => navigate(`/documents/${doc.id}`)}
                        className="w-full text-left"
                      >
                        <div className={`w-12 h-12 bg-${IconColor}-500/20 rounded-xl flex items-center justify-center mb-4`}>
                          <FileText size={24} className={`text-${IconColor}-400`} />
                        </div>
                        <h3 className="font-semibold mb-2 truncate pr-8">{doc.name}</h3>
                        <p className="text-gray-400 text-sm mb-3">{doc.pageCount} pages</p>
                        <div className="flex items-center justify-between text-gray-500 text-sm">
                          <div className="flex items-center gap-2">
                            <Clock size={14} />
                            {new Date(doc.createdAt).toLocaleDateString()}
                          </div>
                          <span className={`text-xs px-2 py-1 rounded ${doc.text && doc.text.length > 100 ? 'bg-teal-500/20 text-teal-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                            {doc.text && doc.text.length > 100 ? 'Ready' : 'Limited'}
                          </span>
                        </div>
                      </button>
                    </GlowCard>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}

        {documents.length === 0 && !loading && (
          <div className="text-center py-16">
            <FileText size={64} className="mx-auto mb-4 text-gray-600" />
            <p className="text-gray-500">No documents yet. Upload your first file!</p>
          </div>
        )}
      </div>

      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-dark-800 rounded-2xl p-6 max-w-sm w-full"
          >
            <h3 className="font-heading font-semibold text-xl mb-2">Delete Document?</h3>
            <p className="text-gray-400 mb-6">Are you sure you want to delete "{deleteConfirm.name}"?</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-3 bg-dark-700 rounded-xl font-medium hover:bg-dark-600 transition-colors">Cancel</button>
              <button onClick={confirmDelete} className="flex-1 py-3 bg-red-500 rounded-xl font-medium hover:bg-red-600 transition-colors">Delete</button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default DocumentList;
