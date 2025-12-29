import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Languages, Save, Loader2, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { userApi, Language } from '@/lib/api';
import { useNavigate } from 'react-router-dom';

export default function Settings() {
  const { user, updateLanguage, isAuthenticated, isLoading: authLoading } = useAuth();
  const [languages, setLanguages] = useState<Language[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState(user?.language || 'en');
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, authLoading, navigate]);

  useEffect(() => {
    userApi.getLanguages()
      .then(setLanguages)
      .catch(() => setLanguages([
        { code: 'en', name: 'English' },
        { code: 'es', name: 'Spanish' },
        { code: 'fr', name: 'French' },
        { code: 'de', name: 'German' },
        { code: 'zh', name: 'Chinese' },
        { code: 'ja', name: 'Japanese' },
        { code: 'ko', name: 'Korean' },
        { code: 'pt', name: 'Portuguese' },
        { code: 'ru', name: 'Russian' },
        { code: 'ar', name: 'Arabic' },
      ]));
  }, []);

  useEffect(() => {
    if (user?.language) {
      setSelectedLanguage(user.language);
    }
  }, [user?.language]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateLanguage(selectedLanguage);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error('Failed to update language:', err);
    } finally {
      setIsSaving(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="h-16 border-b border-border flex items-center gap-4 px-6">
        <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-xl font-display font-semibold">Settings</h1>
      </header>

      <main className="max-w-2xl mx-auto p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="glass-panel p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
              <Languages className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="font-display font-semibold text-lg">Language Settings</h2>
              <p className="text-sm text-muted-foreground">Choose your preferred language for translations</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Your Language</label>
              <div className="relative">
                <select
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  className="flex h-12 w-full appearance-none rounded-lg border border-border bg-secondary/50 px-4 py-2 pr-10 text-foreground transition-all duration-200 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  {languages.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      {lang.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
              </div>
              <p className="text-xs text-muted-foreground">
                Messages from other users will be automatically translated to this language
              </p>
            </div>

            <Button
              variant="glow"
              size="lg"
              className="w-full"
              onClick={handleSave}
              disabled={isSaving || selectedLanguage === user?.language}
            >
              {isSaving ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : saved ? (
                'Saved!'
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </motion.div>

        {/* User Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="glass-panel p-6 mt-6"
        >
          <h3 className="font-display font-semibold mb-4">Profile</h3>
          <div className="space-y-3">
            <div className="flex justify-between py-2 border-b border-border">
              <span className="text-muted-foreground">Name</span>
              <span className="font-medium">{user?.firstName} {user?.lastName}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-border">
              <span className="text-muted-foreground">Username</span>
              <span className="font-medium">@{user?.username}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-muted-foreground">Email</span>
              <span className="font-medium">{user?.email}</span>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
