import { GoogleGenAI, Type } from '@google/genai';

export const getItinerary = async (req, res) => {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const GEMINI_MODEL = 'gemini-3.5-flash-lite';

    const { destinasi, durasi } = req.body;
    const prompt = `Buat itinerary ${durasi} hari di ${destinasi}. Urutkan lokasi berdekatan secara geografis. Bagi menjadi aktivitas Pagi, Siang, Sore, Malam lengkap dengan estimasi waktu tempuh antar-titik.`;

    try {
        const response = await ai.models.generateContent({
            model: GEMINI_MODEL,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            hari_ke: { type: Type.INTEGER },
                            aktivitas: {
                                type: Type.ARRAY,
                                items: {
                                    type: Type.OBJECT,
                                    properties: {
                                        waktu: { type: Type.STRING },
                                        lokasi: { type: Type.STRING },
                                        estimasi_waktu_tempuh: { type: Type.STRING }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });
        res.status(200).json(JSON.parse(response.text));
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};