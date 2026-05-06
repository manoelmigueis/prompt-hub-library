import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type AdminAction = "list" | "set_role" | "set_status" | "delete_user";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Configuração do backend indisponível");
    }

    const authHeader = req.headers.get("Authorization") || "";
    const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { data: authData, error: authError } = await userClient.auth.getUser();
    if (authError || !authData.user) {
      return json({ error: "Não autenticado" }, 401);
    }

    const { data: roleRows, error: roleError } = await adminClient
      .from("user_roles")
      .select("role")
      .eq("user_id", authData.user.id);

    if (roleError) throw roleError;
    const isAdmin = (roleRows || []).some((row) => row.role === "admin");
    if (!isAdmin) {
      return json({ error: "Apenas admins podem gerenciar contas" }, 403);
    }

    const body = req.method === "GET" ? { action: "list" } : await req.json().catch(() => ({}));
    const action = (body.action || "list") as AdminAction;

    if (action === "set_role") {
      const targetUserId = String(body.userId || "");
      const role = String(body.role || "user");
      const enabled = Boolean(body.enabled);
      if (!targetUserId || !["admin", "moderator", "user"].includes(role)) {
        return json({ error: "Dados inválidos" }, 400);
      }
      if (targetUserId === authData.user.id && role === "admin" && !enabled) {
        return json({ error: "Você não pode remover seu próprio admin" }, 400);
      }
      if (enabled) {
        const { error } = await adminClient.from("user_roles").upsert({ user_id: targetUserId, role }, { onConflict: "user_id,role" });
        if (error) throw error;
      } else {
        const { error } = await adminClient.from("user_roles").delete().eq("user_id", targetUserId).eq("role", role);
        if (error) throw error;
      }
    }

    if (action === "set_status") {
      const targetUserId = String(body.userId || "");
      const status = String(body.status || "active");
      if (!targetUserId || !["active", "suspended", "banned"].includes(status)) {
        return json({ error: "Status inválido" }, 400);
      }
      if (targetUserId === authData.user.id && status !== "active") {
        return json({ error: "Você não pode bloquear a própria conta" }, 400);
      }
      const { error } = await adminClient.from("profiles").update({ status, updated_at: new Date().toISOString() }).eq("id", targetUserId);
      if (error) throw error;
    }

    if (action === "delete_user") {
      const targetUserId = String(body.userId || "");
      if (!targetUserId) return json({ error: "Usuário inválido" }, 400);
      if (targetUserId === authData.user.id) {
        return json({ error: "Você não pode remover a própria conta" }, 400);
      }
      await adminClient.from("user_roles").delete().eq("user_id", targetUserId);
      await adminClient.from("profiles").delete().eq("id", targetUserId);
      const { error } = await adminClient.auth.admin.deleteUser(targetUserId);
      if (error) throw error;
    }

    const [{ data: profiles, error: profilesError }, { data: roles, error: rolesListError }, authUsers] = await Promise.all([
      adminClient.from("profiles").select("id, display_name, username, avatar_url, status, has_access, invite_code_used, created_at").order("created_at", { ascending: false }).limit(1000),
      adminClient.from("user_roles").select("user_id, role"),
      adminClient.auth.admin.listUsers({ page: 1, perPage: 1000 }),
    ]);

    if (profilesError) throw profilesError;
    if (rolesListError) throw rolesListError;
    if (authUsers.error) throw authUsers.error;

    const roleMap = new Map<string, string[]>();
    (roles || []).forEach((row) => {
      roleMap.set(row.user_id, [...(roleMap.get(row.user_id) || []), row.role]);
    });
    const emailMap = new Map(authUsers.data.users.map((user) => [user.id, user.email || ""]));

    return json({
      users: (profiles || []).map((profile) => ({
        ...profile,
        email: emailMap.get(profile.id) || "",
        roles: roleMap.get(profile.id) || [],
      })),
    });
  } catch (error) {
    console.error("[AdminUsers] error", error);
    return json({ error: error instanceof Error ? error.message : "Erro desconhecido" }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}