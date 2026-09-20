/**
 * Supabase Edge Function: invite-aluno
 * Envia convite de primeiro acesso para um novo aluno cadastrado na BJJ College.
 * Executa com SUPABASE_SERVICE_ROLE_KEY de forma segura no backend.
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.8";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Tratamento de CORS Preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    // Verificar se quem chamou a função é admin
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader?.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Não autorizado" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Conferir se o usuário é realmente admin
    const { data: roleData } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .single();

    if (roleData?.role !== "admin") {
      return new Response(
        JSON.stringify({ error: "Acesso negado: apenas o Professor Gorillaz/Admin pode convidar alunos." }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { email, nome_completo, profile_id } = await req.json();

    if (!email || !nome_completo) {
      return new Response(
        JSON.stringify({ error: "Email e nome_completo são obrigatórios." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Gerar convite por email oficial Supabase Auth
    const { data: inviteData, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
      data: {
        nome_completo,
      },
      redirectTo: `${Deno.env.get("APP_URL") || "https://bjjcollege.vercel.app"}/primeiro-acesso`,
    });

    if (inviteError) {
      throw inviteError;
    }

    // Atualizar status do convite no profile
    if (profile_id) {
      await supabaseAdmin
        .from("profiles")
        .update({ status_convite: "pendente", invited_at: new Date().toISOString() })
        .eq("id", profile_id);
    }

    return new Response(
      JSON.stringify({
        message: `Convite enviado com sucesso para ${email}`,
        user: inviteData.user,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
