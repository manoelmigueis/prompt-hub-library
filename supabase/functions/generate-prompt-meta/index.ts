import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { prompt, category } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content: `You are an SEO and content analysis expert for an AI image prompt gallery. Given a prompt text, generate:
1. A concise, creative title (max 60 chars, in Portuguese)
2. An SEO-optimized description (max 155 chars, in Portuguese)
3. 6-10 tags in Portuguese focused EXCLUSIVELY on the CONTENT, CONTEXT and CULTURAL REFERENCES of the scene. 
   Focus on:
   - SUBJECT: profession, character type, identity (ex: "policial", "medico", "astronauta", "samurai")
   - ACTION: what is happening (ex: "operacao-tatica", "correndo", "meditando", "cozinhando")
   - LOCATION/SETTING: where it takes place (ex: "favela", "hospital", "espaco-sideral", "cozinha-gourmet")
   - OBJECTS & CLOTHING: specific items visible (ex: "colete-tatico", "bisturi", "capacete", "blazer-bege", "ipad")
   - POP CULTURE / FILM REFERENCES: related movies, series, characters (ex: "tropa-de-elite", "capitao-nascimento", "matrix", "john-wick")
   - MOOD/EMOTION of the scene (ex: "tensao", "alegria", "misterio", "romance")
   
   STRICTLY FORBIDDEN tags (NEVER generate these):
   - Photography/camera terms: "fotografia", "foto", "camera", "lente", "bokeh", "profundidade-de-campo"
   - Lighting terms: "iluminacao", "luz", "sombra", "contraluz", "golden-hour", "luz-natural"
   - Rendering/quality terms: "8k", "4k", "ultra-realista", "realista", "hiper-realista", "fine-art", "alta-resolucao", "hd"
   - Generic terms: "retrato", "pessoa", "rosto", "imagem", "mulher", "homem", "cenario", "profissional"
   
   Tags MUST be in kebab-case (lowercase, hyphens instead of spaces, no accents). Example: "capitao-nascimento" not "Capitão Nascimento"
4. The most appropriate category for this prompt based on its content

Available categories (use EXACTLY one of these IDs):
- "retrato-realista" = Realistic Portrait (realistic human portraits, headshots, lifelike faces)
- "foto-artistica" = Artistic Photo (artistic/creative photography, abstract, surreal imagery)
- "moda-estilo" = Fashion & Style (fashion, clothing, style, outfits, runway)
- "cenarios" = Scenery (landscapes, nature scenes, environments, backgrounds)
- "profile" = Profile / Avatar (profile pictures, avatars, icons for social accounts)
- "social-media" = Social Media (posts, stories, social media content)
- "video-effect" = Video Effect (video-related effects, animations, motion)
- "body-art" = Body Painting (body art, tattoo, body painting)
- "fotografia" = Photography (general photography, camera shots, photographic techniques)
- "arte-digital" = Digital Art (digital illustrations, digital paintings, CG art)
- "infographic" = Infographic (infographics, data visualization, charts)
- "youtube" = YouTube Thumbnail (YouTube thumbnails, video covers)
- "comics" = Comics / Storyboard (comics, manga, storyboards, sequential art)
- "poster" = Poster / Flyer (posters, flyers, event banners)
- "app-design" = App / Web Design (UI/UX, app interfaces, web design)
- "logo-marca" = Logo / Brand (logos, branding, brand identity)
- "outro" = Other (anything that doesn't fit above)

IMPORTANT: Analyze the prompt content carefully to choose the RIGHT category. Do NOT default to "profile". 
- If the prompt describes a woman/man in a scene or artistic setting, it's likely "foto-artistica" or "retrato-realista", NOT "profile".
- "profile" is ONLY for prompts specifically about profile pictures or avatars.
- If it involves fashion/clothing focus, use "moda-estilo".
- If it's a landscape or environment, use "cenarios".

Respond using the generate_meta tool.`,
          },
          {
            role: "user",
            content: `Prompt: "${prompt}"`,
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "generate_meta",
              description: "Return title, description, tags and category for the prompt",
              parameters: {
                type: "object",
                properties: {
                  title: { type: "string", description: "Creative title in Portuguese, max 60 chars" },
                  description: { type: "string", description: "SEO description in Portuguese, max 155 chars" },
                  tags: {
                    type: "array",
                    items: { type: "string" },
                    description: "5-8 contextual visual tags in kebab-case Portuguese (e.g. blazer-bege, oculos-escuros). NO generic terms like retrato, pessoa, foto.",
                  },
                  category: { 
                    type: "string", 
                    description: "The category ID that best fits this prompt. Must be one of: retrato-realista, foto-artistica, moda-estilo, cenarios, profile, social-media, video-effect, body-art, fotografia, arte-digital, infographic, youtube, comics, poster, app-design, logo-marca, outro",
                  },
                },
                required: ["title", "description", "tags", "category"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "generate_meta" } },
      }),
    });

    if (!response.ok) {
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded" }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      return new Response(JSON.stringify({ error: "No tool call in response" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const result = JSON.parse(toolCall.function.arguments);
    
    // Normalize tags to kebab-case
    if (result.tags && Array.isArray(result.tags)) {
      result.tags = result.tags.map((tag: string) =>
        tag
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^a-z0-9-]/g, "")
          .replace(/-+/g, "-")
          .replace(/^-|-$/g, "")
      );
      console.log("[TagGenerator] Tags recebidas da IA:", result.tags);
    }
    
    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
