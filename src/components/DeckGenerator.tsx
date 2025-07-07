import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ArrowUp, Upload, FileText, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DeckGeneratorProps {
  onBack: () => void;
}

interface FormData {
  companyName: string;
  industry: string;
  buyerPersona: string[];
  mainPainPoint: string;
  useCase: string;
  logo?: File;
  exportFormat: string;
}

const DeckGenerator = ({ onBack }: DeckGeneratorProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState<FormData>({
    companyName: "",
    industry: "",
    buyerPersona: [],
    mainPainPoint: "",
    useCase: "",
    exportFormat: "powerpoint"
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [deckGenerated, setDeckGenerated] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  const industries = [
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
  ];

  const personas = [
    "CEO/Founder",
    "CMO",
    "CTO",
    "Head of Sales",
    "Head of Procurement",
    "VP of Operations",
    "CFO",
    "Product Manager",
    "Other"
  ];

  const useCases = [
    "Outbound Sales Pitch",
    "Fundraising Presentation",
    "Partnership Proposal",
    "Product Demo",
    "Company Overview",
    "Investor Update",
    "Board Presentation"
  ];

  const handlePersonaChange = (persona: string) => {
    setFormData(prev => ({
      ...prev,
      buyerPersona: prev.buyerPersona.includes(persona)
        ? prev.buyerPersona.filter(p => p !== persona)
        : [...prev.buyerPersona, persona]
    }));
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, logo: file }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.companyName || !formData.industry || !formData.useCase) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);

    try {
      const response = await fetch("https://pitchperfect-1.onrender.com/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          company_name: formData.companyName,
          industry: formData.industry,
          persona: formData.buyerPersona.join(", "),
          pain_point: formData.mainPainPoint,
          use_case: formData.useCase
        })
      });

      const result = await response.json();

      if (response.ok && result.download_url) {
        setDeckGenerated(true);
        setDownloadUrl(result.download_url);
        toast({
          title: "Deck Generated Successfully!",
          description: "Your personalized sales deck is ready for download."
        });
      } else {
        throw new Error(result.error || "Failed to generate deck.");
      }
    } catch (error: any) {
      toast({
        title: "Generation Failed",
        description: error.message || "There was an error generating your deck.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (downloadUrl) {
      window.open(downloadUrl, "_blank");
      toast({
        title: "Download Started",
        description: "Your deck is being downloaded."
      });
    } else {
      toast({
        title: "No Deck Found",
        description: "Please generate a deck first.",
        variant: "destructive"
      });
    }
  };

  if (deckGenerated && downloadUrl) {
    return (
      <div>
        <p>Your deck is ready!</p>
        <Button onClick={handleDownload}>Download Deck</Button>
      </div>
    );
  }

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <Input
          placeholder="Company Name"
          value={formData.companyName}
          onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
        />
        <Button type="submit" disabled={isGenerating}>
          {isGenerating ? "Generating..." : "Create Deck"}
        </Button>
      </form>
    </div>
  );
};

export default DeckGenerator;
