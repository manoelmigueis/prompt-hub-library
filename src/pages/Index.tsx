import { useState, useMemo } from 'react';
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
  } = usePrompts(user?.id, isAdmin);

  const {
    inviteCodes,
    generateCode,
    deleteCode,
  } = useInviteCodes();
  
  // UI state
  const [selectedCategory, setSelectedCategory] = useState<Category>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
  
  // Modal state
  const [showPromptModal, setShowPromptModal] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  
  // Admin settings (local)
  const [autoApprove, setAutoApprove] = useState(false);
  
  // Filter prompts
  const filteredPrompts = useMemo(() => {
    return prompts
      .filter(p => p.status === 'approved')
      .filter(p => selectedCategory === 'all' || p.category === selectedCategory)
      .filter(p => 
        searchQuery === '' ||
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.content.toLowerCase().includes(searchQuery.toLowerCase())
      );
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
  };
  
  const handleSubmitPrompt = async (data: SubmitPromptData) => {
    const result = await createPrompt(data, profile);
    if (result) {
      toast.success('Ensaio enviado para revisão!');
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
            />
          </main>
          
          {/* Modals */}
          <PromptModal 
            prompt={selectedPrompt}
            isOpen={showPromptModal}
            onClose={() => setShowPromptModal(false)}
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
            autoApprove={autoApprove}
            onToggleAutoApprove={setAutoApprove}
            inviteCodes={inviteCodes.map(c => c.code)}
            onGenerateCode={handleGenerateCode}
            onDeleteCode={handleDeleteCode}
          />
        </>
      )}
    </div>
  );
}
