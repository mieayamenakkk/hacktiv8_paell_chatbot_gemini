import { GoogleGenAI, Type } from '@google/genai';

export const getSplitBill = async (req, res) => {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const GEMINI_MODEL = 'gemini-3.5-flash-lite';

    const { chat } = req.body;
    const prompt = `Ekstrak data pembagian biaya dari teks berikut: "${chat}". Tentukan siapa pembayar utama, berapa totalnya, dan detail siapa berutang ke siapa.`;

    try {
        const response = await ai.models.generateContent({
            model: GEMINI_MODEL,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        total_transaksi: { type: Type.NUMBER },
                        pembayar_utama: { type: Type.STRING },
                        rincian_utang: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    peminjam: { type: Type.STRING },
                                    nominal_utang: { type: Type.NUMBER }
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