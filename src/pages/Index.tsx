import { useState, useMemo, useEffect, useCallback } from 'react';
import { Header } from '@/components/Header';
import { HeroSection } from '@/components/HeroSection';
import { CategoryFilter } from '@/components/CategoryFilter';
import { PromptGrid } from '@/components/PromptGrid';
import { PromptModal } from '@/components/PromptModal';
import { SubmitPromptModal, SubmitPromptData } from '@/components/SubmitPromptModal';
import { AdminPanel } from '@/components/AdminPanel';
import { InviteModal } from '@/components/InviteModal';
import { ProfileModal } from '@/components/ProfileModal';
import { EditPromptModal } from '@/components/EditPromptModal';
import { PortfolioShopModal } from '@/components/portfolio/PortfolioShopModal';
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
    updatePrompt,
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
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const handleSearchSubmit = useCallback(() => {
    const trimmedQuery = searchQuery.trim();
    setDebouncedSearch(trimmedQuery);
    setIsSearching(false);
  }, [searchQuery]);

  // Debounce search input by 500ms
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setDebouncedSearch('');
      setIsSearching(false);
      return;
    }
    setIsSearching(true);
    const timer = setTimeout(() => {
      console.log('[Search] Debounced query:', searchQuery);
      setDebouncedSearch(searchQuery.trim());
      setIsSearching(false);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
  
  // Modal state
  const [showPromptModal, setShowPromptModal] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showShopModal, setShowShopModal] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState<Prompt | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  // Admin settings
  const [autoApprove, setAutoApproveLocal] = useState(false);

  // Auto-open submit modal from query param
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('submit') === 'true' && isAuthenticated) {
      setShowSubmitModal(true);
      window.history.replaceState({}, '', '/');
    }
  }, [isAuthenticated]);

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

    const trimmedSearch = debouncedSearch.trim();

    if (trimmedSearch === '') {
      console.log('[SearchDebug]', 'Termo recebido:', trimmedSearch, 'Resultados filtrados:', filtered.length);
      return filtered;
    }

    const expandedTerms = expandSearchTerms(trimmedSearch);
    console.log('[SearchSystem] searching across multiple fields for:', trimmedSearch, '→ Expanded terms:', expandedTerms.slice(0, 15));
    const normalize = (text: string) => text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    const results = filtered.filter(p => {
      // Only search in user-meaningful content fields. Excluding category/author
      // prevents whole categories from matching when the user types a term.
      const searchableFields = [
        p.title || '',
        p.description || '',
        p.content || '',
        (p.tags || []).join(' '),
      ];
      const searchableText = normalize(searchableFields.join(' '));
      // Word-boundary match prevents "carro" matching inside unrelated words.
      return expandedTerms.some(term => {
        if (!term) return false;
        const re = new RegExp(`\\b${escapeRegex(term)}\\b`, 'i');
        return re.test(searchableText);
      });
    });
    console.log('[SearchDebug]', 'Termo recebido:', trimmedSearch, 'Resultados filtrados:', results.length);
    console.log('[SearchSystem] Results found:', results.length, 'from', filtered.length, 'prompts');
    return results;
  }, [prompts, selectedCategory, debouncedSearch, showFavoritesOnly, favoriteIds]);
  
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
            showFavoritesOnly={showFavoritesOnly}
            onAdminClick={() => setShowAdminPanel(true)}
            onSubmitClick={() => setShowSubmitModal(true)}
            onProfileClick={() => setShowProfileModal(true)}
            onShopClick={() => setShowShopModal(true)}
            onFavoritesClick={handleFavoritesFilter}
            onLogout={handleLogout}
          />
          
          <main>
            <HeroSection 
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onSearchSubmit={handleSearchSubmit}
              totalPrompts={filteredPrompts.length}
              isSearching={isSearching}
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
              isAdmin={isAdmin}
              isSearching={isSearching}
              hasSearchQuery={searchQuery.trim().length > 0 || debouncedSearch.trim().length > 0}
              onEditPrompt={(prompt) => {
                setEditingPrompt(prompt);
                setShowEditModal(true);
              }}
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
            isAdmin={isAdmin}
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
          <PortfolioShopModal isOpen={showShopModal} onClose={() => setShowShopModal(false)} userId={user?.id} />
          
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

          <EditPromptModal
            isOpen={showEditModal}
            onClose={() => { setShowEditModal(false); setEditingPrompt(null); }}
            prompt={editingPrompt}
            isAdmin={isAdmin}
            onSave={updatePrompt}
          />
        </>
      )}
    </div>
  );
}
