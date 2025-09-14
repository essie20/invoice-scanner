import { GoogleGenAI } from '@google/genai';
import { InvoiceData } from '@/types/database';
import invoiceSchema from './invoice_json_schema.json';

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error('GEMINI_API_KEY is not set');
}

const ai = new GoogleGenAI({
  apiKey,
});

// Helper function to clean JSON response from markdown
function cleanJsonResponse(response: string): string {
  // Remove markdown code blocks
  let cleaned = response.replace(/```json\s*/g, '').replace(/```\s*/g, '');
  
  // Find the first { and last } to extract just the JSON
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');
  
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    cleaned = cleaned.substring(firstBrace, lastBrace + 1);
  }
  
  return cleaned.trim();
}

export async function extractInvoiceData(imageBase64: string, mimeType: string): Promise<InvoiceData> {
  const config = {
    thinkingConfig: {
      thinkingBudget: 0,
    },
    responseMimeType: 'application/json',
    responseSchema: invoiceSchema,
  };

  const model = 'gemini-2.5-flash-lite';
  
  const contents = [
    {
      role: 'user' as const,
      parts: [
        {
          text: `Please analyze this invoice image and extract all visible information into the required JSON format. 
          
          Extract the following information according to the provided JSON schema:
          - Company name and details
          - Customer information (name, addresses, contact info)
          - Invoice details (number, dates, PO number)
          - All line items with descriptions, quantities, prices
          - Tax information and calculations
          - Total amounts
          - Payment terms and conditions
          - Any notes or signatures
          - Currency as ISO 4217 code (e.g., 'USD', 'EUR') - convert symbols like '$' to proper codes
          
          Be thorough and accurate. If any field is not visible or clear, omit it from the JSON.
          Ensure all numerical values are properly extracted and calculated.
          For currency, always use ISO 4217 three-letter codes, not symbols.`,
        },
        {
          inlineData: {
            mimeType,
            data: imageBase64,
          },
        },
      ],
    },
  ];

  try {
    const response = await ai.models.generateContentStream({
      model,
      config,
      contents,
    });

    let fullResponse = '';
    for await (const chunk of response) {
      fullResponse += chunk.text;
    }

    // Clean the response to remove markdown formatting
    const cleanedResponse = cleanJsonResponse(fullResponse);
    console.log('Cleaned response:', cleanedResponse);
    
    const parsedData = JSON.parse(cleanedResponse) as InvoiceData;
    
    // Validate the response has the required structure
    if (!parsedData.invoice || !parsedData.invoice.company) {
      throw new Error('Invalid response structure from AI');
    }

    return parsedData;
  } catch (error) {
    console.error('Error extracting invoice data:', error);
    throw new Error('Failed to extract invoice data from image');
  }
}