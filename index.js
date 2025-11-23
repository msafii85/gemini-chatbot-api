// Mengimpor dan mengkonfigurasi dotenv untuk memuat variabel lingkungan dari file .env
import 'dotenv/config'; 
// Kerangka kerja web untuk Node.js
import express from 'express'; 
// Middleware untuk mengaktifkan Cross-Origin Resource Sharing (CORS)
import cors from 'cors'; 
// Modul Node.js untuk bekerja dengan path file dan direktori
import path from 'path'; 
// Fungsi untuk mengonversi URL file menjadi path file
import { fileURLToPath } from 'url'; 
// SDK Google GenAI untuk berinteraksi dengan model Gemini
import { GoogleGenAI } from "@google/genai"; 

// Mendapatkan path file saat ini (diperlukan saat menggunakan ES Modules)
const __filename = fileURLToPath(import.meta.url);
// Mendapatkan path direktori saat ini
const __dirname = path.dirname(__filename);

// Membuat instance aplikasi Express
const app = express();

// Menginisialisasi klien Google GenAI dengan kunci API dari variabel lingkungan
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Menentukan nama model Gemini yang akan digunakan
const GEMINI_MODEL = "gemini-2.0-flash";

// Mengaktifkan CORS untuk semua rute, memungkinkan permintaan dari origin yang berbeda
app.use(cors());
// Middleware untuk mem-parsing body permintaan JSON yang masuk
app.use(express.json());

// Menyajikan file statis (seperti HTML, CSS, JS) dari direktori 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Menentukan port server
const PORT = 3000;
// Menjalankan server pada port yang ditentukan dan mencatat pesan saat server siap
app.listen(PORT, () => console.log(`Server ready on http://localhost:${PORT}`));

/**
 * @description Endpoint untuk berinteraksi dengan chatbot.
 * Menerima riwayat percakapan dan mengembalikan respons dari model AI.
 * @route POST /api/chat
 * @access Public
 */
app.post('/api/chat', async (req, res) => {
  const { messages } = req.body;

  try {
    if (!Array.isArray(messages)) throw new Error('Messages must be an array!');

    // Memformat pesan agar sesuai dengan struktur yang diharapkan oleh API Gemini
    const contents = messages.map(({ role, content }) => ({
      role,
      parts: [{ text: content }]
    }));

    // Menghasilkan konten berdasarkan riwayat percakapan
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents
    });

    res.status(200).json({ result: response.text });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});