import React, { createContext, useContext, useState, useCallback } from "react";
import { aiAdvisorService } from "../services/aiAdvisorService";

export interface BusinessInputData {
  state: string;
  district: string;
  block: string;
  village: string;
  marginCapital: number; // in INR (e.g. 15000)
  category: string;
  language: string;
}

export interface SchemeDetails {
  name: string;
  maxProjectCost: string;
  agencyFinancing: string;
  maxLoan: number;
  interestRate: number;
  tenureYears: number;
  moratoriumMonths: number;
  code: "MICRO" | "TERM";
}

export interface FinancialCalculation {
  marginCapital: number;
  projectCost: number;
  maxLoanAmount: number;
  userContribution: number;
  scheme: SchemeDetails;
  quarterlyEmi: number;
  monthlyEmi: number;
  totalRepayment: number;
}

export interface MarketData {
  consumerBase5to10km: number;
  distributionChannels: string[];
  unservedNiches: string[];
  competitorDensity: "Low" | "Medium" | "High";
  competitorCount: number;
  suggestedPricing: string;
  purchasingPowerIdx: string;
}

export interface SwotAndRisk {
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
  localRisks: string[];
}

export interface FeasibilityReport {
  viabilityScore: number; // 0 to 100
  overallVerdict: "Highly Viable" | "Moderately Viable" | "Requires Restructuring" | "High Risk";
  recommendation: string;
  marketInsights: string;
  keyActionItems: string[];
}

interface VyaparContextType {
  input: BusinessInputData;
  setInput: React.Dispatch<React.SetStateAction<BusinessInputData>>;
  financials: FinancialCalculation;
  market: MarketData;
  swot: SwotAndRisk;
  report: FeasibilityReport;
  updateInput: (fields: Partial<BusinessInputData>) => void;
  generateReport: (data: BusinessInputData) => Promise<void>;
  isGenerating: boolean;
}

// Helper to compute financial calculations according to PRD Rules
export const computeFinancials = (margin: number): FinancialCalculation => {
  // Core calculation: Project Cost = Available Margin Capital / 10%
  const projectCost = margin / 0.1;
  const rawLoan = projectCost * 0.9;

  let scheme: SchemeDetails;

  if (projectCost <= 140000) {
    // Micro Finance Scheme (Up to 1.40 lakh project cost)
    scheme = {
      name: "Micro Finance Scheme",
      maxProjectCost: "Up to ₹1.40 Lakh",
      agencyFinancing: "Up to 90%",
      maxLoan: 125000,
      interestRate: 6.5,
      tenureYears: 3,
      moratoriumMonths: 3,
      code: "MICRO",
    };
  } else {
    // Term Loan Scheme (₹1.40 Lakh to ₹50 Lakh)
    scheme = {
      name: "Term Loan Scheme",
      maxProjectCost: "₹1.40 Lakh to ₹50 Lakh",
      agencyFinancing: "Up to 90%",
      maxLoan: 4500000,
      interestRate: 8.0,
      tenureYears: 7,
      moratoriumMonths: 6,
      code: "TERM",
    };
  }

  const maxLoanAmount = Math.min(rawLoan, scheme.maxLoan);
  const r = scheme.interestRate / 100 / 12;
  const n = scheme.tenureYears * 12;
  
  // Standard EMI formula
  const monthlyEmi = Math.round((maxLoanAmount * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1)) || 0;
  const quarterlyEmi = monthlyEmi * 3;
  const totalRepayment = monthlyEmi * n;

  return {
    marginCapital: margin,
    projectCost: Math.round(projectCost),
    maxLoanAmount: Math.round(maxLoanAmount),
    userContribution: Math.round(margin),
    scheme,
    monthlyEmi,
    quarterlyEmi,
    totalRepayment: Math.round(totalRepayment),
  };
};

const defaultInput: BusinessInputData = {
  state: "Gujarat",
  district: "Ahmedabad",
  block: "Sanand",
  village: "Changodar",
  marginCapital: 25000,
  category: "Dairy & Livestock",
  language: "Gujarati",
};

const defaultMarket: MarketData = {
  consumerBase5to10km: 18500,
  distributionChannels: ["Direct to Local Mandi", "Dairy Cooperatives", "Doorstep Retail Delivery", "Local Sweet Shops"],
  unservedNiches: ["Organic A2 Milk Packaging", "Value-added Ghee & Paneer", "Cold Storage Aggregation"],
  competitorDensity: "Medium",
  competitorCount: 4,
  suggestedPricing: "₹58 - ₹64 per Litre (A2 Premium: ₹75/L)",
  purchasingPowerIdx: "Moderate-High (Semi-Urban Peripheral)",
};

const defaultSwot: SwotAndRisk = {
  strengths: [
    "High local daily demand for fresh dairy products",
    "Availability of fodder and water resources within 5km radius",
    "Immediate cash-flow generation capability",
  ],
  weaknesses: [
    "Initial high cost of high-yield cattle breeds",
    "Lack of immediate captive refrigerated transportation",
  ],
  opportunities: [
    "Government subsidy scheme integration under NABARD Dairy Plan",
    "Direct B2B supply tie-ups with nearby Ahmedabad highway restaurants",
    "Expansion into curd and butter products during summer season",
  ],
  threats: [
    "Seasonal feed price fluctuations during dry summer months",
    "Competition from established large dairy brands in retail stores",
  ],
  localRisks: [
    "Supply-chain bottleneck during monsoon road waterlogging",
    "Dependence on 1-2 major village milk collection centers",
    "Power outages affecting milk chilling vats without solar backup",
  ],
};

const defaultReport: FeasibilityReport = {
  viabilityScore: 84,
  overallVerdict: "Highly Viable",
  recommendation:
    "The proposed Dairy & Livestock unit in Sanand block has strong demand parameters and high consumer density within a 7 km radius. Available margin capital of ₹25,000 unlocks a total feasible project setup of ₹2,50,000 under the Term Loan Scheme with 90% agency financing (₹2,25,000 loan at 8.0% interest).",
  marketInsights:
    "Local market analysis reveals underserved demand for packaged quality milk and paneer near regional highway food hubs.",
  keyActionItems:
    [
      "Apply for Term Loan Scheme via local Gramin Bank branch",
      "Secure supply contract with local dairy collection hub",
      "Invest ₹40,000 of project cost in solar power backup for chilling",
      "Utilize the 6-month moratorium period to build stable herd capacity",
    ],
};

const VyaparContext = createContext<VyaparContextType | undefined>(undefined);

export const VyaparProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [input, setInput] = useState<BusinessInputData>(defaultInput);
  const [financials, setFinancials] = useState<FinancialCalculation>(() => computeFinancials(defaultInput.marginCapital));
  
  const [market, setMarket] = useState<MarketData>(defaultMarket);
  const [swot, setSwot] = useState<SwotAndRisk>(defaultSwot);
  const [report, setReport] = useState<FeasibilityReport>(defaultReport);
  const [isGenerating, setIsGenerating] = useState(false);

  const updateInput = (fields: Partial<BusinessInputData>) => {
    setInput((prev) => {
      const updated = { ...prev, ...fields };
      if (fields.marginCapital !== undefined) {
        setFinancials(computeFinancials(fields.marginCapital));
      }
      return updated;
    });
  };

  const generateReport = useCallback(async (data: BusinessInputData) => {
    setIsGenerating(true);
    try {
      const generated = await aiAdvisorService.generateFeasibilityReport(data);
      setMarket(generated.marketData);
      setSwot(generated.swotAndRisk);
      setReport(generated.feasibilityReport);
    } catch (error) {
      console.error("Failed to generate report:", error);
      // Fallback to defaults or keep existing state
    } finally {
      setIsGenerating(false);
    }
  }, []);

  return (
    <VyaparContext.Provider
      value={{
        input,
        setInput,
        financials,
        market,
        swot,
        report,
        updateInput,
        generateReport,
        isGenerating
      }}
    >
      {children}
    </VyaparContext.Provider>
  );
};

export const useVyapar = () => {
  const context = useContext(VyaparContext);
  if (!context) {
    throw new Error("useVyapar must be used within a VyaparProvider");
  }
  return context;
};
