
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Download, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiService, downloadFile, GenerateDeckResponse } from "@/services/api";
import { FormData } from "@/types/deckGenerator";

interface DeckGeneratorResultProps {
  generatedDeck: GenerateDeckResponse;
  formData: FormData;
  onCreateAnother: () => void;
  onBackToHome: () => void;
}

const DeckGeneratorResult = ({ 
  generatedDeck, 
  formData, 
  onCreateAnother, 
  onBackToHome 
}: DeckGeneratorResultProps) => {
  const { toast } = useToast();
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
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

  const expiresAt = new Date(generatedDeck.expires_at);
  const now = new Date();
  const isExpired = now > expiresAt;

  return (
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
            onClick={onCreateAnother}
            className="px-8 py-3 text-lg border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-all duration-300"
          >
            Create Another Deck
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default DeckGeneratorResult;
