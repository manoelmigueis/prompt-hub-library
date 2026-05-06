import { Prompt, PromptStatus } from '@/types/prompt';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Check, X, Star, Copy, Clock, CheckCircle, XCircle, Plus, Trash2, Users, Shield, UserX, RefreshCw, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  prompts: Prompt[];
  onUpdateStatus: (id: string, status: PromptStatus) => void;
  onToggleFeatured: (id: string) => void;
  onDeletePrompt: (id: string) => void;
  autoApprove: boolean;
  onToggleAutoApprove: (value: boolean) => void;
  inviteCodes: string[];
  onGenerateCode: () => void;
  onDeleteCode: (code: string) => void;
}

interface AdminUserRow {
  id: string;
  email: string;
  display_name: string | null;
  username: string | null;
  avatar_url: string | null;
  status: 'active' | 'suspended' | 'banned';
  has_access: boolean;
  invite_code_used: string | null;
  created_at: string;
  roles: string[];
}

export function AdminPanel({
  isOpen,
  onClose,
  prompts,
  onUpdateStatus,
  onToggleFeatured,
  onDeletePrompt,
  autoApprove,
  onToggleAutoApprove,
  inviteCodes,
  onGenerateCode,
  onDeleteCode,
}: AdminPanelProps) {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);
  
  const pendingPrompts = prompts.filter(p => p.status === 'pending');
  const approvedPrompts = prompts.filter(p => p.status === 'approved');
  const rejectedPrompts = prompts.filter(p => p.status === 'rejected');
  
  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };
  
  const copyInviteLink = (code: string) => {
    const link = `${window.location.origin}?invite=${code}`;
    navigator.clipboard.writeText(link);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const loadUsers = async () => {
    setLoadingUsers(true);
    try {
      const { data, error } = await supabase.functions.invoke('admin-users', { body: { action: 'list' } });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setUsers(data?.users || []);
    } catch (error: any) {
      console.error('[AdminUsers] load error', error);
      toast.error('Erro ao carregar contas: ' + (error?.message || 'desconhecido'));
    } finally {
      setLoadingUsers(false);
    }
  };

  const runUserAction = async (body: Record<string, unknown>, successMessage: string) => {
    const target = String(body.userId || '');
    setUpdatingUserId(target);
    try {
      const { data, error } = await supabase.functions.invoke('admin-users', { body });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setUsers(data?.users || []);
      toast.success(successMessage);
    } catch (error: any) {
      console.error('[AdminUsers] action error', error);
      toast.error('Erro ao atualizar conta: ' + (error?.message || 'desconhecido'));
    } finally {
      setUpdatingUserId(null);
    }
  };

  useEffect(() => {
    if (isOpen) loadUsers();
  }, [isOpen]);
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto overflow-x-hidden sm:w-full">
        <DialogHeader>
          <DialogTitle className="font-display text-lg sm:text-2xl flex items-center gap-2">
            🛡️ Painel Administrativo
          </DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="pending" className="mt-4">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-5 h-auto gap-1">
            <TabsTrigger value="pending" className="gap-1 text-xs sm:text-sm px-2 py-1.5">
              <Clock className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">Pendentes ({pendingPrompts.length})</span>
            </TabsTrigger>
            <TabsTrigger value="approved" className="gap-1 text-xs sm:text-sm px-2 py-1.5">
              <CheckCircle className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">Aprovados ({approvedPrompts.length})</span>
            </TabsTrigger>
            <TabsTrigger value="rejected" className="gap-1 text-xs sm:text-sm px-2 py-1.5">
              <XCircle className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">Rejeitados ({rejectedPrompts.length})</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-1 text-xs sm:text-sm px-2 py-1.5">
              ⚙️ <span className="truncate">Config</span>
            </TabsTrigger>
            <TabsTrigger value="users" className="gap-1 text-xs sm:text-sm px-2 py-1.5">
              <Users className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">Contas</span>
            </TabsTrigger>
          </TabsList>
          
          {/* Pending Tab */}
          <TabsContent value="pending" className="space-y-4 mt-4">
            {pendingPrompts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="w-12 h-12 mx-auto mb-2 opacity-50" />
                Nenhum prompt pendente
              </div>
            ) : (
              pendingPrompts.map(prompt => (
                <AdminPromptCard 
                  key={prompt.id}
                  prompt={prompt}
                  onApprove={() => onUpdateStatus(prompt.id, 'approved')}
                  onReject={() => onUpdateStatus(prompt.id, 'rejected')}
                  onToggleFeatured={() => onToggleFeatured(prompt.id)}
                  onDelete={() => onDeletePrompt(prompt.id)}
                />
              ))
            )}
          </TabsContent>
          
          {/* Approved Tab */}
          <TabsContent value="approved" className="space-y-4 mt-4">
            {approvedPrompts.map(prompt => (
              <AdminPromptCard 
                key={prompt.id}
                prompt={prompt}
                onApprove={() => {}}
                onReject={() => onUpdateStatus(prompt.id, 'rejected')}
                onToggleFeatured={() => onToggleFeatured(prompt.id)}
                onDelete={() => onDeletePrompt(prompt.id)}
                showApprove={false}
              />
            ))}
          </TabsContent>
          
          {/* Rejected Tab */}
          <TabsContent value="rejected" className="space-y-4 mt-4">
            {rejectedPrompts.map(prompt => (
              <AdminPromptCard 
                key={prompt.id}
                prompt={prompt}
                onApprove={() => onUpdateStatus(prompt.id, 'approved')}
                onReject={() => {}}
                onToggleFeatured={() => onToggleFeatured(prompt.id)}
                onDelete={() => onDeletePrompt(prompt.id)}
                showReject={false}
              />
            ))}
          </TabsContent>
          
          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6 mt-4">
            {/* Auto Approve */}
            <div className="bg-muted rounded-lg p-4 border-2 border-primary">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-lg font-display font-bold">Aprovação Automática</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Quando ativado, novos prompts serão aprovados automaticamente
                  </p>
                </div>
                <Switch 
                  checked={autoApprove} 
                  onCheckedChange={onToggleAutoApprove}
                />
              </div>
            </div>
            
            {/* Invite Codes */}
            <div className="bg-muted rounded-lg p-4 border-2 border-primary">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <Label className="text-lg font-display font-bold">Códigos de Convite</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Gere códigos para convidar novos usuários
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={onGenerateCode} className="gap-2">
                  <Plus className="w-4 h-4" />
                  Gerar Código
                </Button>
              </div>
              
              <div className="space-y-2">
                {inviteCodes.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">
                    Nenhum código ativo
                  </p>
                ) : (
                  inviteCodes.map(code => (
                    <div key={code} className="flex flex-wrap items-center gap-2 bg-card p-2 sm:p-3 rounded-lg border">
                      <code className="flex-1 min-w-0 font-mono text-sm sm:text-lg font-bold truncate">{code}</code>
                      <div className="flex items-center gap-1.5">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleCopyCode(code)}
                        >
                          {copiedCode === code ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => copyInviteLink(code)}
                        >
                          Link
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => onDeleteCode(code)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="users" className="space-y-4 mt-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <Label className="text-lg font-display font-bold">Contas cadastradas</Label>
                <p className="text-sm text-muted-foreground">Gerencie privilégios, bloqueios e remoções.</p>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={loadUsers} disabled={loadingUsers} className="gap-2">
                {loadingUsers ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                Atualizar
              </Button>
            </div>
            {loadingUsers ? (
              <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
            ) : users.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground border border-dashed border-border rounded-lg">Nenhuma conta encontrada.</div>
            ) : (
              <div className="space-y-3">
                {users.map(user => (
                  <AdminUserCard key={user.id} user={user} busy={updatingUserId === user.id} onAction={runUserAction} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

interface AdminPromptCardProps {
  prompt: Prompt;
  onApprove: () => void;
  onReject: () => void;
  onToggleFeatured: () => void;
  onDelete: () => void;
  showApprove?: boolean;
  showReject?: boolean;
}

function AdminPromptCard({ 
  prompt, 
  onApprove, 
  onReject, 
  onToggleFeatured,
  onDelete,
  showApprove = true,
  showReject = true,
}: AdminPromptCardProps) {
  const actionButtons = (
    <>
      <Button
        variant={prompt.isFeatured ? 'secondary' : 'outline'}
        size="sm"
        onClick={onToggleFeatured}
        className="gap-1 h-7 w-7 sm:h-8 sm:w-auto p-0 sm:px-3"
      >
        <Star className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${prompt.isFeatured ? 'fill-current' : ''}`} />
      </Button>
      
      {showApprove && (
        <Button variant="success" size="sm" onClick={onApprove} className="gap-1 h-7 w-7 sm:h-8 sm:w-auto p-0 sm:px-3">
          <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span className="hidden sm:inline">Aprovar</span>
        </Button>
      )}
      
      {showReject && (
        <Button variant="destructive" size="sm" onClick={onReject} className="gap-1 h-7 w-7 sm:h-8 sm:w-auto p-0 sm:px-3">
          <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span className="hidden sm:inline">Rejeitar</span>
        </Button>
      )}

      <Button variant="destructive" size="sm" onClick={onDelete} className="gap-1 h-7 w-7 sm:h-8 sm:w-auto p-0 sm:px-3">
        <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
      </Button>
    </>
  );

  return (
    <>
      {/* Mobile: compact list layout */}
      <div className="sm:hidden flex flex-row items-center gap-3 p-3 border border-primary rounded-lg w-full overflow-hidden bg-card">
        {prompt.imageUrl && (
          <img 
            src={prompt.imageUrl} 
            alt={prompt.title}
            className="w-16 h-16 rounded object-cover object-top flex-shrink-0 border border-primary"
          />
        )}
        <div className="flex flex-col flex-1 min-w-0">
          <h4 className="font-display font-bold text-sm truncate">{prompt.title}</h4>
          <p className="text-xs text-muted-foreground truncate">por {prompt.author}</p>
          <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5 break-words">{prompt.description}</p>
          <div className="flex gap-1 mt-1.5">
            {actionButtons}
          </div>
        </div>
      </div>

      {/* Desktop: original card layout */}
      <div className="hidden sm:flex bg-card border-2 border-primary rounded-lg p-4 flex-row gap-4 w-full overflow-hidden">
        {prompt.imageUrl && (
          <img 
            src={prompt.imageUrl} 
            alt={prompt.title}
            className="w-24 h-24 object-cover object-top rounded-lg border-2 border-primary"
          />
        )}
        <div className="flex-1 min-w-0">
          <div className="flex flex-row items-start justify-between gap-2">
            <div className="min-w-0">
              <h4 className="font-display font-bold text-lg truncate">{prompt.title}</h4>
              <p className="text-sm text-muted-foreground">por {prompt.author}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {actionButtons}
            </div>
          </div>
          <p className="text-sm mt-2 line-clamp-2 w-full overflow-hidden break-words">{prompt.description}</p>
        </div>
      </div>
    </>
  );
}
