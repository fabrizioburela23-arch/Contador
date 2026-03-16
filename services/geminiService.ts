import { GoogleGenAI, Type } from "@google/genai";
import { SYSTEM_PROMPT, MODEL_NAME } from '../constants';
import { InvoiceData } from '../types';

// Initialize the API client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Helper to convert file to Base64
const fileToPart = (file: File): Promise<{ inlineData: { data: string; mimeType: string } }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Data = reader.result as string;
      // Remove data url prefix (e.g. "data:image/jpeg;base64,")
      const base64Content = base64Data.split(',')[1];
      resolve({
        inlineData: {
          data: base64Content,
          mimeType: file.type,
        },
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const processInvoices = async (files: File[]): Promise<InvoiceData[]> => {
  if (files.length === 0) return [];

  // Convert all files to Gemini-compatible parts
  const imageParts = await Promise.all(files.map(file => fileToPart(file)));

  // Define strict output schema
  const responseSchema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        fecha_emision: { type: Type.STRING, description: "Fecha en formato AAAA-MM-DD" },
        nombre_emisor: { type: Type.STRING },
        identificacion_fiscal: { type: Type.STRING },
        numero_factura: { type: Type.STRING },
        categoria_gasto: { type: Type.STRING, enum: ["Alimentos", "Transporte", "Oficina", "Servicios", "Otros"] },
        moneda: { type: Type.STRING },
        total_factura: { type: Type.NUMBER },
        items_compra: { type: Type.STRING }
      },
      required: ["fecha_emision", "total_factura", "moneda", "nombre_emisor"]
    }
  };

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: {
        parts: [
          ...imageParts,
          { text: "Analiza estas imágenes de facturas y extrae los datos." }
        ]
      },
      config: {
        systemInstruction: SYSTEM_PROMPT,
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      }
    });

    const responseText = response.text;
    if (!responseText) {
      throw new Error("No response received from Gemini.");
    }

    const data = JSON.parse(responseText);
    
    // Safety check to ensure it is an array
    return Array.isArray(data) ? data : [data];
    
  } catch (error) {
    console.error("Error processing invoices:", error);
    throw error;
  }
};
