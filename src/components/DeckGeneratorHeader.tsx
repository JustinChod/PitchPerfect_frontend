
import { Button } from "@/components/ui/button";
import { ArrowUp } from "lucide-react";

interface DeckGeneratorHeaderProps {
  onBack: () => void;
}

const DeckGeneratorHeader = ({ onBack }: DeckGeneratorHeaderProps) => {
  return (
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
  );
};

export default DeckGeneratorHeader;
