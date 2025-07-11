// src/services/api.ts
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://pitchperfect-1.onrender.com';

export interface GenerateDeckRequest {
  company_name: string;
  industry: string;
  buyer_persona: string;
  main_pain_point: string;
  use_case: string;
  logo_base64?: string;
}

export interface GenerateDeckResponse {
  success: boolean;
  file_id: string;
  download_url: string;
  filename: string;
  slides_generated: number;
  expires_at: string;
}

export interface ApiError {
  error: string;
}

class ApiService {
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const errorData: ApiError = await response.json().catch(() => ({
        error: `HTTP ${response.status}: ${response.statusText}`,
      }));
      throw new Error(errorData.error || 'An unknown error occurred');
    }

    return response.json();
  }

  async generateDeck(request: GenerateDeckRequest): Promise<GenerateDeckResponse> {
    return this.makeRequest<GenerateDeckResponse>('/generate-deck', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async downloadDeck(fileId: string): Promise<Blob> {
    const response = await fetch(`${API_BASE_URL}/download/${fileId}`);
    
    if (!response.ok) {
      throw new Error(`Failed to download deck: ${response.status} ${response.statusText}`);
    }
    
    return response.blob();
  }

  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    return this.makeRequest<{ status: string; timestamp: string }>('/health');
  }
}

export const apiService = new ApiService();

// Utility function to convert File to base64
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result);
    };
    reader.onerror = (error) => reject(error);
  });
};

// Utility function to trigger file download
export const downloadFile = (blob: Blob, filename: string) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};
