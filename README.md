# **E-ink Wallpaper Maker**

[English](#bookmark=id.qj43bw47r5to) | [简体中文](#bookmark=id.yhyd60tb7tto) | [日本語](#bookmark=id.oocsh9yd6mo9)

## **🇬🇧 English**

**Live Demo:** [https://llizylizy.github.io/EinkWallpaperMaker/](https://llizylizy.github.io/EinkWallpaperMaker/)

E-ink Wallpaper Maker is a fast, offline-capable Progressive Web App (PWA) built with pure Vanilla JavaScript. It allows you to crop, adjust, and optimize images into high-quality screensavers for E-ink displays (Kindle, Kobo, Boox, reMarkable, etc.).

### **✨ Features**

* **No Frameworks:** Built with pure Vanilla JS for maximum performance and a lightweight footprint.  
* **Offline Support:** Fully functions offline as a PWA after the first load.  
* **Advanced Dithering Algorithms:** Supports Floyd-Steinberg, Jarvis-Judice-Ninke (JJN), Ordered/Bayer (2x2, 4x4, 8x8), and Atkinson dithering to perfectly simulate e-ink tones.  
* **Color E-ink Support:** Includes simulation and saturation controls for 4096-color Kaleido 3 / Colorsoft displays.  
* **Image Adjustments:** Fine-tune Brightness, Contrast, Gamma, Sharpness, and Auto-leveling.  
* **True Grayscale Output:** Encodes true 4-bit (16 levels) and 8-bit (256 levels) grayscale PNGs and BMP3 files using browser-native CompressionStream, significantly reducing file size.  
* **Magnifying Loupe:** A 3x pixel-accurate zoom circle to inspect dithering details before downloading.  
* **Profile Management:** Save your custom adjustments and device dimensions by exporting/importing JSON profiles.

### **📱 Supported Devices**

Built-in profiles for popular devices, including:

* **Kindle:** Paperwhite (1-6), Oasis, Scribe, Colorsoft  
* **Kobo:** Libra 2, Elipsa 2E, Libra Colour, Clara Colour  
* **reMarkable:** reMarkable 2  
* **Boox:** Note Air3 / Air3 C, Tab X, Palma  
* **Supernote & PocketBook**  
* *Custom resolution and gray level support available.*

### **🛠 Tech Stack**

* HTML5 / CSS3 / Vanilla JavaScript  
* [Tailwind CSS](https://tailwindcss.com/) (via CDN)  
* [Cropper.js](https://fengyuanchen.github.io/cropperjs/) (for image cropping)

## **🇨🇳 简体中文**

**在线演示:** [https://llizylizy.github.io/EinkWallpaperMaker/](https://llizylizy.github.io/EinkWallpaperMaker/)

E-ink Wallpaper Maker 是一款使用原生 JavaScript 构建的、支持离线使用的渐进式 Web 应用 (PWA)。它可以帮助您裁剪、调整和优化图像，生成适用于各类电子墨水屏设备（如 Kindle, Kobo, Boox, reMarkable 等）的高质量壁纸和屏保。

### **✨ 核心特性**

* **无框架依赖:** 采用纯原生 JS 编写，性能极致，体积轻量。  
* **离线可用:** 作为 PWA 应用，首次加载后即可在无网络环境下完全离线使用。  
* **高级抖动算法 (Dithering):** 支持 Floyd-Steinberg, Jarvis-Judice-Ninke (JJN), 有序抖动/Bayer (2x2, 4x4, 8x8) 以及 Atkinson 算法，完美还原墨水屏灰阶质感。  
* **彩色墨水屏支持:** 专为 Kaleido 3 / Colorsoft 等 4096 色屏幕提供色彩模拟与饱和度调节。  
* **丰富的图像调整:** 支持调节亮度、对比度、伽马值、锐化、反色以及自动色阶等。  
* **原生灰阶输出:** 利用浏览器原生的 CompressionStream 编码输出真正的 4-bit (16灰阶) 和 8-bit (256灰阶) PNG 及 BMP3 文件，大幅减小文件体积。  
* **像素级放大镜:** 提供 3 倍像素级精确放大的预览放大镜，方便在下载前检查抖动细节。  
* **配置文件管理:** 支持将自定义的设备尺寸和参数导出/导入为 JSON 配置文件。

### **📱 支持的设备**

内置多款主流设备预设，包括：

* **Kindle:** Paperwhite (1-6代), Oasis, Scribe, Colorsoft  
* **Kobo:** Libra 2, Elipsa 2E, Libra Colour, Clara Colour  
* **reMarkable:** reMarkable 2  
* **Boox:** Note Air3 / Air3 C, Tab X, Palma  
* **Supernote & PocketBook**  
* *支持完全自定义分辨率和灰阶级别。*

### **🛠 技术栈**

* HTML5 / CSS3 / 原生 JavaScript (Vanilla JS)  
* [Tailwind CSS](https://tailwindcss.com/) (通过 CDN 引入)  
* [Cropper.js](https://fengyuanchen.github.io/cropperjs/) (用于图像裁剪)

## **🇯🇵 日本語**

**ライブデモ:** [https://llizylizy.github.io/EinkWallpaperMaker/](https://llizylizy.github.io/EinkWallpaperMaker/)

E-ink Wallpaper Maker は、Vanilla JavaScript のみで構築された、オフライン対応のプログレッシブ Web アプリ (PWA) です。画像をクロップ・調整し、E-ink ディスプレイ (Kindle、Kobo、Boox、reMarkable など) に最適な高品質の壁紙・スクリーンセーバーに変換します。

### **✨ 主な機能**

* **フレームワーク不要:** Vanilla JS で構築されているため、動作が非常に高速で軽量です。  
* **オフライン対応:** PWA として、初回読み込み後はインターネット接続なしで完全に動作します。  
* **高度なディザリングアルゴリズム:** Floyd-Steinberg、Jarvis-Judice-Ninke (JJN)、Ordered/Bayer (2x2, 4x4, 8x8)、Atkinson ディザリングに対応し、電子ペーパーの階調を美しく再現します。  
* **カラー E-ink 対応:** 4096 色の Kaleido 3 / Colorsoft ディスプレイ向けのシミュレーションと彩度調整機能を搭載しています。  
* **画像調整:** 明るさ、コントラスト、ガンマ、シャープネス、自動レベル補正、色反転を細かく調整可能。  
* **真のグレースケール出力:** ブラウザの CompressionStream を利用し、真の 4-bit (16階調) および 8-bit (256階調) の PNG や BMP3 ファイルを出力。ファイルサイズを大幅に削減します。  
* **ルーペ機能 (拡大鏡):** 3倍のピクセル単位のズームで、ダウンロード前にディザリングの細部を確認できます。  
* **プロファイル管理:** カスタム設定やデバイスの解像度を JSON ファイルとしてエクスポート/インポート可能。

### **📱 対応デバイス**

以下の主要デバイスのプロファイルを内蔵しています：

* **Kindle:** Paperwhite (1-6), Oasis, Scribe, Colorsoft  
* **Kobo:** Libra 2, Elipsa 2E, Libra Colour, Clara Colour  
* **reMarkable:** reMarkable 2  
* **Boox:** Note Air3 / Air3 C, Tab X, Palma  
* **Supernote & PocketBook**  
* *カスタム解像度とグレー階調の指定も可能です。*

### **🛠 使用技術**

* HTML5 / CSS3 / Vanilla JavaScript  
* [Tailwind CSS](https://tailwindcss.com/) (CDN 経由)  
* [Cropper.js](https://fengyuanchen.github.io/cropperjs/) (画像クロップ用)
