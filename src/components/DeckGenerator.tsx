
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowUp } from "lucide-react";
import { GenerateDeckResponse } from "@/services/api";
import { FormData } from "@/types/deckGenerator";
import DeckGeneratorHeader from "./DeckGeneratorHeader";
import DeckGeneratorForm from "./DeckGeneratorForm";
import DeckGeneratorResult from "./DeckGeneratorResult";

interface DeckGeneratorProps {
  onBack: () => void;
}

const DeckGenerator = ({ onBack }: DeckGeneratorProps) => {
  const [generatedDeck, setGeneratedDeck] = useState<GenerateDeckResponse | null>(null);
  const [formData, setFormData] = useState<FormData | null>(null);

  const handleFormSuccess = (response: GenerateDeckResponse, data: FormData) => {
    setGeneratedDeck(response);
    setFormData(data);
  };

  const handleCreateAnother = () => {
    setGeneratedDeck(null);
    setFormData(null);
  };

  if (generatedDeck && formData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
        <div className="container mx-auto max-w-4xl py-12">
          <DeckGeneratorResult
            generatedDeck={generatedDeck}
            formData={formData}
            onCreateAnother={handleCreateAnother}
            onBackToHome={onBack}
          />
          
          <div className="mt-6 text-center">
            <Button
              variant="ghost"
              onClick={onBack}
              className="text-gray-500 hover:text-gray-700"
            >
              <ArrowUp className="w-4 h-4 mr-2 rotate-180" />
              Back to Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      <div className="container mx-auto max-w-4xl py-8">
        <DeckGeneratorHeader onBack={onBack} />
        <DeckGeneratorForm onSuccess={handleFormSuccess} />
      </div>
    </div>
  );
};

export default DeckGenerator;
