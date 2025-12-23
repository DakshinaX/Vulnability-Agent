
import { GoogleGenAI, Type } from "@google/genai";
import { SYSTEM_INSTRUCTION } from "../constants";
import { ScanResult, Severity, Vulnerability } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const analyzeSecurity = async (
  target: string,
  content: string,
  type: 'Code' | 'Architecture' | 'Endpoint'
): Promise<Partial<ScanResult>> => {
  const model = 'gemini-3-pro-preview';
  
  const response = await ai.models.generateContent({
    model,
    contents: `Analyze the following ${type} for security vulnerabilities:
    
    Target Name: ${target}
    Content:
    ${content}`,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          summary: { 
            type: Type.STRING, 
            description: "An executive summary of the overall security posture." 
          },
          vulnerabilities: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                severity: { 
                    type: Type.STRING,
                    enum: ['Low', 'Medium', 'High', 'Critical']
                },
                cweId: { type: Type.STRING },
                location: { type: Type.STRING },
                impact: { type: Type.STRING },
                remediation: { type: Type.STRING },
                confidenceScore: { type: Type.NUMBER }
              },
              required: ["title", "description", "severity", "impact", "remediation", "confidenceScore"]
            }
          }
        },
        required: ["summary", "vulnerabilities"]
      }
    }
  });

  try {
    const data = JSON.parse(response.text || '{}');
    return {
      summary: data.summary,
      vulnerabilities: data.vulnerabilities.map((v: any, index: number) => ({
        ...v,
        id: `vuln-${Date.now()}-${index}`
      })),
      status: 'Completed'
    };
  } catch (error) {
    console.error("Failed to parse Gemini response", error);
    throw new Error("Invalid response from security agent.");
  }
};
