import { GoogleGenAI, Type } from "@google/genai";

const apiKey = process.env.API_KEY || '';

// Use the new SDK initialization
const ai = new GoogleGenAI({ apiKey });

// Define the schema based on user requirements
const brandProfileSchema = {
    type: Type.OBJECT,
    properties: {
        brand_name: { type: Type.STRING },
        website: { type: Type.STRING },
        settore: { type: Type.STRING },
        target_age: { type: Type.STRING },
        target_job: { type: Type.STRING },
        target_geo: { type: Type.STRING },
        tone_voice: { type: Type.STRING },
        pain_point_1: { type: Type.STRING },
        pain_point_2: { type: Type.STRING },
        pain_point_3: { type: Type.STRING },
        value_prop: { type: Type.STRING },
        competitor_1_name: { type: Type.STRING },
        competitor_1_instagram: { type: Type.STRING },
        competitor_2_name: { type: Type.STRING },
        competitor_2_instagram: { type: Type.STRING },
        max_emoji: { type: Type.NUMBER },
        post_length_min: { type: Type.NUMBER },
        post_length_max: { type: Type.NUMBER },
        confidence_score: { type: Type.NUMBER },
        warnings: { type: Type.STRING },
        keywords: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING },
            description: "List of SEO and strategic keywords for the brand"
        }
    },
    required: ["brand_name", "settore", "keywords", "value_prop", "pain_point_1"],
};

export interface BrandProfileData {
    brand_name?: string;
    website?: string;
    settore?: string;
    target_age?: string;
    target_job?: string;
    target_geo?: string;
    tone_voice?: string;
    pain_point_1?: string;
    pain_point_2?: string;
    pain_point_3?: string;
    value_prop?: string;
    competitor_1_name?: string;
    competitor_1_instagram?: string;
    competitor_2_name?: string;
    competitor_2_instagram?: string;
    max_emoji?: number;
    post_length_min?: number;
    post_length_max?: number;
    confidence_score?: number;
    warnings?: string;
    keywords?: string[];
    [key: string]: any;
}

export const generateBrandProfile = async (websiteUrl: string, modelName: string): Promise<BrandProfileData> => {
    if (!apiKey) {
        throw new Error("API Key mancante (process.env.API_KEY).");
    }

    try {
        const response = await ai.models.generateContent({
            model: modelName,
            contents: `Analizza questo sito web/brand: "${websiteUrl}".
            
            Costruisci un Brand Profile strategico completo, analizza i competitor e genera keyword focus.
            
            Se il link non è accessibile o è generico, deduci le informazioni più probabili basandoti sul nome del brand o crea un profilo verosimile per quel tipo di settore.
            
            Restituisci ESATTAMENTE un oggetto JSON con questi campi (snake_case):
            brand_name, website, settore, target_age, target_job, target_geo, tone_voice,
            pain_point_1, pain_point_2, pain_point_3, value_prop,
            competitor_1_name, competitor_1_instagram,
            competitor_2_name, competitor_2_instagram,
            max_emoji (int), post_length_min (int), post_length_max (int),
            confidence_score (int 1-10), warnings (string),
            keywords (array di stringhe).`,
            config: {
                responseMimeType: "application/json",
                responseSchema: brandProfileSchema,
            }
        });

        const text = response.text;
        if (!text) {
            throw new Error("Nessuna risposta generata dall'AI.");
        }
        
        return JSON.parse(text) as BrandProfileData;
    } catch (error: any) {
        console.error("Gemini API Error:", error);

        // Check if it's a quota/credit exhausted error
        const errorMsg = error.message || "";
        if (errorMsg.includes("quota") ||
            errorMsg.includes("RESOURCE_EXHAUSTED") ||
            errorMsg.includes("exceeded your current quota")) {
            throw new Error("⚠️ Crediti insufficienti per questo modello AI. Prova con Gemini 2.5 Flash o Flash Lite (gratuiti).");
        }

        throw new Error(error.message || "Errore sconosciuto durante la generazione.");
    }
};