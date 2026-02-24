<div align="center">

[![Forks][forks-shield]][forks-url] [![Stargazers][stars-shield]][stars-url] [![Issues][issues-shield]][issues-url] [![Unlicense License][license-shield]][license-url]

<p align="center">
  <a href="https://ryuz-v.github.io/Space/" 
     target="_blank" 
     style="background-color: #c30000; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
     Deploy Now
  </a>
</p>
</div>

# QuickScan - QR Code Generator

A powerful, user friendly, and feature-rich QR Code Generator built with vanilla JavaScript. QuickScan allows users to generate QR codes from various data types including Links, Text, and Images, with support for multiple languages and export formats.

## 🌟 Features

### Core Functionality
- **Multiple Data Types**:
  - 🔗 **Link**: Convert URLs into scannable QR codes.
  - 📝 **Text**: Encode plain text, messages, or contact info.
  - 🖼️ **Image**: Convert PNG images into Base64 encoded QR codes.
- **Export Options**:
  - Download as **PNG** (Raster image).
  - Download as **SVG** (Vector graphic for high-quality scaling).
  - Save raw **JSON** data containing the content and timestamp.

### User Experience
- **History Management**: Automatically saves the last 10 generated QR codes in your browser's local storage, allowing you to revisit previous codes.
- **Internationalization (i18n)**: Fully localized interface supporting 5 languages:
  - 🇮🇩 Indonesian (ID)
  - 🇺🇸 English (EN)
  - 🇪🇸 Spanish (ES)
  - 🇫🇷 French (FR)
  - 🇩🇪 German (DE)
- **Interactive UI**:
  - Smooth tab switching.
  - Animated social media icons with ripple effects.
  - FAQ Accordion system.
  - Visual timeline scroll progress indicator.

## 🛠️ Technologies Used

- **HTML5**
- **CSS3** (Animations, Responsive Design)
- **JavaScript** (ES6+)
- **Libraries**:
  - [QRCode.js](https://davidshimjs.github.io/qrcodejs/) (for QR generation)
  - [FontAwesome](https://fontawesome.com/) (for icons)

## 🚀 How to Use

1. **Open the Application**: Launch `index.html` in your web browser.
2. **Select a Mode**: Click on the tabs to choose between **Link**, **Text**, or **Image**.
3. **Input Data**:
   - *Link*: Paste a valid URL (e.g., `https://google.com`).
   - *Text*: Type any message.
   - *Image*: Upload a PNG file.
4. **Generate**: Click the "Generate QR Code" button.
5. **Download**: Use the action buttons below the QR code to save it as PNG, SVG, or save the data record.

## 📂 Project Structure

```text
/
├── index.html      # Main HTML structure
├── style.css       # Styles and animations
├── script.js       # Application logic, translations, and event handlers
└── README.md       # Project documentation
```

## 🌐 Localization

The application handles translations dynamically via JavaScript. Language preferences are saved to `localStorage`, ensuring the app remembers your choice on the next visit.

## 📜 License

© 2026 **NexaV Studio**. All rights reserved.