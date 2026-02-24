// Inisialisasi variabel global
let currentQRCode = null;
let currentDataType = '';
let currentData = '';
let qrHistory = JSON.parse(localStorage.getItem('qrHistory')) || [];

// Fungsi untuk menginisialisasi aplikasi
function initApp() {
    // Setup tab switching
    const tabBtns = document.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Hapus class active dari semua tab
            tabBtns.forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

            // Tambah class active ke tab yang diklik
            btn.classList.add('active');
            const tabId = btn.getAttribute('data-tab');
            document.getElementById(`${tabId}-tab`).classList.add('active');

            // Reset file info
            document.getElementById('file-info-text').textContent = 'Belum ada QR Code yang dibuat. Pilih tipe data dan buat QR Code terlebih dahulu.';
            document.getElementById('file-type-badge').textContent = '';

            // Hapus QR code yang ada
            if (currentQRCode) {
                currentQRCode.clear();
                currentQRCode = null;
            }
        });
    });

    // Setup event listeners untuk tombol generate
    document.getElementById('generate-link-btn').addEventListener('click', generateLinkQR);
    document.getElementById('generate-text-btn').addEventListener('click', generateTextQR);
    document.getElementById('generate-image-btn').addEventListener('click', generateImageQR);

    // Setup event listener untuk input file
    document.getElementById('image-input').addEventListener('change', function (e) {
        const fileName = e.target.files[0] ? e.target.files[0].name : 'Tidak ada file yang dipilih';
        document.getElementById('selected-file-name').textContent = `File terpilih: ${fileName}`;
    });

    // Setup event listeners untuk tombol download
    document.getElementById('download-png').addEventListener('click', downloadAsPNG);
    document.getElementById('download-svg').addEventListener('click', downloadAsSVG);
    document.getElementById('download-data').addEventListener('click', saveQRData);

    // Tampilkan riwayat
    displayHistory();

    // Buat QR code contoh untuk link
    setTimeout(() => {
        generateLinkQR();
    }, 500);
}

// Fungsi untuk menghasilkan QR code dari link
function generateLinkQR() {
    const link = document.getElementById('link-input').value.trim();
    if (!link) {
        alert('Masukkan link terlebih dahulu');
        return;
    }

    // Tambahkan https:// jika tidak ada
    const formattedLink = link.startsWith('http') ? link : `https://${link}`;
    currentData = formattedLink;
    currentDataType = 'link';

    generateQRCode(formattedLink, 'link');
    updateFileInfo(formattedLink, 'Link');
    addToHistory(formattedLink, 'link');
}

// Fungsi untuk menghasilkan QR code dari teks
function generateTextQR() {
    const text = document.getElementById('text-input').value.trim();
    if (!text) {
        alert('Masukkan teks terlebih dahulu');
        return;
    }

    currentData = text;
    currentDataType = 'text';

    generateQRCode(text, 'text');
    updateFileInfo(text, 'Teks');
    addToHistory(text, 'text');
}

// Fungsi untuk menghasilkan QR code dari gambar PNG
function generateImageQR() {
    const fileInput = document.getElementById('image-input');
    if (!fileInput.files[0]) {
        alert('Pilih gambar PNG terlebih dahulu');
        return;
    }

    const file = fileInput.files[0];
    if (file.type !== 'image/png') {
        alert('Hanya file PNG yang didukung');
        return;
    }

    const reader = new FileReader();
    reader.onload = function (e) {
        // Konversi gambar ke base64
        const base64Image = e.target.result;
        currentData = base64Image;
        currentDataType = 'image';

        // Karena data base64 bisa sangat panjang, kita buat QR code dengan teks yang lebih pendek
        // Di dunia nyata, kita mungkin perlu menggunakan library yang mendukung data besar
        const qrData = `IMAGE:${file.name}:${base64Image.substring(0, 100)}...`;

        generateQRCode(qrData, 'image');
        updateFileInfo(`Gambar: ${file.name} (${formatFileSize(file.size)})`, 'Gambar PNG');
        addToHistory(file.name, 'image');
    };
    reader.readAsDataURL(file);
}

// Fungsi untuk menghasilkan QR code
function generateQRCode(data, type) {
    // Hapus QR code sebelumnya
    document.getElementById('qrcode').innerHTML = '';
    if (currentQRCode) {
        currentQRCode.clear();
    }

    // Buat QR code baru
    currentQRCode = new QRCode(document.getElementById('qrcode'), {
        text: data,
        width: 250,
        height: 250,
        colorDark: "#000000",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.H
    });
}

// Fungsi untuk memperbarui informasi file
function updateFileInfo(data, type) {
    const infoText = document.getElementById('file-info-text');
    const badge = document.getElementById('file-type-badge');

    // Potong data jika terlalu panjang
    let displayData = data.length > 100 ? data.substring(0, 100) + '...' : data;

    infoText.textContent = `Tipe: ${type}\nData: ${displayData}`;
    badge.textContent = `Tipe: ${type}`;

    // Update warna badge berdasarkan tipe
    badge.style.backgroundColor = type === 'Link' ? '#e7f5ff' :
        type === 'Teks' ? '#fff3bf' : '#d3f9d8';
    badge.style.color = type === 'Link' ? '#1a2980' :
        type === 'Teks' ? '#e67700' : '#0ca678';
}

// Fungsi untuk mendownload QR code sebagai PNG
function downloadAsPNG() {
    if (!currentQRCode) {
        alert('Buat QR Code terlebih dahulu');
        return;
    }

    const canvas = document.querySelector('#qrcode canvas');
    if (!canvas) {
        alert('Tidak dapat mengakses data QR Code');
        return;
    }

    const link = document.createElement('a');
    link.download = `qrcode-${currentDataType}-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
}

// Fungsi untuk mendownload QR code sebagai SVG
function downloadAsSVG() {
    if (!currentQRCode) {
        alert('Buat QR Code terlebih dahulu');
        return;
    }

    const svg = document.querySelector('#qrcode svg');
    if (!svg) {
        alert('Tidak dapat mengakses data QR Code');
        return;
    }

    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svg);
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(svgBlob);

    const link = document.createElement('a');
    link.download = `qrcode-${currentDataType}-${Date.now()}.svg`;
    link.href = url;
    link.click();

    URL.revokeObjectURL(url);
}

// Fungsi untuk menyimpan data QR
function saveQRData() {
    if (!currentQRCode || !currentData) {
        alert('Buat QR Code terlebih dahulu');
        return;
    }

    const data = {
        type: currentDataType,
        content: currentDataType === 'image' ? 'Data gambar (base64)' : currentData,
        timestamp: new Date().toISOString()
    };

    const dataStr = JSON.stringify(data, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.download = `qrcode-data-${currentDataType}-${Date.now()}.json`;
    link.href = url;
    link.click();

    URL.revokeObjectURL(url);
}

// Fungsi untuk menambahkan ke riwayat
function addToHistory(data, type) {
    const historyItem = {
        id: Date.now(),
        type: type,
        content: type === 'image' ? data : (data.length > 50 ? data.substring(0, 50) + '...' : data),
        fullContent: data,
        timestamp: new Date().toLocaleString('id-ID')
    };

    qrHistory.unshift(historyItem);

    // Simpan maksimal 10 item riwayat
    if (qrHistory.length > 10) {
        qrHistory = qrHistory.slice(0, 10);
    }

    // Simpan ke localStorage
    localStorage.setItem('qrHistory', JSON.stringify(qrHistory));

    // Perbarui tampilan riwayat
    displayHistory();
}

// Fungsi untuk menampilkan riwayat
function displayHistory() {
    const historyList = document.getElementById('history-list');

    if (qrHistory.length === 0) {
        historyList.innerHTML = '<p style="color: #6c757d; text-align: center; grid-column: 1 / -1;">Belum ada riwayat QR Code</p>';
        return;
    }

    historyList.innerHTML = qrHistory.map(item => `
                <div class="history-item">
                    <div class="history-type">
                        <i class="${getTypeIcon(item.type)}"></i> 
                        ${getTypeName(item.type)}
                    </div>
                    <div class="history-content">${item.content}</div>
                    <div class="history-date">${item.timestamp}</div>
                </div>
            `).join('');
}

// Fungsi bantu untuk mendapatkan nama tipe
function getTypeName(type) {
    switch (type) {
        case 'link': return 'Link';
        case 'text': return 'Teks';
        case 'image': return 'Gambar PNG';
        default: return 'Tidak diketahui';
    }
}

// Fungsi bantu untuk mendapatkan icon tipe
function getTypeIcon(type) {
    switch (type) {
        case 'link': return 'fas fa-link';
        case 'text': return 'fas fa-font';
        case 'image': return 'fas fa-image';
        default: return 'fas fa-question';
    }
}

// Fungsi bantu untuk format ukuran file
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Inisialisasi aplikasi saat halaman dimuat
document.addEventListener('DOMContentLoaded', initApp);

// Efek hover untuk social media icons
const socialIcons = document.querySelectorAll('.social-icon');

socialIcons.forEach(icon => {
    // Tambahkan efek saat mouse enter
    icon.addEventListener('mouseenter', function () {
        this.style.transform = 'translateY(-5px) scale(1.1)';
    });

    // Kembali ke normal saat mouse leave
    icon.addEventListener('mouseleave', function () {
        this.style.transform = 'translateY(0) scale(1)';
    });

    // Efek klik
    icon.addEventListener('click', function (e) {
        // Tambahkan efek ripple
        const ripple = document.createElement('span');
        const rect = this.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;

        ripple.style.cssText = `
            position: absolute;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.5);
            transform: scale(0);
            animation: ripple 0.6s linear;
            width: ${size}px;
            height: ${size}px;
            top: ${y}px;
            left: ${x}px;
        `;

        this.appendChild(ripple);

        // Hapus elemen ripple setelah animasi
        setTimeout(() => {
            ripple.remove();
        }, 600);
    });
});

// FAQ Accordion Interactivity
const faqItems = document.querySelectorAll('.faq-item');

faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');

    question.addEventListener('click', () => {
        const isActive = item.classList.contains('active');

        // Tutup semua FAQ yang terbuka terlebih dahulu (opsional, jika ingin hanya 1 terbuka)
        faqItems.forEach(otherItem => {
            otherItem.classList.remove('active');
            otherItem.querySelector('.faq-answer').style.maxHeight = null;
        });

        // Toggle state untuk item yang diklik
        if (!isActive) {
            item.classList.add('active');
            answer.style.maxHeight = answer.scrollHeight + "px";
        }
    });
});

// Timeline Scroll Progress
function updateTimelineProgress() {
    const timelineContainer = document.querySelector('.timeline-container');
    const progressBar = document.querySelector('.timeline-progress');

    if (timelineContainer && progressBar) {
        const rect = timelineContainer.getBoundingClientRect();
        const viewportHeight = window.innerHeight;

        // Progress dimulai saat container timeline bagian atas mencapai setengah viewport
        const startOffset = viewportHeight * 0.6;
        const totalHeight = timelineContainer.offsetHeight;

        let progress = 0;

        if (rect.top <= startOffset) {
            progress = (startOffset - rect.top) / totalHeight;
        }

        // Batasi nilai progress antara 0 dan 1
        progress = Math.max(0, Math.min(1, progress));

        // Tinggi maksimum garis didapat dari tinggi kontainer dikurangi padding bawah / margin akhir agar tidak kebablasan.
        // Berdasarkan style: padding 40px(top/bottom) + flex item terakhir tanpa margin. 
        // Garis dimulai dari top 40px. Sisa tinggi sampai tengah circle terakhir adalah (totalHeight - 80px).
        const maxHeight = totalHeight - 80;

        progressBar.style.height = `${progress * maxHeight}px`;
    }
}

// Tambahkan event listener untuk scroll
window.addEventListener('scroll', updateTimelineProgress);
// Perhitungan awal (delay sebentar agar DOM selesai dirender sepenuhnya)
setTimeout(updateTimelineProgress, 500);

// Tambahkan keyframe untuk efek ripple
const style = document.createElement('style');
style.textContent = `
    @keyframes ripple {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// script.js - Tambahkan di bagian paling atas file

// Data terjemahan untuk semua bahasa
const translations = {
    id: {
        // Header
        title: "Generator QR Code",
        description: "Alat serba guna untuk membuat kode QR gratis, mengeditnya, dan melacak kinerja kampanye.",

        // Tabs
        tabLink: "Dari Link",
        tabText: "Dari Teks",
        tabImage: "Dari Gambar PNG",

        // Link Tab
        linkLabel: "Masukkan URL/Link",
        linkPlaceholder: "Contoh: https://www.example.com",
        linkHint: "QR Code akan mengarahkan ke link yang dimasukkan",
        linkButton: "Buat QR Code",

        // Text Tab
        textLabel: "Masukkan Teks",
        textPlaceholder: "Masukkan teks apa saja yang ingin diubah menjadi QR Code...",
        textDefault: "Contoh teks untuk diubah menjadi QR Code. Anda bisa memasukkan informasi kontak, pesan rahasia, atau data lainnya.",
        textButton: "Buat QR Code",

        // Image Tab
        imageLabel: "Unggah Gambar PNG",
        imageUploadText: "Klik untuk mengunggah gambar PNG",
        imageUploadDesc: "File akan dikonversi menjadi QR Code",
        imageHint: "Hanya file PNG yang didukung. Gambar akan dienkode menjadi format base64 dalam QR Code.",
        imageButton: "Buat QR Code",

        // Result Section
        resultTitle: "Hasil QR Code",
        scanHint: "Pindai QR Code dengan kamera ponsel atau aplikasi QR scanner",

        // File Info
        fileInfoTitle: "Informasi File",
        fileInfoDefault: "Belum ada QR Code yang dibuat. Pilih tipe data dan buat QR Code terlebih dahulu.",

        // Download Section
        downloadTitle: "Unduh QR Code",
        downloadDesc: "File akan disimpan dengan nama yang berbeda sesuai tipe data:",
        downloadPNG: "Unduh sebagai PNG",
        downloadSVG: "Unduh sebagai SVG",
        downloadData: "Simpan Data QR",

        // History Section
        historyTitle: "Riwayat QR Code",

        // Footer
        copyright: "©2026 NexaV Studio. All rights reserved."
    },

    en: {
        // Header
        title: "QR Code Generator",
        description: "Versatile tool to create free QR codes, edit them, and track campaign performance.",

        // Tabs
        tabLink: "From Link",
        tabText: "From Text",
        tabImage: "From PNG Image",

        // Link Tab
        linkLabel: "Enter URL/Link",
        linkPlaceholder: "Example: https://www.example.com",
        linkHint: "QR Code will redirect to the entered link",
        linkButton: "Generate QR Code",

        // Text Tab
        textLabel: "Enter Text",
        textPlaceholder: "Enter any text you want to convert to QR Code...",
        textDefault: "Sample text to be converted to QR Code. You can enter contact information, secret messages, or other data.",
        textButton: "Generate QR Code",

        // Image Tab
        imageLabel: "Upload PNG Image",
        imageUploadText: "Click to upload PNG image",
        imageUploadDesc: "File will be converted to QR Code",
        imageHint: "Only PNG files are supported. Image will be encoded as base64 format in QR Code.",
        imageButton: "Generate QR Code",

        // Result Section
        resultTitle: "QR Code Result",
        scanHint: "Scan QR Code with mobile camera or QR scanner app",

        // File Info
        fileInfoTitle: "File Information",
        fileInfoDefault: "No QR Code has been created yet. Select data type and generate QR Code first.",

        // Download Section
        downloadTitle: "Download QR Code",
        downloadDesc: "Files will be saved with different names according to data type:",
        downloadPNG: "Download as PNG",
        downloadSVG: "Download as SVG",
        downloadData: "Save QR Data",

        // History Section
        historyTitle: "QR Code History",

        // Footer
        copyright: "©2026 NexaV Studio. All rights reserved."
    },

    es: {
        // Header
        title: "Generador de Código QR",
        description: "Herramienta versátil para crear códigos QR gratuitos, editarlos y rastrear el rendimiento de la campaña.",

        // Tabs
        tabLink: "Desde Enlace",
        tabText: "Desde Texto",
        tabImage: "Desde Imagen PNG",

        // Link Tab
        linkLabel: "Ingresar URL/Enlace",
        linkPlaceholder: "Ejemplo: https://www.example.com",
        linkHint: "El código QR redirigirá al enlace ingresado",
        linkButton: "Generar Código QR",

        // Text Tab
        textLabel: "Ingresar Texto",
        textPlaceholder: "Ingrese cualquier texto que desee convertir en código QR...",
        textDefault: "Texto de ejemplo para convertir en código QR. Puede ingresar información de contacto, mensajes secretos u otros datos.",
        textButton: "Generar Código QR",

        // Image Tab
        imageLabel: "Subir Imagen PNG",
        imageUploadText: "Haz clic para subir imagen PNG",
        imageUploadDesc: "El archivo se convertirá en código QR",
        imageHint: "Solo se admiten archivos PNG. La imagen se codificará en formato base64 en el código QR.",
        imageButton: "Generar Código QR",

        // Result Section
        resultTitle: "Resultado del Código QR",
        scanHint: "Escanee el código QR con cámara móvil o aplicación de escáner QR",

        // File Info
        fileInfoTitle: "Información del Archivo",
        fileInfoDefault: "Aún no se ha creado ningún código QR. Seleccione el tipo de datos y genere el código QR primero.",

        // Download Section
        downloadTitle: "Descargar Código QR",
        downloadDesc: "Los archivos se guardarán con nombres diferentes según el tipo de datos:",
        downloadPNG: "Descargar como PNG",
        downloadSVG: "Descargar como SVG",
        downloadData: "Guardar Datos QR",

        // History Section
        historyTitle: "Historial de Códigos QR",

        // Footer
        copyright: "©2026 NexaV Studio. Todos los derechos reservados."
    },

    fr: {
        // Header
        title: "Générateur de Code QR",
        description: "Outil polyvalent pour créer des codes QR gratuits, les modifier et suivre les performances de la campagne.",

        // Tabs
        tabLink: "Depuis un Lien",
        tabText: "Depuis un Texte",
        tabImage: "Depuis une Image PNG",

        // Link Tab
        linkLabel: "Entrer l'URL/Lien",
        linkPlaceholder: "Exemple: https://www.example.com",
        linkHint: "Le code QR redirigera vers le lien entré",
        linkButton: "Générer le Code QR",

        // Text Tab
        textLabel: "Entrer le Texte",
        textPlaceholder: "Entrez n'importe quel texte que vous souhaitez convertir en code QR...",
        textDefault: "Exemple de texte à convertir en code QR. Vous pouvez saisir des informations de contact, des messages secrets ou d'autres données.",
        textButton: "Générer le Code QR",

        // Image Tab
        imageLabel: "Télécharger une Image PNG",
        imageUploadText: "Cliquez pour télécharger une image PNG",
        imageUploadDesc: "Le fichier sera converti en code QR",
        imageHint: "Seuls les fichiers PNG sont pris en charge. L'image sera encodée au format base64 dans le code QR.",
        imageButton: "Générer le Code QR",

        // Result Section
        resultTitle: "Résultat du Code QR",
        scanHint: "Scannez le code QR avec un appareil photo mobile ou une application de scanner QR",

        // File Info
        fileInfoTitle: "Informations sur le Fichier",
        fileInfoDefault: "Aucun code QR n'a encore été créé. Sélectionnez le type de données et générez d'abord le code QR.",

        // Download Section
        downloadTitle: "Télécharger le Code QR",
        downloadDesc: "Les fichiers seront enregistrés avec des noms différents selon le type de données:",
        downloadPNG: "Télécharger au format PNG",
        downloadSVG: "Télécharger au format SVG",
        downloadData: "Enregistrer les Données QR",

        // History Section
        historyTitle: "Historique des Codes QR",

        // Footer
        copyright: "©2026 NexaV Studio. Tous droits réservés."
    },

    de: {
        // Header
        title: "QR-Code-Generator",
        description: "Vielseitiges Tool zum Erstellen kostenloser QR-Codes, Bearbeiten und Verfolgen der Kampagnenleistung.",

        // Tabs
        tabLink: "Aus Link",
        tabText: "Aus Text",
        tabImage: "Aus PNG-Bild",

        // Link Tab
        linkLabel: "URL/Link eingeben",
        linkPlaceholder: "Beispiel: https://www.example.com",
        linkHint: "QR-Code leitet zum eingegebenen Link weiter",
        linkButton: "QR-Code generieren",

        // Text Tab
        textLabel: "Text eingeben",
        textPlaceholder: "Geben Sie beliebigen Text ein, den Sie in einen QR-Code umwandeln möchten...",
        textDefault: "Beispieltext zur Umwandlung in einen QR-Code. Sie können Kontaktinformationen, geheime Nachrichten oder andere Daten eingeben.",
        textButton: "QR-Code generieren",

        // Image Tab
        imageLabel: "PNG-Bild hochladen",
        imageUploadText: "Klicken Sie, um ein PNG-Bild hochzuladen",
        imageUploadDesc: "Datei wird in QR-Code umgewandelt",
        imageHint: "Nur PNG-Dateien werden unterstützt. Bild wird als Base64-Format im QR-Code codiert.",
        imageButton: "QR-Code generieren",

        // Result Section
        resultTitle: "QR-Code-Ergebnis",
        scanHint: "Scannen Sie den QR-Code mit Mobilkamera oder QR-Scanner-App",

        // File Info
        fileInfoTitle: "Dateiinformationen",
        fileInfoDefault: "Noch wurde kein QR-Code erstellt. Wählen Sie zuerst den Datentyp aus und generieren Sie den QR-Code.",

        // Download Section
        downloadTitle: "QR-Code herunterladen",
        downloadDesc: "Dateien werden je nach Datentyp mit unterschiedlichen Namen gespeichert:",
        downloadPNG: "Als PNG herunterladen",
        downloadSVG: "Als SVG herunterladen",
        downloadData: "QR-Daten speichern",

        // History Section
        historyTitle: "QR-Code-Verlauf",

        // Footer
        copyright: "©2026 NexaV Studio. Alle Rechte vorbehalten."
    }
};

// Fungsi untuk mengubah bahasa
function changeLanguage(lang) {
    const t = translations[lang] || translations.id;

    // Update semua teks berdasarkan ID atau class
    document.querySelector('title').textContent = t.title + " | QuickScan";
    document.querySelector('header h1').innerHTML = `<i class="fas fa-qrcode"></i> ${t.title}`;
    document.querySelector('header p').textContent = t.description;

    // Update tab
    document.querySelector('[data-tab="link"]').innerHTML = `<i class="fas fa-link"></i> ${t.tabLink}`;
    document.querySelector('[data-tab="text"]').innerHTML = `<i class="fas fa-font"></i> ${t.tabText}`;
    document.querySelector('[data-tab="image"]').innerHTML = `<i class="fas fa-image"></i> ${t.tabImage}`;

    // Update link tab
    document.querySelector('label[for="link-input"]').innerHTML = `<i class="fas fa-globe"></i> ${t.linkLabel}`;
    document.getElementById('link-input').placeholder = t.linkPlaceholder;
    document.querySelector('#link-tab p').textContent = t.linkHint;
    document.getElementById('generate-link-btn').innerHTML = `<i class="fas fa-bolt"></i> ${t.linkButton}`;

    // Update text tab
    document.querySelector('label[for="text-input"]').innerHTML = `<i class="fas fa-align-left"></i> ${t.textLabel}`;
    document.getElementById('text-input').placeholder = t.textPlaceholder;
    if (document.getElementById('text-input').value.includes("Contoh teks")) {
        document.getElementById('text-input').value = t.textDefault;
    }
    document.getElementById('generate-text-btn').innerHTML = `<i class="fas fa-bolt"></i> ${t.textButton}`;

    // Update image tab
    document.querySelector('#image-tab label').innerHTML = `<i class="fas fa-file-image"></i> ${t.imageLabel}`;
    document.querySelector('#image-tab .file-label strong').textContent = t.imageUploadText;
    document.querySelector('#image-tab .file-label p').textContent = t.imageUploadDesc;
    document.querySelector('#image-tab p').textContent = t.imageHint;
    document.getElementById('generate-image-btn').innerHTML = `<i class="fas fa-bolt"></i> ${t.imageButton}`;

    // Update result section
    document.querySelector('.result-container h3').innerHTML = `<i class="fas fa-qrcode"></i> ${t.resultTitle}`;
    document.querySelector('.qr-code-display p').textContent = t.scanHint;

    // Update file info
    document.querySelector('.file-info h4').innerHTML = `<i class="fas fa-info-circle"></i> ${t.fileInfoTitle}`;

    // Update download section
    document.querySelector('.qr-actions h4').innerHTML = `<i class="fas fa-download"></i> ${t.downloadTitle}`;
    document.querySelector('.qr-actions p').textContent = t.downloadDesc;
    document.getElementById('download-png').innerHTML = `<i class="fas fa-image"></i> ${t.downloadPNG}`;
    document.getElementById('download-svg').innerHTML = `<i class="fas fa-download"></i> ${t.downloadSVG}`;
    document.getElementById('download-data').innerHTML = `<i class="fas fa-file-code"></i> ${t.downloadData}`;

    // Update history section
    document.querySelector('.history-section h3').innerHTML = `<i class="fas fa-history"></i> ${t.historyTitle}`;

    // Update footer
    document.querySelector('.copyright p').textContent = t.copyright;

    // Update file info jika ada QR Code yang sudah dibuat
    const fileInfoText = document.getElementById('file-info-text');
    if (fileInfoText.textContent.includes("Belum ada QR Code") ||
        fileInfoText.textContent.includes("No QR Code") ||
        fileInfoText.textContent.includes("Aún no se ha") ||
        fileInfoText.textContent.includes("Aucun code QR") ||
        fileInfoText.textContent.includes("Noch wurde kein")) {
        fileInfoText.textContent = t.fileInfoDefault;
    }

    // Simpan preferensi bahasa ke localStorage
    localStorage.setItem('preferredLanguage', lang);

    // Update pilihan select
    document.getElementById('language-select').value = lang;
}

// Event listener untuk select bahasa
document.getElementById('language-select').addEventListener('change', function (e) {
    const selectedLang = e.target.value;
    changeLanguage(selectedLang);
});

// Load bahasa dari localStorage saat halaman dimuat
document.addEventListener('DOMContentLoaded', function () {
    const savedLang = localStorage.getItem('preferredLanguage') || 'id';
    document.getElementById('language-select').value = savedLang;
    changeLanguage(savedLang);
});