# PixelForge 🎨

**Create & Discover Stunning Wallpapers**

PixelForge is a complete mobile wallpaper application that combines powerful discovery features with a built-in creative studio. Browse thousands of high-quality wallpapers from Pexels, or create your own masterpieces with professional editing tools.

## ✨ Features

### 📱 Discovery

- Browse curated wallpaper collections
- Search with filters and categories
- 10+ themed categories (AMOLED, Minimal, Nature, Space, etc.)
- Infinite scroll and pull-to-refresh
- Recent searches and trending suggestions

### 💾 Library

- Download wallpapers for offline access
- Sync favorites across devices
- Create custom collections
- View download and browsing history

### 🎨 Creator Studio

- **Layer-based editing** with drag, scale, and rotate
- **Backgrounds & Gradients** with 10+ preset packs
- **Text tool** with multiple fonts and effects
- **Sticker library** for creative elements
- **Image import** from gallery or camera
- **Drawing tools** with brush and pen
- **Undo/Redo** functionality
- **Project management** with auto-save
- **Export** in multiple formats and resolutions

### 🔐 User System

- Email/password authentication
- Google Sign-In support
- Guest mode for quick access
- Cloud sync for authenticated users
- Profile management

### 🌗 Themes

- Light mode
- Dark mode
- AMOLED mode (true black)

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Expo CLI
- iOS Simulator or Android Emulator (optional)

### Installation

1. **Clone the repository**

```bash
cd PixelForge
```

2. **Install dependencies**

```bash
npm install
```

3. **Configure environment variables**
   Create a `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

4. **Add your API keys**

- Get a free Pexels API key from [https://www.pexels.com/api/](https://www.pexels.com/api/)
- Create a Firebase project and add your configuration

5. **Start the development server**

```bash
npm start
```

6. **Run on device/emulator**

- Press `i` for iOS simulator
- Press `a` for Android emulator
- Scan QR code with Expo Go app on your phone

## 🔧 Configuration

### Firebase Setup

1. Create a Firebase project at [https://console.firebase.google.com/](https://console.firebase.google.com/)
2. Enable Authentication (Email/Password and Google)
3. Create a Firestore database
4. Enable Firebase Storage
5. Copy your Firebase config to `firebase.config.js`

### Pexels API

1. Sign up at [https://www.pexels.com/api/](https://www.pexels.com/api/)
2. Generate an API key
3. Add it to your `.env` file

## 📁 Project Structure

```
PixelForge/
├── assets/              # Images, fonts, gradients
├── src/
│   ├── components/      # Reusable UI components
│   │   ├── common/      # Shared components
│   │   └── editor/      # Editor-specific components
│   ├── constants/       # App constants and themes
│   ├── context/         # React Context providers
│   ├── navigation/      # Navigation configuration
│   ├── screens/         # App screens
│   │   └── auth/        # Authentication screens
│   ├── services/        # API and business logic
│   └── utils/           # Utility functions
├── App.js               # App entry point
├── app.json             # Expo configuration
└── firebase.config.js   # Firebase initialization
```

## 🛠️ Tech Stack

- **Framework**: React Native (Expo)
- **Language**: JavaScript
- **Backend**: Firebase (Auth, Firestore, Storage)
- **API**: Pexels API
- **Navigation**: React Navigation
- **State Management**: React Context
- **Image Manipulation**: Expo Image Manipulator
- **Gestures**: React Native Gesture Handler

## 📱 Screenshots

_(Add your app screenshots here)_

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Wallpaper images powered by [Pexels](https://www.pexels.com/)
- Icons by [Ionicons](https://ionic.io/ionicons)

## 📞 Support

For support, email support@pixelforge.app or open an issue in this repository.

---

**Made with ❤️ by the PixelForge Team**
