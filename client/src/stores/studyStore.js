import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useStudyStore = create(
  persist(
    (set, get) => ({
      documents: [],
      flashcards: [],
      quizzes: [],
      chats: {},
      summaries: {},

      addDocument: (doc) => set((state) => ({
        documents: [...state.documents, {
          id: Date.now().toString(),
          name: doc.name,
          text: doc.text,
          pageCount: doc.pageCount || 0,
          url: doc.url,
          originalUrl: doc.originalUrl,
          filename: doc.filename,
          fileType: doc.fileType || 'pdf',
          originalFileType: doc.originalFileType,
          createdAt: new Date().toISOString()
        }]
      })),

      removeDocument: (id) => set((state) => ({
        documents: state.documents.filter(d => d.id !== id),
        chats: Object.fromEntries(
          Object.entries(state.chats).filter(([key]) => !key.startsWith(id))
        )
      })),

      setSummary: (docId, summary) => set((state) => ({
        summaries: { ...state.summaries, [docId]: summary }
      })),

      addFlashcards: (docId, cards) => set((state) => ({
        flashcards: [
          ...state.flashcards.filter(f => f.docId !== docId),
          ...cards.map(c => ({
            ...c,
            id: Date.now().toString() + Math.random(),
            docId,
            favorite: false,
            createdAt: new Date().toISOString()
          }))
        ]
      })),

      toggleFavorite: (cardId) => set((state) => ({
        flashcards: state.flashcards.map(f =>
          f.id === cardId ? { ...f, favorite: !f.favorite } : f
        )
      })),

      addMessage: (docId, message) => set((state) => {
        const chat = state.chats[docId] || [];
        return {
          chats: {
            ...state.chats,
            [docId]: [...chat, { ...message, id: Date.now().toString() }]
          }
        };
      }),

      saveQuiz: (docId, questions) => set((state) => ({
        quizzes: [
          ...state.quizzes.filter(q => q.docId !== docId),
          {
            id: Date.now().toString(),
            docId,
            questions,
            createdAt: new Date().toISOString()
          }
        ]
      })),

      getStats: () => {
        const state = get();
        const quizzes = state.quizzes[state.quizzes.length - 1];
        const totalFlashcards = state.flashcards.length;
        const totalDocuments = state.documents.length;
        
        return {
          totalDocs: totalDocuments,
          totalFlashcards,
          quizzesTaken: state.quizzes.length,
          avgScore: quizzes?.avgScore || 0
        };
      },

      clearAll: () => set({
        documents: [],
        flashcards: [],
        quizzes: [],
        chats: {},
        summaries: {}
      })
    }),
    {
      name: 'study-store',
      partialize: (state) => ({
        documents: state.documents,
        flashcards: state.flashcards,
        quizzes: state.quizzes
      })
    }
  )
);
