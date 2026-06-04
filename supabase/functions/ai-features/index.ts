import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const path = url.pathname.replace("/ai-features", "");

    if (path === "/extract-skills" && req.method === "POST") {
      return await extractSkills(req);
    }

    if (path === "/match-job" && req.method === "POST") {
      return await matchJob(req);
    }

    return new Response(JSON.stringify({ error: "Not found" }), {
      status: 404,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

async function extractSkills(req: Request): Promise<Response> {
  const { resumeText } = await req.json();

  if (!resumeText || typeof resumeText !== "string") {
    return new Response(JSON.stringify({ error: "resumeText is required" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const openaiKey = Deno.env.get("OPENAI_API_KEY");

  if (!openaiKey) {
    // Fallback: simple keyword extraction without OpenAI
    const skills = fallbackExtractSkills(resumeText);
    return new Response(JSON.stringify({ skills }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${openaiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "You are a resume parser. Extract only technical and professional skills from the given resume text. Return a JSON array of skill strings, nothing else. Example: [\"JavaScript\", \"React\", \"Node.js\"]",
        },
        {
          role: "user",
          content: `Extract skills from this resume:\n\n${resumeText.slice(0, 3000)}`,
        },
      ],
      temperature: 0.1,
      max_tokens: 500,
    }),
  });

  if (!response.ok) {
    const skills = fallbackExtractSkills(resumeText);
    return new Response(JSON.stringify({ skills }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content?.trim() ?? "[]";

  let skills: string[] = [];
  try {
    skills = JSON.parse(content);
  } catch {
    skills = fallbackExtractSkills(resumeText);
  }

  return new Response(JSON.stringify({ skills }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function matchJob(req: Request): Promise<Response> {
  const { resumeSkills, jobSkills } = await req.json();

  if (!Array.isArray(resumeSkills) || !Array.isArray(jobSkills)) {
    return new Response(
      JSON.stringify({ error: "resumeSkills and jobSkills arrays are required" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  if (jobSkills.length === 0) {
    return new Response(JSON.stringify({ matchPercentage: 0, matchedSkills: [], missingSkills: [] }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const normalizedResume = resumeSkills.map((s: string) => s.toLowerCase().trim());
  const normalizedJob = jobSkills.map((s: string) => s.toLowerCase().trim());

  const matched: string[] = [];
  const missing: string[] = [];

  for (const skill of normalizedJob) {
    const found = normalizedResume.some(
      (rs) => rs.includes(skill) || skill.includes(rs)
    );
    if (found) {
      matched.push(skill);
    } else {
      missing.push(skill);
    }
  }

  const matchPercentage = Math.round((matched.length / normalizedJob.length) * 100);

  return new Response(
    JSON.stringify({ matchPercentage, matchedSkills: matched, missingSkills: missing }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

function fallbackExtractSkills(text: string): string[] {
  const commonSkills = [
    "javascript", "typescript", "python", "java", "c++", "c#", "ruby", "go", "rust", "kotlin",
    "react", "vue", "angular", "svelte", "nextjs", "nuxtjs", "express", "fastapi", "django",
    "spring", "node.js", "nodejs", "deno", "flask",
    "sql", "postgresql", "mysql", "mongodb", "redis", "elasticsearch", "sqlite",
    "docker", "kubernetes", "aws", "azure", "gcp", "terraform", "ansible",
    "git", "ci/cd", "jenkins", "github actions", "linux", "bash",
    "machine learning", "deep learning", "tensorflow", "pytorch", "scikit-learn",
    "html", "css", "tailwind", "sass", "graphql", "rest", "api",
    "agile", "scrum", "jira", "figma", "photoshop",
  ];

  const lower = text.toLowerCase();
  const found: string[] = [];

  for (const skill of commonSkills) {
    if (lower.includes(skill)) {
      found.push(skill.charAt(0).toUpperCase() + skill.slice(1));
    }
  }

  return [...new Set(found)].slice(0, 20);
}
