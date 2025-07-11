
export interface FormData {
  companyName: string;
  industry: string;
  buyerPersona: string[];
  mainPainPoint: string;
  useCase: string;
  logo?: File;
  exportFormat: string;
}

export const INDUSTRIES = [
  "Technology/Software",
  "Healthcare",
  "Financial Services",
  "Manufacturing",
  "Retail/E-commerce",
  "Real Estate",
  "Education",
  "Consulting",
  "Marketing/Advertising",
  "Other"
] as const;

export const PERSONAS = [
  "CEO/Founder",
  "CMO",
  "CTO",
  "Head of Sales",
  "Head of Procurement",
  "VP of Operations",
  "CFO",
  "Product Manager",
  "Other"
] as const;

export const USE_CASES = [
  "Outbound Sales Pitch",
  "Fundraising Presentation",
  "Partnership Proposal",
  "Product Demo",
  "Company Overview",
  "Investor Update",
  "Board Presentation"
] as const;
