import { GoogleGenAI, Type } from '@google/genai';

export const getPackingList = async (req, res) => {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const GEMINI_MODEL = 'gemini-3.5-flash-lite';

    const { destinasi, tanggal } = req.body;
    const prompt = `Prediksi cuaca di ${destinasi} pada ${tanggal}. Buat checklist barang bawaan berdasarkan cuaca tersebut dan berikan peringatan jika ada kondisi ekstrem.`;

    try {
        const response = await ai.models.generateContent({
            model: GEMINI_MODEL,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        prakiraan_cuaca: { type: Type.STRING },
                        checklist_barang: { type: Type.ARRAY, items: { type: Type.STRING } },
                        peringatan: { type: Type.STRING }
                    }
                }
            }
        });
        res.status(200).json(JSON.parse(response.text));
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};