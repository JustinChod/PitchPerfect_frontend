import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

function App() {
  const [companyName, setCompanyName] = useState('');
  /* ...other fields... */
  const [result, setResult] = useState(null);
  const API_URL = 'https://pitchperfect-1.onrender.com';

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { company_name: companyName, /* ... */ };
    const res = await fetch(`${API_URL}/generate-deck`, {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    setResult(data);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input value={companyName} onChange={e=>setCompanyName(e.target.value)} placeholder="Company Name" />
      {/* other inputs */}
      <button type="submit">Generate Deck</button>

      {result && (
        <a href={`${API_URL}${result.download_url}`} download={result.filename}>
          Download Deck
        </a>
      )}
    </form>
  );
}

export default App;
