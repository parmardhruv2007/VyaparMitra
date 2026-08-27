import { GoogleGenAI, Type, Schema } from "@google/genai";
import { BusinessInputData, MarketData, SwotAndRisk, FeasibilityReport } from "./apiServices";

// Initialize with environment variable. Fallback to empty to gracefully handle missing key in UI.
const apiKey = import.meta.env.VITE_GEMINI_API_KEY || "";
const ai = new GoogleGenAI(apiKey ? { apiKey } : {});

export interface GeneratedReport {
  marketData: MarketData;
  swotAndRisk: SwotAndRisk;
  feasibilityReport: FeasibilityReport;
}

// System prompt "training" the model to act as a specialized AI rural business advisor
const SYSTEM_PROMPT = `
You are VyaparMitra, a highly specialized, hyper-local AI Business Advisory and Financial Structuring Assistant for Rural Micro-Entrepreneurs in India.

Your primary goal is to evaluate proposed business plans and provide data-driven, localized strategy and feasibility reports based on the entrepreneur's geographic location (Village/Block/District), available margin capital, and chosen business category.

You must output a highly detailed, realistic, and specific assessment encompassing:
1. Market Reach: Immediate consumer base (5-10km radius) and primary distribution channels.
2. Opportunity Analysis: Unserved/underserved niches in the local economy.
3. General Business Analysis (SWOT): Tailored to micro-enterprise budget.
4. Threats Identification: Local risks (supply chain, seasonal fluctuations, single buyer dependency).
5. Competitor Mapping: Estimated density of similar businesses based on demographic/economic estimates.
6. Product Market Value: Optimal pricing strategies based on regional purchasing power.

Adopt an encouraging, professional, and culturally sensitive tone. 
Your output MUST perfectly match the requested JSON schema structure.
`;

const reportSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    marketData: {
      type: Type.OBJECT,
      properties: {
        consumerBase5to10km: { type: Type.INTEGER, description: "Estimated population/consumer base in a 5-10km radius" },
        distributionChannels: { type: Type.ARRAY, items: { type: Type.STRING }, description: "3-4 optimal distribution channels" },
        unservedNiches: { type: Type.ARRAY, items: { type: Type.STRING }, description: "2-3 unserved market niches" },
        competitorDensity: { type: Type.STRING, enum: ["Low", "Medium", "High"] },
        competitorCount: { type: Type.INTEGER },
        suggestedPricing: { type: Type.STRING, description: "Text explaining optimal pricing strategy" },
        purchasingPowerIdx: { type: Type.STRING, description: "E.g., 'Low-to-Medium', 'Moderate'" },
      },
      required: ["consumerBase5to10km", "distributionChannels", "unservedNiches", "competitorDensity", "competitorCount", "suggestedPricing", "purchasingPowerIdx"]
    },
    swotAndRisk: {
      type: Type.OBJECT,
      properties: {
        strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
        weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
        opportunities: { type: Type.ARRAY, items: { type: Type.STRING } },
        threats: { type: Type.ARRAY, items: { type: Type.STRING } },
        localRisks: { type: Type.ARRAY, items: { type: Type.STRING }, description: "2-3 specific hyper-local risks" },
      },
      required: ["strengths", "weaknesses", "opportunities", "threats", "localRisks"]
    },
    feasibilityReport: {
      type: Type.OBJECT,
      properties: {
        viabilityScore: { type: Type.INTEGER, description: "Score out of 100" },
        overallVerdict: { type: Type.STRING, enum: ["Highly Viable", "Moderately Viable", "Requires Restructuring", "High Risk"] },
        recommendation: { type: Type.STRING, description: "1-2 paragraph executive summary and recommendation" },
        marketInsights: { type: Type.STRING, description: "1 paragraph summarizing the local market opportunity" },
        keyActionItems: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Top 3-4 immediate action items before applying for the loan" },
      },
      required: ["viabilityScore", "overallVerdict", "recommendation", "marketInsights", "keyActionItems"]
    }
  },
  required: ["marketData", "swotAndRisk", "feasibilityReport"]
};

export const aiAdvisorService = {
  /**
   * Generates a hyper-local business feasibility report using Gemini LLM.
   */
  async generateFeasibilityReport(input: BusinessInputData): Promise<GeneratedReport> {
    if (!apiKey) {
      console.warn("No VITE_GEMINI_API_KEY found. Returning mock structured data.");
      return getMockReport(input);
    }

    try {
      const prompt = `Evaluate a proposed micro-enterprise with the following parameters:
      - Business Category: ${input.category}
      - Location: Village: ${input.village}, Block: ${input.block}, District: ${input.district}, State: ${input.state}
      - Available Margin Capital: ₹${input.marginCapital}
      
      Generate a realistic, localized hyper-local business feasibility report for this specific geography and business type.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: prompt,
        config: {
          systemInstruction: SYSTEM_PROMPT,
          responseMimeType: 'application/json',
          responseSchema: reportSchema,
          temperature: 0.7,
        }
      });

      if (!response.text) {
        throw new Error("Empty response from AI model");
      }

      const data = JSON.parse(response.text) as GeneratedReport;
      // Inject assessment ID 
      data.feasibilityReport.assessmentId = input.assessmentId || `ASMT-${Date.now()}`;
      return data;
      
    } catch (error: any) {
      console.error("AI Generation Failed:", error);
      throw new Error(`AI API Error: ${error.message || "Failed to generate report"}`);
    }
  },

  /**
   * Generates a dynamic chat response for the AI Advisor interface
   */
  async generateChatResponse(input: BusinessInputData, userMessage: string, chatHistory: string = ""): Promise<string> {
    if (!apiKey) {
      return getMockChatResponse(input, userMessage);
    }

    try {
      const prompt = `
      Context: The entrepreneur is setting up a "${input.category}" business in ${input.village} (${input.block}, ${input.district}). 
      Their margin capital is ₹${input.marginCapital}.
      
      Chat History: ${chatHistory}
      
      User asks: "${userMessage}"
      
      Respond directly, concisely, and helpfully acting as their AI Rural Business Advisor. Address their specific hyper-local context.
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: prompt,
        config: {
          systemInstruction: "You are an expert AI rural business advisor. Provide short, practical, and highly localized advice.",
          temperature: 0.6,
        }
      });

      return response.text || "I'm sorry, I couldn't process that request.";
    } catch (error: any) {
      console.error("AI Chat Generation Failed:", error);
      return `Connection Issue: ${error.message || "Failed to connect to AI server. Please check your API key."}`;
    }
  }
};

// --- MOCK FALLBACKS FOR UI TESTING ---

function getMockReport(input: BusinessInputData): GeneratedReport {
  return {
    marketData: {
      consumerBase5to10km: 15400,
      distributionChannels: ["Direct-to-Consumer via Village Kiosks", "Local Weekly Haat (Market)", "Regional Wholesale Distributors"],
      unservedNiches: ["Premium quality localized packaging", "Home delivery within 5km radius"],
      competitorDensity: "Medium",
      competitorCount: 4,
      suggestedPricing: "Penetration pricing: 5-10% lower than established district brands to build initial volume.",
      purchasingPowerIdx: "Moderate"
    },
    swotAndRisk: {
      strengths: ["Strong local demand", "Low overhead costs", "Direct access to raw materials"],
      weaknesses: ["Limited initial marketing budget", "Lack of formal logistics network"],
      opportunities: ["Government subsidy schemes", "Expanding to adjacent blocks in year 2"],
      threats: ["Established larger competitors from city center", "Seasonal raw material price fluctuations"],
      localRisks: ["Dependency on single transport vendor", "Monsoon disruption to rural roads"]
    },
    feasibilityReport: {
      assessmentId: input.assessmentId || `ASMT-MOCK`,
      viabilityScore: 82,
      overallVerdict: "Highly Viable",
      recommendation: `Setting up a ${input.category} unit in ${input.village} is highly viable given the moderate purchasing power and unsaturated niches. With your capital of ₹${input.marginCapital}, focusing on direct B2B tie-ups will yield the best ROI.`,
      marketInsights: `The ${input.block} area shows strong latent demand for quality ${input.category} products, primarily dominated by unbranded local alternatives.`,
      keyActionItems: ["Finalize lease for local storage facility", "Register for Udyam portal", "Secure quotation for primary machinery"]
    }
  };
}

function getMockChatResponse(input: BusinessInputData, userMessage: string): string {
  const lower = userMessage.toLowerCase();
  if (lower.includes("risk") || lower.includes("threat") || lower.includes("problem")) {
    return `In ${input.block} block, local risks for ${input.category} include seasonal supply bottlenecks. We recommend installing a small power backup unit and forming direct B2B tie-ups.`;
  } else if (lower.includes("loan") || lower.includes("scheme") || lower.includes("bank")) {
    return `Based on your margin of ₹${input.marginCapital}, you qualify for the relevant scheme offering 90% financing. You also get a moratorium grace period before principal repayments begin!`;
  } else if (lower.includes("price") || lower.includes("market") || lower.includes("competitor")) {
    return `Based on regional purchasing power in ${input.district}, your recommended pricing per unit gives a 15-20% margin above local production cost. Competitor density is currently Moderate.`;
  } else {
    return `That's a great question about your ${input.category} business in ${input.village}. I recommend proceeding carefully with your financial plan and securing your supply chain first.`;
  }
}
