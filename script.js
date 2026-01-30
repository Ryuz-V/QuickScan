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
            document.getElementById('image-input').addEventListener('change', function(e) {
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
            reader.onload = function(e) {
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
            const svgBlob = new Blob([svgString], {type: 'image/svg+xml'});
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
            const blob = new Blob([dataStr], {type: 'application/json'});
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
            switch(type) {
                case 'link': return 'Link';
                case 'text': return 'Teks';
                case 'image': return 'Gambar PNG';
                default: return 'Tidak diketahui';
            }
        }
        
        // Fungsi bantu untuk mendapatkan icon tipe
        function getTypeIcon(type) {
            switch(type) {
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
    icon.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-5px) scale(1.1)';
    });
    
    // Kembali ke normal saat mouse leave
    icon.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0) scale(1)';
    });
    
    // Efek klik
    icon.addEventListener('click', function(e) {
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