
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ArrowUp, Upload, FileText, Download, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiService, fileToBase64, downloadFile, GenerateDeckResponse } from "@/services/api";

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
  const [generatedDeck, setGeneratedDeck] = useState<GenerateDeckResponse | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

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
      // Check file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: "Please select a logo file smaller than 5MB.",
          variant: "destructive"
        });
        return;
      }
      
      // Check file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid File Type",
          description: "Please select an image file (PNG, JPG, etc.).",
          variant: "destructive"
        });
        return;
      }
      
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

    if (formData.buyerPersona.length === 0) {
      toast({
        title: "Missing Buyer Persona",
        description: "Please select at least one target buyer persona.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      // Convert logo to base64 if provided
      let logoBase64 = undefined;
      if (formData.logo) {
        logoBase64 = await fileToBase64(formData.logo);
      }

      // Prepare API request
      const request = {
        company_name: formData.companyName,
        industry: formData.industry,
        buyer_persona: formData.buyerPersona.join(", "),
        main_pain_point: formData.mainPainPoint || "Inefficient processes and lack of automation",
        use_case: formData.useCase,
        logo_base64: logoBase64
      };

      // Call API
      const response = await apiService.generateDeck(request);
      
      setGeneratedDeck(response);
      toast({
        title: "Deck Generated Successfully!",
        description: `Your personalized sales deck with ${response.slides_generated} slides is ready for download.`,
      });
      
    } catch (error) {
      console.error('Error generating deck:', error);
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "There was an error generating your deck. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = async () => {
    if (!generatedDeck) return;

    setIsDownloading(true);
    
    try {
      const blob = await apiService.downloadDeck(generatedDeck.file_id);
      downloadFile(blob, generatedDeck.filename);
      
      toast({
        title: "Download Started",
        description: "Your deck is being downloaded as a PowerPoint file.",
      });
    } catch (error) {
      console.error('Error downloading deck:', error);
      toast({
        title: "Download Failed",
        description: error instanceof Error ? error.message : "There was an error downloading your deck. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const resetForm = () => {
    setGeneratedDeck(null);
    setFormData({
      companyName: "",
      industry: "",
      buyerPersona: [],
      mainPainPoint: "",
      useCase: "",
      exportFormat: "powerpoint"
    });
  };

  if (generatedDeck) {
    const expiresAt = new Date(generatedDeck.expires_at);
    const now = new Date();
    const isExpired = now > expiresAt;

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
        <div className="container mx-auto max-w-4xl py-12">
          <Card className="shadow-2xl border-0">
            <CardHeader className="text-center pb-8">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <FileText className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-3xl font-bold text-gray-800 mb-4">
                Your Deck is Ready! 🎉
              </CardTitle>
              <p className="text-lg text-gray-600">
                We've created a personalized {formData.useCase.toLowerCase()} for {formData.companyName} targeting {formData.buyerPersona.join(", ")}.
              </p>
            </CardHeader>
            <CardContent className="text-center space-y-6">
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="font-semibold text-lg mb-4">Deck Details:</h3>
                <div className="grid md:grid-cols-2 gap-4 text-left">
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">📄 <strong>Filename:</strong> {generatedDeck.filename}</p>
                    <p className="text-sm text-gray-600">📊 <strong>Slides:</strong> {generatedDeck.slides_generated}</p>
                    <p className="text-sm text-gray-600">🎯 <strong>Industry:</strong> {formData.industry}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">👥 <strong>Target:</strong> {formData.buyerPersona.join(", ")}</p>
                    <p className="text-sm text-gray-600">📋 <strong>Use Case:</strong> {formData.useCase}</p>
                    <p className="text-sm text-gray-600">⏰ <strong>Expires:</strong> {expiresAt.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {isExpired && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-2">
                  <AlertCircle className="w-5 h-5 text-red-500" />
                  <p className="text-red-700">This download link has expired. Please generate a new deck.</p>
                </div>
              )}
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  onClick={handleDownload}
                  disabled={isDownloading || isExpired}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 text-lg rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {isDownloading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Downloading...
                    </div>
                  ) : (
                    <>
                      <Download className="w-5 h-5 mr-2" />
                      Download PowerPoint
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={resetForm}
                  className="px-8 py-3 text-lg border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-all duration-300"
                >
                  Create Another Deck
                </Button>
              </div>
              
              <Button
                variant="ghost"
                onClick={onBack}
                className="text-gray-500 hover:text-gray-700"
              >
                <ArrowUp className="w-4 h-4 mr-2 rotate-180" />
                Back to Home
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      <div className="container mx-auto max-w-4xl py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="ghost"
            onClick={onBack}
            className="text-gray-600 hover:text-gray-800"
          >
            <ArrowUp className="w-4 h-4 mr-2 rotate-180" />
            Back to Home
          </Button>
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-gradient-to-r from-blue-600 to-purple-600 rounded"></div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              DeckAI
            </span>
          </div>
        </div>

        <Card className="shadow-2xl border-0">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold text-gray-800 mb-2">
              Create Your Sales Deck
            </CardTitle>
            <p className="text-gray-600">
              Tell us about your company and we'll generate a personalized presentation
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Company Name */}
              <div className="space-y-2">
                <Label htmlFor="companyName" className="text-sm font-medium text-gray-700">
                  Company Name *
                </Label>
                <Input
                  id="companyName"
                  value={formData.companyName}
                  onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
                  placeholder="Enter your company name"
                  className="w-full"
                  required
                />
              </div>

              {/* Industry */}
              <div className="space-y-2">
                <Label htmlFor="industry" className="text-sm font-medium text-gray-700">
                  Industry *
                </Label>
                <Select onValueChange={(value) => setFormData(prev => ({ ...prev, industry: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your industry" />
                  </SelectTrigger>
                  <SelectContent>
                    {industries.map((industry) => (
                      <SelectItem key={industry} value={industry}>
                        {industry}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Buyer Persona */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">
                  Target Buyer Persona (select all that apply) *
                </Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {personas.map((persona) => (
                    <label
                      key={persona}
                      className={`flex items-center p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                        formData.buyerPersona.includes(persona)
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={formData.buyerPersona.includes(persona)}
                        onChange={() => handlePersonaChange(persona)}
                        className="mr-2"
                      />
                      <span className="text-sm">{persona}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Main Pain Point */}
              <div className="space-y-2">
                <Label htmlFor="mainPainPoint" className="text-sm font-medium text-gray-700">
                  Main Pain Point Your Product Solves
                </Label>
                <Textarea
                  id="mainPainPoint"
                  value={formData.mainPainPoint}
                  onChange={(e) => setFormData(prev => ({ ...prev, mainPainPoint: e.target.value }))}
                  placeholder="Describe the primary challenge your target customers face..."
                  rows={3}
                />
              </div>

              {/* Use Case */}
              <div className="space-y-2">
                <Label htmlFor="useCase" className="text-sm font-medium text-gray-700">
                  Use Case *
                </Label>
                <Select onValueChange={(value) => setFormData(prev => ({ ...prev, useCase: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="What type of presentation do you need?" />
                  </SelectTrigger>
                  <SelectContent>
                    {useCases.map((useCase) => (
                      <SelectItem key={useCase} value={useCase}>
                        {useCase}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Logo Upload */}
              <div className="space-y-2">
                <Label htmlFor="logo" className="text-sm font-medium text-gray-700">
                  Company Logo (Optional)
                </Label>
                <div className="flex items-center justify-center w-full">
                  <label htmlFor="logo" className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-8 h-8 mb-2 text-gray-500" />
                      <p className="mb-2 text-sm text-gray-500">
                        <span className="font-semibold">Click to upload</span> your logo
                      </p>
                      <p className="text-xs text-gray-500">PNG, JPG (MAX. 5MB)</p>
                      {formData.logo && (
                        <p className="mt-2 text-sm text-blue-600 font-medium">
                          {formData.logo.name}
                        </p>
                      )}
                    </div>
                    <input
                      id="logo"
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleLogoUpload}
                    />
                  </label>
                </div>
              </div>

              {/* Export Format */}
              <div className="space-y-2">
                <Label htmlFor="exportFormat" className="text-sm font-medium text-gray-700">
                  Preferred Export Format
                </Label>
                <Select 
                  defaultValue="powerpoint"
                  onValueChange={(value) => setFormData(prev => ({ ...prev, exportFormat: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="powerpoint">PowerPoint (.pptx)</SelectItem>
                    <SelectItem value="googleslides">Google Slides (Coming Soon)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isGenerating}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-4 text-lg rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isGenerating ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Generating Your Deck...
                  </div>
                ) : (
                  "Generate My Sales Deck"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DeckGenerator;
