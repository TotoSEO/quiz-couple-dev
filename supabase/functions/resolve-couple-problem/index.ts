import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface Person {
  name: string;
  gender: "homme" | "femme";
  statement?: string;
}

interface ProblemContext {
  title: string;
  persons: Person[];
  context: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is not configured");
    }

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Supabase configuration is missing");
    }

    // Get client IP
    const clientIP = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() 
      || req.headers.get("cf-connecting-ip") 
      || "unknown";

    // Create Supabase client with service role
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Check rate limit (1 per day per IP)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    
    const { data: recentUsage, error: usageError } = await supabase
      .from("problem_resolver_usage")
      .select("id")
      .eq("ip_address", clientIP)
      .gte("used_at", oneDayAgo)
      .limit(1);

    if (usageError) {
      console.error("Error checking rate limit:", usageError);
    }

    if (recentUsage && recentUsage.length > 0) {
      return new Response(
        JSON.stringify({ 
          error: "Vous avez déjà utilisé cet outil aujourd'hui. Revenez demain !",
          rateLimited: true 
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse request body
    const problemContext: ProblemContext = await req.json();

    // Validate input
    if (!problemContext.title || !problemContext.context || !problemContext.persons?.length) {
      return new Response(
        JSON.stringify({ error: "Données incomplètes" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build the dynamic prompt
    const personsInfo = problemContext.persons
      .map((p) => `- ${p.name} (${p.gender})`)
      .join("\n");

    const statementsInfo = problemContext.persons
      .map((p) => `### Version de ${p.name} :\n${p.statement || "Non fournie"}`)
      .join("\n\n");

    const personNames = problemContext.persons.map(p => p.name);

    const systemPrompt = `Tu es expert en résolution de problèmes pour les couples, comme un psychologue complètement impartial qui va juger une situation dans son contexte.

Tu dois analyser la situation suivante et fournir une réponse structurée en JSON.

RÈGLES IMPORTANTES :
1. Tu dois être 100% impartial et objectif
2. Tu dois baser ton analyse uniquement sur les faits présentés
3. Le score de gravité va de 0 à 100 (0 = dispute insignifiante comme "ne pas remettre le tapis droit", 100 = problème très grave comme "tromperie avec mensonges pendant des mois")
4. Le score de résolution va de 0 à 100 (100 = facilement résolvable, 0 = nécessite absolument un psychologue professionnel)
5. Les scores de responsabilité (faultScores) doivent OBLIGATOIREMENT totaliser exactement 100
6. Tu dois donner entre 3 et 5 conseils d'amélioration concrets et actionnables
7. Ton analyse doit faire entre 100 et 280 mots

Réponds UNIQUEMENT avec un JSON valide, sans texte avant ou après.`;

    const userPrompt = `**Titre du problème :** ${problemContext.title}

**Contexte (décrit de manière neutre) :** ${problemContext.context}

**Personnes concernées :**
${personsInfo}

**Versions des faits :**
${statementsInfo}

---

Analyse cette situation et retourne un JSON avec cette structure exacte :
{
  "analysis": "Ton analyse impartiale détaillée (100-280 mots)",
  "gravityScore": [nombre entre 0 et 100],
  "resolutionScore": [nombre entre 0 et 100],
  "faultScores": [${personNames.map(n => `{"name": "${n}", "score": [nombre]}`).join(", ")}],
  "improvements": ["conseil 1", "conseil 2", "conseil 3", ...]
}

RAPPEL : La somme des scores dans faultScores DOIT être exactement égale à 100.`;

    // Call OpenAI API
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenAI API error:", response.status, errorText);
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Trop de requêtes. Veuillez réessayer plus tard." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw new Error("Erreur lors de l'analyse IA (code " + response.status + ")");
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("Réponse IA vide");
    }

    // Parse JSON from AI response
    let result;
    try {
      // Try to extract JSON from the response (in case there's extra text)
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[0]);
      } else {
        result = JSON.parse(content);
      }
    } catch (parseError) {
      console.error("Error parsing AI response:", content);
      throw new Error("Erreur lors du traitement de l'analyse");
    }

    // Validate the result structure
    if (
      typeof result.analysis !== "string" ||
      typeof result.gravityScore !== "number" ||
      typeof result.resolutionScore !== "number" ||
      !Array.isArray(result.faultScores) ||
      !Array.isArray(result.improvements)
    ) {
      console.error("Invalid result structure:", result);
      throw new Error("Structure de réponse invalide");
    }

    // Ensure fault scores sum to 100
    const faultSum = result.faultScores.reduce((sum: number, f: { score: number }) => sum + f.score, 0);
    if (faultSum !== 100) {
      // Normalize scores to 100
      const factor = 100 / faultSum;
      result.faultScores = result.faultScores.map((f: { name: string; score: number }) => ({
        ...f,
        score: Math.round(f.score * factor),
      }));
      // Adjust last score to ensure exact 100
      const newSum = result.faultScores.reduce((sum: number, f: { score: number }) => sum + f.score, 0);
      if (newSum !== 100 && result.faultScores.length > 0) {
        result.faultScores[result.faultScores.length - 1].score += 100 - newSum;
      }
    }

    // Record usage (after successful analysis)
    const { error: insertError } = await supabase
      .from("problem_resolver_usage")
      .insert({ ip_address: clientIP });

    if (insertError) {
      console.error("Error recording usage:", insertError);
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in resolve-couple-problem:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Une erreur est survenue" 
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
