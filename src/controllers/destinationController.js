import { GoogleGenAI, Type } from '@google/genai';

// Urutan model yang dicoba. Kalau satu gagal (nama salah / kuota / overload), lanjut ke berikutnya.
const MODELS = [...new Set([
    process.env.GEMINI_MODEL,
    'gemini-3.5-flash-lite',
    'gemini-2.5-flash-lite',
    'gemini-2.5-flash'
].filter(Boolean))];

const str = (v) => (v === undefined || v === null ? '' : String(v).trim());

// Ubah balasan model dalam bentuk APA PUN menjadi { jawaban, rekomendasi[] }
export const normalize = (raw) => {
    let data = raw;

    if (typeof data === 'string') {
        const cleaned = data.replace(/```json|```/gi, '').trim();
        try { data = JSON.parse(cleaned); }
        catch { return { jawaban: cleaned, rekomendasi: [] }; } // bukan JSON -> pakai teks apa adanya
    }

    const toItem = (x) => ({
        nama_destinasi: str(x?.nama_destinasi || x?.nama || x?.name || x?.destinasi),
        alasan_kesesuaian: str(x?.alasan_kesesuaian || x?.alasan || x?.deskripsi || x?.description),
        estimasi_biaya: str(x?.estimasi_biaya || x?.biaya || x?.harga || x?.price)
    });
    const validItem = (x) => x.nama_destinasi || x.alasan_kesesuaian;

    if (Array.isArray(data)) {
        return { jawaban: '', rekomendasi: data.map(toItem).filter(validItem) };
    }
    if (data && typeof data === 'object') {
        const list = data.rekomendasi || data.recommendations || data.destinasi || [];
        return {
            jawaban: str(data.jawaban || data.response || data.answer || data.message),
            rekomendasi: (Array.isArray(list) ? list : []).map(toItem).filter(validItem)
        };
    }
    return { jawaban: str(data), rekomendasi: [] };
};

const buildPrompt = ({ message, budget, asal, gaya, durasi }) => {
    const konteks = [
        asal && `Kota asal: ${asal}`,
        budget && `Anggaran: ${budget}`,
        gaya && `Gaya liburan: ${gaya}`,
        durasi && `Durasi: ${durasi}`
    ].filter(Boolean).join('\n');

    return `Kamu adalah TravelBot, asisten perencana perjalanan berbahasa Indonesia yang ramah.
Balas SESUAI pesan pengguna. Apa pun isi pesannya, selalu beri jawaban yang relevan.

Aturan:
- Jika pengguna menyebut destinasi (mis. "mau ke Makassar, kemana yang bagus"), bahas DESTINASI ITU: "jawaban" berisi sapaan singkat + ringkasan, "rekomendasi" berisi 3-5 tempat/aktivitas unggulan DI destinasi tersebut (nama tempat, alasan, estimasi biaya dalam rentang Rupiah).
- Jika pengguna meminta ide tanpa destinasi, beri 3 rekomendasi destinasi. Kalau info (asal, anggaran, gaya, durasi) belum ada, tulis di "jawaban" bahwa info itu akan membantu.
- Jika pesan tidak berkaitan dengan wisata atau tidak jelas, balas singkat dan sopan di "jawaban", lalu tanyakan mau liburan ke mana. "rekomendasi" boleh kosong.
- Jangan mengarang angka pasti; pakai estimasi.

Pesan pengguna: "${message}"${konteks ? `\n\nInformasi tambahan:\n${konteks}` : ''}`;
};

export const getDestinations = async (req, res) => {
    const body = req.body || {};
    const input = {
        message: str(body.message),
        budget: str(body.budget),
        asal: str(body.asal),
        gaya: str(body.gaya),
        durasi: str(body.durasi)
    };

    if (!Object.values(input).some(Boolean)) {
        return res.status(200).json({
            jawaban: 'Halo! Ceritakan mau liburan ke mana, atau tanya tempat wisata di suatu kota ya.',
            rekomendasi: []
        });
    }

    const prompt = buildPrompt(input);
    const config = {
        responseMimeType: 'application/json',
        responseSchema: {
            type: Type.OBJECT,
            properties: {
                jawaban: { type: Type.STRING },
                rekomendasi: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            nama_destinasi: { type: Type.STRING },
                            alasan_kesesuaian: { type: Type.STRING },
                            estimasi_biaya: { type: Type.STRING }
                        }
                    }
                }
            },
            required: ['jawaban']
        }
    };

    if (!process.env.GEMINI_API_KEY) {
        console.error('[destination] GEMINI_API_KEY belum diisi di .env');
        return res.status(500).json({
            jawaban: 'Server belum dikonfigurasi (API key kosong). Hubungi admin.',
            rekomendasi: []
        });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    let lastError = null;

    for (const model of MODELS) {
        try {
            const response = await ai.models.generateContent({ model, contents: prompt, config });
            const result = normalize(response.text);

            if (!result.jawaban && result.rekomendasi.length === 0) {
                throw new Error('Balasan model kosong');
            }
            return res.status(200).json(result);
        } catch (e) {
            lastError = e;
            console.error(`[destination] model ${model} gagal:`, e.message);
        }
    }

    // Semua model gagal -> tetap kirim format yang sama supaya frontend tidak rusak
    res.status(502).json({
        jawaban: 'Maaf, TravelBot lagi gangguan. Coba kirim lagi beberapa saat lagi ya.',
        rekomendasi: [],
        error: lastError?.message
    });
};