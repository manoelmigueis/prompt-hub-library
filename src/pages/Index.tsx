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
import { mockPrompts } from '@/data/mockPrompts';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';

export default function Index() {
  const { 
    isAuthenticated, 
    isAdmin, 
    isModerator,
    profile,
    loading,
    signIn,
    signUp,
    signOut,
    updateProfile
  } = useAuth();
  
  // Data state
  const [prompts, setPrompts] = useState<Prompt[]>(mockPrompts);
  const [selectedCategory, setSelectedCategory] = useState<Category>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
  
  // Modal state
  const [showPromptModal, setShowPromptModal] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  
  // Admin settings
  const [autoApprove, setAutoApprove] = useState(false);
  const [inviteCodes, setInviteCodes] = useState<string[]>([]);
  
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
  
  const handleSubmitPrompt = (data: SubmitPromptData) => {
    const newPrompt: Prompt = {
      id: Date.now().toString(),
      ...data,
      author: profile?.display_name || 'Anônimo',
      authorHandle: profile?.instagram ? `@${profile.instagram}` : undefined,
      status: autoApprove ? 'approved' : 'pending',
      isFeatured: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    setPrompts(prev => [newPrompt, ...prev]);
    toast.success(
      autoApprove 
        ? 'Ensaio publicado com sucesso!' 
        : 'Ensaio enviado para revisão!'
    );
  };
  
  const handleUpdateStatus = (id: string, status: PromptStatus) => {
    setPrompts(prev => prev.map(p => 
      p.id === id ? { ...p, status, updatedAt: new Date() } : p
    ));
    toast.success(status === 'approved' ? 'Ensaio aprovado!' : 'Ensaio rejeitado');
  };
  
  const handleToggleFeatured = (id: string) => {
    setPrompts(prev => prev.map(p =>
      p.id === id ? { ...p, isFeatured: !p.isFeatured } : p
    ));
  };

  const handleDeletePrompt = (id: string) => {
    setPrompts(prev => prev.filter(p => p.id !== id));
    toast.success('Ensaio excluído');
  };
  
  const handleGenerateCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setInviteCodes(prev => [...prev, code]);
    toast.success('Novo código gerado!');
  };
  
  const handleDeleteCode = (code: string) => {
    setInviteCodes(prev => prev.filter(c => c !== code));
    toast.success('Código removido');
  };

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
        loading={loading}
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
            onDeletePrompt={handleDeletePrompt}
            autoApprove={autoApprove}
            onToggleAutoApprove={setAutoApprove}
            inviteCodes={inviteCodes}
            onGenerateCode={handleGenerateCode}
            onDeleteCode={handleDeleteCode}
          />
        </>
      )}
    </div>
  );
}