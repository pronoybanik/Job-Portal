import express from "express";
import cloudinary from "cloudinary";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
dotenv.config();

const router = express.Router();

router.post("/upload", async (req, res) => {
  try {
    // Handle file upload logic here
    const { buffer, public_id } = req.body;

    if (public_id) {
      await cloudinary.v2.uploader.destroy(public_id);
    }

    const uploadResponse = await cloudinary.v2.uploader.upload(buffer);

    res.json({
      url: uploadResponse.secure_url,
      public_id: uploadResponse.public_id,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

const ai = new GoogleGenAI({ apiKey: process.env.API_Key_GEMINI });

const getProviderErrorStatus = (error: unknown): number | undefined => {
  if (typeof error === "object" && error !== null) {
    if ("status" in error) {
      const status = Number(error.status);
      if (Number.isFinite(status)) return status;
    }
  }

  if (error instanceof Error) {
    const match = error.message.match(/"code":(\d+)/);
    if (match) return Number(match[1]);
  }

  return undefined;
};

const sleep = (milliseconds: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, milliseconds));

const generateCareerResponse = async (prompt: string) => {
  const configuredModel = process.env.GEMINI_MODEL;
  const models = [
    configuredModel || "gemini-3.8-flash",
    "gemini-3.5-flash",
  ].filter((model, index, all) => all.indexOf(model) === index);

  let lastError: unknown;

  for (const model of models) {
    for (let attempt = 1; attempt <= 3; attempt += 1) {
      try {
        return await ai.models.generateContent({
          model,
          contents: prompt,
        });
      } catch (error: unknown) {
        lastError = error;
        const status =
          typeof error === "object" && error !== null && "status" in error
            ? Number(error.status)
            : undefined;

        if (status !== 503 && status !== 429) break;
        await sleep(attempt * 750);
      }
    }
  }

  throw lastError;
};

router.post("/career", async (req, res) => {
  try {
    const body =
      req.body && typeof req.body === "object"
        ? (req.body as Record<string, unknown>)
        : {};
    const skills =
      typeof body.skills === "string" ? body.skills.trim() : undefined;

    if (!skills) {
      return res.status(400).json({
        message: "Skill is Required",
      });
    }

    const prompt = `
Based on the following skills: ${skills}.
Please act as a career advisor and generate a career path suggestion.
Your entire response must be in a valid JSON format. Do not include any text or markdown
formatting outside of the JSON structure.
The JSON object should have the following structure:
{
"summary": "A brief, encouraging summary of the user's skill set and their general job
title.",
"jobOptions": [
{
"title": "The name of the job role.",
"responsibilities": "A description of what the user would do in this role.",
"why": "An explanation of why this role is a good fit for their skills."
}
],
"skillsToLearn": [
{
"category": "A general category for skill improvement (e.g., 'Deepen Your Existing Stack
Mastery', 'DevOps & Cloud').",
"skills": [
{
"title": "The name of the skill to learn.",
"why": "Why learning this skill is important.",
"how": "Specific examples of how to learn or apply this skill."
}
]
}
],
"learningApproach": {
"title": "How to Approach Learning",
"points": ["A bullet point list of actionable advice for learning."]
}
}
`;

    const response = await generateCareerResponse(prompt);

    let jsonResponse: unknown;

    try {
      const rawText = response.text
        ?.replace(/```json/gi, "")
        .replace(/```/g, "")
        .trim();

      if (!rawText) {
        throw new Error("AI did not return a valid JSON string");
      }

      jsonResponse = JSON.parse(rawText);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Failed to parse AI response";
      return res.status(500).json({
        message,
      });
    }

    return res.status(200).json(jsonResponse);
  } catch (error) {
    console.error("Gemini career request failed:", error);
    const status =
      typeof error === "object" && error !== null && "status" in error
        ? Number(error.status)
        : undefined;

    if (status === 503 || status === 429) {
      return res.status(503).json({
        message:
          "The AI service is temporarily busy. Please wait a moment and try again.",
      });
    }

    return res.status(500).json({
      message: "Unable to generate career advice right now.",
    });
  }
});

router.post("/resume-analyser", async (req, res) => {
  try {
    const body =
      req.body && typeof req.body === "object"
        ? (req.body as Record<string, unknown>)
        : {};
    const pdf =
      typeof body.pdf === "string"
        ? body.pdf
        : typeof body.pdfBase64 === "string"
          ? body.pdfBase64
          : undefined;

    if (!pdf) {
      return res.status(400).json({ message: "PDF data is required" });
    }

    const pdfBase64 = pdf.replace(/^data:application\/pdf;base64,/i, "");
    const pdfBuffer = Buffer.from(pdfBase64, "base64");

    if (
      pdfBuffer.length === 0 ||
      pdfBuffer.subarray(0, 4).toString("ascii") !== "%PDF"
    ) {
      return res.status(400).json({ message: "Invalid PDF data" });
    }

    if (pdfBuffer.length > 10 * 1024 * 1024) {
      return res.status(400).json({
        message: "Resume PDF must be 10 MB or smaller",
      });
    }

    const prompt = `
You are an expert ATS (Applicant Tracking System) analyzer. Analyze the following resume
and provide:
1. An ATS compatibility score (0-100)
2. Detailed suggestions to improve the resume for better ATS performance
Your entire response must be in valid JSON format. Do not include any text or markdown
formatting outside of the JSON structure.
The JSON object should have the following structure:

{
"atsScore": 85,
"scoreBreakdown": {
"formatting": {
"score": 90,
"feedback": "Brief feedback on formatting"
},
"keywords": {
"score": 80,
"feedback": "Brief feedback on keyword usage"
},
"structure": {
"score": 85,
"feedback": "Brief feedback on resume structure"
},
"readability": {
"score": 88,
"feedback": "Brief feedback on readability"
}
},
"suggestions": [
{
"category": "Category name (e.g., 'Formatting', 'Content', 'Keywords',
'Structure')",
"issue": "Description of the issue found",
"recommendation": "Specific actionable recommendation to fix it",
"priority": "high/medium/low"
}
],
"strengths": [
"List of things the resume does well for ATS"
],
"summary": "A brief 2-3 sentence summary of the overall ATS performance"
}
Focus on:
- File format and structure compatibility
- Proper use of standard section headings
- Keyword optimization
- Formatting issues (tables, columns, graphics, special characters)
- Contact information placement
- Date formatting
- Use of action verbs and quantifiable achievements
- Section organization and flow
`;
    const response = await ai.models.generateContent({
      model: process.env.GEMINI_MODEL || "gemini-3.5-flash",
      contents: [
        {
          role: "user",
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType: "application/pdf",
                data: pdfBase64,
              },
            },
          ],
        },
      ],
    });

    let jsonResponse: unknown;

    try {
      const rawText = response.text
        ?.replace(/```json/gi, "")
        .replace(/```/g, "")
        .trim();

      if (!rawText) {
        throw new Error("AI did not return a valid JSON string");
      }

      jsonResponse = JSON.parse(rawText);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Failed to parse AI response";
      return res.status(500).json({
        message,
      });
    }

    return res.status(200).json(jsonResponse);
  } catch (error: unknown) {
    console.error("Gemini resume analysis failed:", error);
    const status = getProviderErrorStatus(error);

    if (status === 503 || status === 429) {
      return res.status(503).json({
        message:
          "The AI service is temporarily busy. Please wait and try again.",
      });
    }

    if (status === 400) {
      return res.status(400).json({
        message: "Gemini could not process the provided PDF",
      });
    }

    return res.status(500).json({
      message: "Unable to analyze the resume right now",
    });
  }
});

export default router;
