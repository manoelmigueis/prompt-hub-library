import { useState, useMemo, useEffect } from 'react';
import { Header } from '@/components/Header';
import { HeroSection } from '@/components/HeroSection';
import { CategoryFilter } from '@/components/CategoryFilter';
import { PromptGrid } from '@/components/PromptGrid';
import { PromptModal } from '@/components/PromptModal';
import { SubmitPromptModal, SubmitPromptData } from '@/components/SubmitPromptModal';
import { AdminPanel } from '@/components/AdminPanel';
import { InviteModal } from '@/components/InviteModal';
import { ProfileModal } from '@/components/ProfileModal';
import { Category, Prompt, PromptStatus } from '@/types/prompt';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { usePrompts } from '@/hooks/usePrompts';
import { useInviteCodes } from '@/hooks/useInviteCodes';
import { useFavorites } from '@/hooks/useFavorites';

export default function Index() {
  const { 
    isAuthenticated, 
    isAdmin, 
    isModerator,
    profile,
    user,
    loading: authLoading,
    signIn,
    signUp,
    signOut,
    updateProfile
  } = useAuth();

  const {
    prompts,
    loading: promptsLoading,
    createPrompt,
    updatePromptStatus,
    toggleFeatured,
    deletePrompt,
    incrementView,
    incrementCopy,
    getAutoApprove,
    setAutoApprove,
    fetchPrompts,
  } = usePrompts(user?.id, isAdmin);

  const {
    inviteCodes,
    generateCode,
    deleteCode,
  } = useInviteCodes();

  const { isFavorite, toggleFavorite } = useFavorites(user?.id);
  
  // UI state
  const [selectedCategory, setSelectedCategory] = useState<Category>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
  
  // Modal state
  const [showPromptModal, setShowPromptModal] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  
  // Admin settings
  const [autoApprove, setAutoApproveLocal] = useState(false);

  useEffect(() => {
    if (isAdmin) {
      getAutoApprove().then(setAutoApproveLocal);
    }
  }, [isAdmin]);

  const handleToggleAutoApprove = async (value: boolean) => {
    setAutoApproveLocal(value);
    const success = await setAutoApprove(value);
    if (!success) {
      setAutoApproveLocal(!value);
    } else {
      toast.success(value ? 'Aprovação automática ativada!' : 'Aprovação automática desativada');
    }
  };
  
  // Filter prompts
  const filteredPrompts = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return prompts
      .filter(p => p.status === 'approved')
      .filter(p => selectedCategory === 'all' || p.category === selectedCategory)
      .filter(p => {
        if (q === '') return true;
        return (
          p.title.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.content.toLowerCase().includes(q) ||
          (p.tags && p.tags.some(tag => tag.toLowerCase().includes(q)))
        );
      });
  }, [prompts, selectedCategory, searchQuery]);
  
  // Handlers
  const handleLogin = async (email: string, password: string) => {
    const result = await signIn(email, password);
    if (!result.error) {
      toast.success('Bem-vindo ao Ensaios Impossíveis! 🎨');
    }
    return result;
  };

  const handleSignUp = async (email: string, password: string, displayName: string, inviteCode: string) => {
    const result = await signUp(email, password, displayName, inviteCode);
    if (!result.error) {
      toast.success('Conta criada com sucesso! 🎉');
    }
    return result;
  };
  
  const handleLogout = () => {
    signOut();
  };
  
  const handlePromptClick = (prompt: Prompt) => {
    setSelectedPrompt(prompt);
    setShowPromptModal(true);
    incrementView(prompt.id);
  };

  const handleCopyPrompt = (id: string) => {
    incrementCopy(id);
  };
  
  const handleSubmitPrompt = async (data: SubmitPromptData) => {
    const result = await createPrompt(data, profile);
    if (result) {
      const autoApproved = (result as any).autoApproved;
      toast.success(autoApproved ? 'Ensaio publicado!' : 'Ensaio enviado para revisão!');
      setShowSubmitModal(false);
    }
  };
  
  const handleUpdateStatus = async (id: string, status: PromptStatus) => {
    const success = await updatePromptStatus(id, status);
    if (success) {
      toast.success(status === 'approved' ? 'Ensaio aprovado!' : 'Ensaio rejeitado');
    }
  };
  
  const handleToggleFeatured = async (id: string) => {
    await toggleFeatured(id);
  };

  const handleDeletePrompt = async (id: string) => {
    const success = await deletePrompt(id);
    if (success) {
      toast.success('Ensaio excluído');
    }
  };
  
  const handleGenerateCode = async () => {
    if (user?.id) {
      await generateCode(user.id);
    }
  };
  
  const handleDeleteCode = async (code: string) => {
    const codeObj = inviteCodes.find(c => c.code === code);
    if (codeObj) {
      await deleteCode(codeObj.id);
    }
  };

  const loading = authLoading || promptsLoading;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-primary font-display text-2xl">Carregando...</div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-background">
      {/* Invite/Login Modal */}
      <InviteModal 
        isOpen={!isAuthenticated}
        onLogin={handleLogin}
        onSignUp={handleSignUp}
        loading={authLoading}
      />
      
      {/* Main Content */}
      {isAuthenticated && (
        <>
          <Header 
            isAdmin={isAdmin}
            isModerator={isModerator}
            isAuthenticated={isAuthenticated}
            displayName={profile?.display_name || undefined}
            avatarUrl={profile?.avatar_url || undefined}
            onAdminClick={() => setShowAdminPanel(true)}
            onSubmitClick={() => setShowSubmitModal(true)}
            onProfileClick={() => setShowProfileModal(true)}
            onLogout={handleLogout}
          />
          
          <main>
            <HeroSection 
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              totalPrompts={filteredPrompts.length}
            />
            
            <CategoryFilter 
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
              totalPrompts={filteredPrompts.length}
              onSearchClick={() => {}}
              onAddClick={() => setShowSubmitModal(true)}
            />
            
            <PromptGrid 
              prompts={filteredPrompts}
              onPromptClick={handlePromptClick}
              onCopyPrompt={handleCopyPrompt}
              isFavorite={isFavorite}
              onToggleFavorite={toggleFavorite}
            />
          </main>
          
          {/* Modals */}
          <PromptModal 
            prompt={selectedPrompt}
            isOpen={showPromptModal}
            onClose={() => setShowPromptModal(false)}
            isFavorite={selectedPrompt ? isFavorite(selectedPrompt.id) : false}
            onToggleFavorite={toggleFavorite}
            onCopy={handleCopyPrompt}
          />
          
          <SubmitPromptModal 
            isOpen={showSubmitModal}
            onClose={() => setShowSubmitModal(false)}
            onSubmit={handleSubmitPrompt}
          />

          <ProfileModal
            isOpen={showProfileModal}
            onClose={() => setShowProfileModal(false)}
            profile={profile}
            onSave={updateProfile}
          />
          
          <AdminPanel 
            isOpen={showAdminPanel}
            onClose={() => setShowAdminPanel(false)}
            prompts={prompts}
            onUpdateStatus={handleUpdateStatus}
            onToggleFeatured={handleToggleFeatured}
            onDeletePrompt={handleDeletePrompt}
            autoApprove={autoApprove}
            onToggleAutoApprove={handleToggleAutoApprove}
            inviteCodes={inviteCodes.map(c => c.code)}
            onGenerateCode={handleGenerateCode}
            onDeleteCode={handleDeleteCode}
          />
        </>
      )}
    </div>
  );
}
