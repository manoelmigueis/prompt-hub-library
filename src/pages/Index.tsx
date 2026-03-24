import { useState, useMemo, useEffect } from 'react';
import { Header } from '@/components/Header';
import { HeroSection } from '@/components/HeroSection';
import { CategoryFilter } from '@/components/CategoryFilter';
import { PromptGrid } from '@/components/PromptGrid';
import { PromptModal } from '@/components/PromptModal';
import { SubmitPromptModal, SubmitPromptData } from '@/components/SubmitPromptModal';
import { AdminPanel } from '@/components/AdminPanel';
import { InviteModal } from '@/components/InviteModal';
import { InviteCodeGate } from '@/components/auth/InviteCodeGate';
import { ProfileModal } from '@/components/ProfileModal';
import { Category, Prompt, PromptStatus } from '@/types/prompt';
import { toast } from 'sonner';
import { useAuth, UserProfile } from '@/hooks/useAuth';
import { usePrompts } from '@/hooks/usePrompts';
import { useInviteCodes } from '@/hooks/useInviteCodes';
import { useFavorites } from '@/hooks/useFavorites';
import { expandSearchTerms } from '@/lib/searchTranslations';

export default function Index() {
  const { 
    isAuthenticated, 
    isAdmin, 
    isModerator,
    hasAccess,
    profile,
    user,
    session,
    loading: authLoading,
    authTimedOut,
    signIn,
    signUp,
    signOut,
    updateProfile,
    fetchUserData,
    grantAccess
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

  const { favorites, isFavorite, toggleFavorite, favoriteIds } = useFavorites(user?.id);
  
  // UI state
  const [selectedCategory, setSelectedCategory] = useState<Category>('all');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
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

  useEffect(() => {
    console.log('[DEBUG_LOAD]', { user, loading: authLoading, session });
  }, [user, authLoading, session]);

  const handleToggleAutoApprove = async (value: boolean) => {
    setAutoApproveLocal(value);
    const success = await setAutoApprove(value);
    if (!success) {
      setAutoApproveLocal(!value);
    } else {
      toast.success(value ? 'Aprovação automática ativada!' : 'Aprovação automática desativada');
    }
  };
  
  const handleCategoryChange = (category: Category) => {
    setSelectedCategory(category);
    if (category !== 'all') setShowFavoritesOnly(false);
  };

  const handleFavoritesFilter = () => {
    setShowFavoritesOnly(prev => !prev);
    if (!showFavoritesOnly) setSelectedCategory('all');
  };

  // Filter prompts with cross-language search
  const filteredPrompts = useMemo(() => {
    let filtered = prompts.filter(p => p.status === 'approved');

    if (showFavoritesOnly) {
      filtered = filtered.filter(p => favorites.has(p.id));
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }

    if (searchQuery.trim() === '') return filtered;

    const expandedTerms = expandSearchTerms(searchQuery);
    const normalize = (text: string) => text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    return filtered.filter(p => {
      const searchableText = normalize(
        `${p.title} ${p.description} ${p.content} ${(p.tags || []).join(' ')}`
      );
      return expandedTerms.some(term => searchableText.includes(term));
    });
  }, [prompts, selectedCategory, searchQuery, showFavoritesOnly, favoriteIds]);
  
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

  const handleSaveProfile = async (updates: Partial<UserProfile>) => {
    const result = await updateProfile(updates);
    if (!result.error) {
      await fetchPrompts();
    }
    return result;
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="text-center space-y-4">
          <div className="animate-pulse text-primary font-display text-2xl">CARREGANDO...</div>
          {authTimedOut && (
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="text-sm text-muted-foreground underline underline-offset-4"
            >
              Recarregar
            </button>
          )}
        </div>
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

      {/* Invite Code Gate - shown after login if no access */}
      {isAuthenticated && user && !hasAccess && (
        <InviteCodeGate
          isOpen={true}
          userId={user.id}
          onAccessGranted={() => { grantAccess(); fetchUserData(user.id); }}
        />
      )}
      
      {/* Main Content */}
      {isAuthenticated && hasAccess && (
        <>
          <Header 
            isAdmin={isAdmin}
            isModerator={isModerator}
            isAuthenticated={isAuthenticated}
            displayName={profile?.display_name || undefined}
            avatarUrl={profile?.avatar_url || undefined}
            showFavoritesOnly={showFavoritesOnly}
            onAdminClick={() => setShowAdminPanel(true)}
            onSubmitClick={() => setShowSubmitModal(true)}
            onProfileClick={() => setShowProfileModal(true)}
            onFavoritesClick={handleFavoritesFilter}
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
              onCategoryChange={handleCategoryChange}
              totalPrompts={filteredPrompts.length}
              onSearchClick={() => {}}
              onAddClick={() => setShowSubmitModal(true)}
              showFavoritesOnly={showFavoritesOnly}
              onToggleFavorites={handleFavoritesFilter}
            />
            
            <PromptGrid 
              prompts={filteredPrompts}
              onPromptClick={handlePromptClick}
              onCopyPrompt={handleCopyPrompt}
              isFavorite={isFavorite}
              onToggleFavorite={toggleFavorite}
            />

            {promptsLoading && (
              <div className="container mx-auto px-4 pb-8 text-center text-sm text-muted-foreground">
                Carregando prompts...
              </div>
            )}
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
            onSave={handleSaveProfile}
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
