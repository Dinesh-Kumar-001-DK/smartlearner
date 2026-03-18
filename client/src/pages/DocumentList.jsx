import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useDropzone } from "react-dropzone";
import { Upload, FileText, Trash2, Clock, ChevronLeft } from "lucide-react";
import toast from "react-hot-toast";
import { useStudyStore } from "../stores/studyStore";
import usePDF from "../hooks/usePDF";
import GlowCard from "../components/ui/GlowCard";

const DocumentList = () => {
  const navigate = useNavigate();
  const { documents, addDocument, removeDocument } = useStudyStore();
  const { parseDocument, loading: parseLoading } = usePDF();
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

      const loadingToast = toast.loading(loadingMessage);

      try {
        const result = await parseDocument(file);

        if (!result.text || result.text.length < 10) {
          toast.error("Could not extract text from document. Try a different file.", { id: loadingToast });
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

        const successMessage = `"${result.name}" uploaded successfully!`;
        toast.success(successMessage, { id: loadingToast });
      } catch (err) {
        toast.error("Failed to process: " + err.message, { id: loadingToast });
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
    disabled: parseLoading,
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
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-4 mb-8"
        >
          <button
            onClick={() => navigate("/dashboard")}
            className="p-2 hover:bg-dark-700 rounded-lg transition-colors"
          >
            <ChevronLeft size={24} />
          </button>
          <h1 className="font-heading font-bold text-3xl">My Documents</h1>
        </motion.div>

        <motion.div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-2xl p-12 text-center mb-8 cursor-pointer transition-all ${
            isDragActive
              ? "border-teal-500 bg-teal-500/10"
              : "border-dark-600 hover:border-dark-500 bg-dark-800/50"
          }`}
          whileHover={{ scale: 1.01 }}
        >
          <input {...getInputProps()} />
          <Upload
            className={`mx-auto mb-4 ${isDragActive ? "text-teal-400" : "text-gray-500"}`}
            size={48}
          />
          <h3 className="font-heading font-semibold text-xl mb-2">
            {isDragActive ? "Drop your document here" : "Upload a Document"}
          </h3>
          <p className="text-gray-400">
            Drag & drop or click to upload a PDF or Word (.docx) file
          </p>
          <p className="text-gray-500 text-sm mt-2">
            Files are processed locally - your documents stay private
          </p>
          {parseLoading && <p className="text-teal-400 mt-4">Processing...</p>}
        </motion.div>

        {documents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {documents.map((doc, i) => (
                <motion.div
                  key={doc.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <GlowCard glowColor={doc.fileType === 'docx' ? 'teal' : 'violet'} className="p-5 group relative">
                    <button
                      onClick={() => handleDelete(doc)}
                      className="absolute top-3 right-3 p-2 bg-red-500/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/40"
                    >
                      <Trash2 size={16} className="text-red-400" />
                    </button>

                    <button
                      onClick={() => navigate(`/documents/${doc.id}`)}
                      className="w-full text-left"
                    >
                      <div className={`w-12 h-12 ${doc.fileType === 'docx' ? 'bg-teal-500/20' : 'bg-violet-500/20'} rounded-xl flex items-center justify-center mb-4`}>
                        <FileText className={doc.fileType === 'docx' ? 'text-teal-400' : 'text-violet-400'} size={24} />
                      </div>
                      <h3 className="font-semibold mb-2 truncate pr-8">
                        {doc.name}
                      </h3>
                      <p className="text-gray-400 text-sm mb-3">
                        {doc.pageCount} pages • {doc.text?.length || 0} chars
                      </p>
                      <div className="flex items-center gap-2 text-gray-500 text-sm">
                        <Clock size={14} />
                        {new Date(doc.createdAt).toLocaleDateString()}
                      </div>
                    </button>
                  </GlowCard>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="text-center py-16 text-gray-500">
            <FileText size={64} className="mx-auto mb-4 opacity-30" />
            <p>No documents yet. Upload your first PDF or Word file to get started!</p>
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
            <h3 className="font-heading font-semibold text-xl mb-2">
              Delete Document?
            </h3>
            <p className="text-gray-400 mb-6">
              Are you sure you want to delete "{deleteConfirm.name}"? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-3 bg-dark-700 rounded-xl font-medium hover:bg-dark-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 py-3 bg-red-500 rounded-xl font-medium hover:bg-red-600 transition-colors"
              >
                Delete
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default DocumentList;
