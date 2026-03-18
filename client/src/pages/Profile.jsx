import React from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';
import { ChevronLeft, User, Calendar, FileText, Brain, Target, Save, Loader2 } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { useStudyStore } from '../stores/studyStore';
import GlowCard from '../components/ui/GlowCard';
import NumberTicker from '../components/ui/NumberTicker';

const Profile = () => {
  const navigate = useNavigate();
  const { user, token, updateUser } = useAuthStore();
  const { documents, flashcards, quizzes } = useStudyStore();
  const [name, setName] = useState(user?.name || '');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error('Name is required');
      return;
    }

    setLoading(true);
    try {
      const { data } = await axios.put(
        '/auth/profile',
        { name },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      updateUser(data.user);
      toast.success('Profile updated!');
    } catch (err) {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    { label: 'Documents Uploaded', value: documents.length, icon: FileText, color: 'violet' },
    { label: 'Flashcards Created', value: flashcards.length, icon: Brain, color: 'teal' },
    { label: 'Quizzes Taken', value: quizzes.length, icon: Target, color: 'gold' },
    { label: 'Member Since', value: user?.createdAt ? new Date(user.createdAt).getFullYear() : '2024', icon: Calendar, color: 'violet' }
  ];

  return (
    <div className="min-h-screen bg-dark-900 p-8">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-4 mb-8"
        >
          <button
            onClick={() => navigate('/dashboard')}
            className="p-2 hover:bg-dark-700 rounded-lg transition-colors"
          >
            <ChevronLeft size={24} />
          </button>
          <h1 className="font-heading font-bold text-3xl">Profile</h1>
        </motion.div>

        <div className="space-y-8">
          <GlowCard glowColor="violet" className="p-8">
            <div className="flex items-center gap-6 mb-8">
              <div className="w-20 h-20 bg-gradient-to-br from-violet-500 to-teal-500 rounded-full flex items-center justify-center">
                <User size={40} className="text-white" />
              </div>
              <div>
                <h2 className="font-heading font-bold text-2xl">{user?.name}</h2>
                <p className="text-gray-400">{user?.email}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Display Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 bg-dark-700 rounded-xl border border-dark-600 focus:border-violet-500 outline-none transition-colors"
                  placeholder="Your name"
                />
              </div>

              <motion.button
                onClick={handleSave}
                disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-violet-600 to-violet-500 rounded-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <>
                    <Save size={18} />
                    Save Changes
                  </>
                )}
              </motion.button>
            </div>
          </GlowCard>

          <div>
            <h2 className="font-heading font-semibold text-xl mb-4">Your Statistics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {stats.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <GlowCard glowColor={stat.color} className="p-5">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-xl bg-${stat.color === 'violet' ? 'violet' : stat.color === 'teal' ? 'teal' : 'gold'}-500/20`}>
                        <stat.icon className={`text-${stat.color === 'violet' ? 'violet' : stat.color === 'teal' ? 'teal' : 'gold'}-400`} size={24} />
                      </div>
                      <div>
                        <div className="text-2xl font-heading font-bold">
                          {typeof stat.value === 'number' ? (
                            <NumberTicker value={stat.value} duration={1000} />
                          ) : (
                            stat.value
                          )}
                        </div>
                        <p className="text-gray-400 text-sm">{stat.label}</p>
                      </div>
                    </div>
                  </GlowCard>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
