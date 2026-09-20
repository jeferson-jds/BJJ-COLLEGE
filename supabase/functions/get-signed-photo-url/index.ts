/**
 * Supabase Edge Function: get-signed-photo-url
 * Retorna uma Signed URL temporária (1 hora) do bucket privado alunos-fotos
 * após validar o token JWT e a permissão RLS do usuário solicitante.
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.8";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Token ausente" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Usuário não autenticado" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { filePath } = await req.json();
    if (!filePath) {
      return new Response(JSON.stringify({ error: "filePath não fornecido" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verificar se o usuário é admin ou o dono da foto
    const { data: roleData } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .single();

    const isAdmin = roleData?.role === "admin";

    if (!isAdmin) {
      // Buscar o profile_id do usuário autenticado
      const { data: profile } = await supabaseAdmin
        .from("profiles")
        .select("id")
        .eq("user_id", user.id)
        .single();

      // O filePath de fotos privadas deve iniciar com o profile.id
      if (!profile || !filePath.startsWith(profile.id)) {
        return new Response(JSON.stringify({ error: "Acesso negado à foto requisitada" }), {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // Gerar Signed URL com 1 hora de expiração (3600 segundos)
    const { data, error: storageError } = await supabaseAdmin.storage
      .from("alunos-fotos")
      .createSignedUrl(filePath, 3600);

    if (storageError || !data?.signedUrl) {
      throw storageError || new Error("Erro ao assinar URL");
    }

    return new Response(JSON.stringify({ signedUrl: data.signedUrl }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
