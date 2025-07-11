
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, XCircle, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiService } from "@/services/api";

const ConnectionStatus = () => {
  const { toast } = useToast();
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [lastChecked, setLastChecked] = useState<string | null>(null);

  const checkConnection = async () => {
    setIsChecking(true);
    
    try {
      const response = await apiService.healthCheck();
      console.log('Health check response:', response);
      
      if (response.status === 'ok' || response.status === 'healthy') {
        setIsConnected(true);
        setLastChecked(new Date().toLocaleTimeString());
        toast({
          title: "Connection Successful",
          description: "Backend is connected and responding.",
        });
      } else {
        setIsConnected(false);
        toast({
          title: "Connection Issue",
          description: "Backend responded but status is unclear.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Connection check failed:', error);
      setIsConnected(false);
      toast({
        title: "Connection Failed",
        description: error instanceof Error ? error.message : "Unable to connect to backend.",
        variant: "destructive"
      });
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    checkConnection();
  }, []);

  return (
    <Card className="mb-6 border-2">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {isConnected === true && (
              <>
                <CheckCircle className="w-5 h-5 text-green-500" />
                <div>
                  <p className="font-medium text-green-700">Backend Connected</p>
                  <p className="text-sm text-gray-500">
                    Last checked: {lastChecked}
                  </p>
                </div>
              </>
            )}
            {isConnected === false && (
              <>
                <XCircle className="w-5 h-5 text-red-500" />
                <div>
                  <p className="font-medium text-red-700">Connection Failed</p>
                  <p className="text-sm text-gray-500">
                    Unable to reach backend at: https://pitchperfect-1.onrender.com
                  </p>
                </div>
              </>
            )}
            {isConnected === null && (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                <p className="font-medium text-blue-700">Checking Connection...</p>
              </>
            )}
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={checkConnection}
            disabled={isChecking}
            className="ml-4"
          >
            {isChecking ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            <span className="ml-2">Check</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ConnectionStatus;
