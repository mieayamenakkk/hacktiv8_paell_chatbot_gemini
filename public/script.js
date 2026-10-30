document.addEventListener('DOMContentLoaded', () => {
    const chatInput = document.getElementById('chatInput');
    const btnSend = document.getElementById('btnSend');
    const chatHistory = document.getElementById('chatHistory');

    // Fungsi untuk memunculkan bubble chat di layar
    function appendMessage(text, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('chat-message', sender);

        const bubbleDiv = document.createElement('div');
        bubbleDiv.classList.add('chat-bubble');
        bubbleDiv.innerHTML = text; // Menggunakan innerHTML agar tag <br> dan <b> berfungsi
        
        messageDiv.appendChild(bubbleDiv);
        chatHistory.appendChild(messageDiv);

        // Auto-scroll ke bawah saat ada chat baru
        chatHistory.scrollTop = chatHistory.scrollHeight;
        
        return messageDiv;
    }

    function escapeHtml(str = '') {
        return String(str).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
    }

    // Ubah data dari server (format apa pun) menjadi HTML bubble
    function formatReply(data) {
        const fmt = (t) => escapeHtml(t).replace(/\n/g, '<br>');
        if (data === null || data === undefined) return '';
        if (typeof data === 'string') return fmt(data.trim());

        let jawaban = '';
        let list = [];
        if (Array.isArray(data)) {
            list = data;
        } else if (typeof data === 'object') {
            jawaban = data.jawaban || data.response || data.answer || data.message || '';
            list = Array.isArray(data.rekomendasi) ? data.rekomendasi : [];
            if (!jawaban && !list.length && data.error) jawaban = String(data.error);
        }

        let html = '';
        if (jawaban) html += fmt(String(jawaban)) + (list.length ? '<br><br>' : '');
        list.forEach((item, i) => {
            const nama = item?.nama_destinasi || item?.nama || '';
            const biaya = item?.estimasi_biaya || '';
            const alasan = item?.alasan_kesesuaian || '';
            if (!nama && !alasan) return;
            html += `<b>${i + 1}. ${fmt(String(nama))}</b><br>`;
            if (biaya) html += `💰 ${fmt(String(biaya))}<br>`;
            if (alasan) html += `✨ <i>${fmt(String(alasan))}</i><br>`;
            html += '<br>';
        });
        return html.trim();
    }

    async function sendMessage() {
        const messageText = chatInput.value.trim();
        if (!messageText) return;

        // 1. Tampilkan bubble User warna biru
        appendMessage(messageText, 'user');
        chatInput.value = '';
        btnSend.disabled = true;

        // 2. Tampilkan bubble Bot abu-abu sedang loading
        const loadingMsg = appendMessage('Sedang mencari...', 'bot');

        let botReply = "";
        try {
            const res = await fetch('/api/destination', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: messageText })
            });

            // Baca sebagai teks dulu, supaya tidak error kalau bukan JSON
            const rawText = await res.text();
            let data;
            try { data = JSON.parse(rawText); } catch { data = rawText; }

            botReply = formatReply(data);

            if (!botReply) {
                botReply = res.ok
                    ? 'Maaf, aku belum punya jawaban untuk itu. Coba tanya dengan kata lain ya.'
                    : 'Maaf, server sedang bermasalah. Coba lagi sebentar ya.';
            }
        } catch (err) {
            console.error(err);
            botReply = 'Maaf, koneksi ke server terputus. Pastikan server menyala, lalu coba lagi.';
        } finally {
            if (loadingMsg.parentNode) chatHistory.removeChild(loadingMsg);
            appendMessage(botReply, 'bot');
            btnSend.disabled = false;
            chatInput.focus();
        }
    }

    // Eksekusi ketika tombol diklik atau Enter ditekan
    btnSend.addEventListener('click', sendMessage);
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
});