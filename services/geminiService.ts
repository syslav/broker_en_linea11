import { GoogleGenAI } from "@google/genai";

export const generatePropertyDescription = async (
  title: string,
  features: string,
  location: string,
  type: string
): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const prompt = `
      Actúa como un redactor inmobiliario profesional. 
      Escribe una descripción atractiva, persuasiva y concisa (máximo 100 palabras) para un anuncio de una propiedad.
      
      Detalles:
      - Título: ${title}
      - Tipo: ${type === 'SALE' ? 'Venta' : 'Alquiler'}
      - Ubicación: ${location}
      - Características clave: ${features}
      
      Tono: Profesional, invitante y orientado a la venta.
      Idioma: Español
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "Hermosa propiedad disponible para ti.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "No se pudo generar la descripción automáticamente. Por favor, ingrésala manualmente.";
  }
};