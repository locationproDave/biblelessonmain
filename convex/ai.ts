"use node";
import { action } from "./_generated/server";
import { v } from "convex/values";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY!;
const OPENAI_URL = "https://api.openai.com/v1/chat/completions";

export const chat = action({
  args: {
    messages: v.array(v.object({
      role: v.union(v.literal("system"), v.literal("user"), v.literal("assistant")),
      content: v.string(),
    })),
  },
  handler: async (ctx, { messages }) => {
    const response = await fetch(OPENAI_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        messages,
      }),
    });
    if (!response.ok) throw new Error(`AI request failed: ${response.status}`);
    const data = await response.json();
    return { content: data.choices?.[0]?.message?.content || "" };
  },
});

export const generateText = action({
  args: {
    prompt: v.string(),
  },
  handler: async (ctx, { prompt }) => {
    const response = await fetch(OPENAI_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        messages: [{ role: "user", content: prompt }],
      }),
    });
    if (!response.ok) throw new Error(`AI request failed: ${response.status}`);
    const data = await response.json();
    return { content: data.choices?.[0]?.message?.content || "" };
  },
});

export const generateLesson = action({
  args: {
    book: v.string(),
    chapter: v.string(),
    verse: v.string(),
    topic: v.string(),
    theme: v.string(),
    ageGroup: v.string(),
    duration: v.string(),
    format: v.string(),
    includeActivities: v.boolean(),
    includeCrafts: v.boolean(),
    includeMemoryVerse: v.boolean(),
    includeDiscussion: v.boolean(),
    includePrayer: v.boolean(),
    includeParentTakeHome: v.boolean(),
  },
  handler: async (ctx, args) => {
    const passage = args.book
      ? `${args.book}${args.chapter ? ` ${args.chapter}` : ''}${args.verse ? `:${args.verse}` : ''}`
      : 'Selected Passage';

    const topicStr = args.topic || args.theme || 'God\'s Love';
    const ageGroup = args.ageGroup || 'Elementary (6-10)';
    const duration = args.duration || '45 min';
    const format = args.format || 'Interactive';

    const includeSections: string[] = [
      'Opening & Welcome (with prayer and icebreaker)',
      'Scripture Reading (with context and key points)',
      'Teaching Time (with 3 main teaching points and visual aids)',
    ];
    if (args.includeActivities) includeSections.push('Interactive Activity (with 3-5 specific scenarios or games)');
    if (args.includeCrafts) includeSections.push('Craft Time (with step-by-step instructions)');
    if (args.includeDiscussion) includeSections.push('Discussion Questions (5 thought-provoking questions with guide notes)');
    includeSections.push('Closing & Prayer (with memory verse review and take-home challenge)');

    const systemPrompt = `You are an expert Bible teacher and curriculum designer. Generate a complete, detailed Sunday school lesson plan. Return ONLY valid JSON with no markdown formatting, no code blocks, no extra text. The JSON must match this exact structure:

{
  "title": "string - creative lesson title",
  "passage": "string - Bible reference",
  "ageGroup": "string",
  "duration": "string - total minutes",
  "format": "string",
  "theme": "string",
  "memoryVerse": { "text": "string - full verse text in quotes", "reference": "string - e.g. John 3:16 (KJV)" },
  "objectives": ["string array - 4 specific learning objectives"],
  "materialsNeeded": [{ "item": "string", "category": "essential|activity|craft|optional" }],
  "sections": [{ "title": "string", "duration": "string - e.g. 5 minutes", "icon": "string - single emoji", "type": "opening|scripture|teaching|activity|craft|discussion|closing", "content": "string - detailed content with **bold** formatting for headers, bullet points with -, and numbered lists" }],
  "parentTakeHome": { "summary": "string", "memoryVerse": "string", "discussionStarters": ["string array - 4 items"], "familyActivity": "string", "weeklyChallenge": "string" },
  "crossReferences": [{ "reference": "string", "text": "string - brief description" }],
  "teacherNotes": ["string array - 4 practical tips"],
  "description": "string - one sentence description"
}`;

    const userPrompt = `Create a ${duration} ${format.toLowerCase()} Bible lesson plan for ${ageGroup} about "${topicStr}" from ${passage}.

Include these sections: ${includeSections.join(', ')}.

${args.includeParentTakeHome ? 'Include a detailed parent take-home section.' : ''}
${args.includeMemoryVerse ? 'Include a relevant memory verse with the full text.' : ''}

Requirements:
- Content must be age-appropriate for ${ageGroup}
- Each section should have detailed, actionable content (at least 3-4 paragraphs for teaching sections, 2-3 for others)
- Teaching points should be specific to the passage, not generic
- For EACH teaching point, suggest 2-3 supporting Bible verses with full references (e.g. "See also Romans 8:28, Jeremiah 29:11")
- Include specific Bible verse quotations within the lesson content where appropriate — don't just reference them, include the actual text
- Activities should be creative and engaging
- Include 6-8 cross references to related passages throughout the Bible that reinforce the lesson theme
- All content must be biblically accurate and theologically sound
- Use **bold** for section headers within content
- Use - for bullet points
- Make the lesson practical and applicable to daily life
- Each main teaching section should be substantial — aim for 300+ words per section
- Include application questions tied to specific verses within teaching content`;

    const response = await fetch(OPENAI_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 6000,
      }),
    });

    if (!response.ok) {
      throw new Error(`AI request failed: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

    // Parse the JSON response - strip any markdown code blocks if present
    let cleaned = content.trim();
    if (cleaned.startsWith('```')) {
      cleaned = cleaned.replace(/^```(?:json)?\s*\n?/, '').replace(/\n?```\s*$/, '');
    }

    try {
      const lesson = JSON.parse(cleaned);
      return lesson;
    } catch (e) {
      // If JSON parsing fails, return the raw content for client-side handling
      throw new Error("Failed to parse AI response. Please try again.");
    }
  },
});
