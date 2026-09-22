# PixelForge

A mobile wallpaper app that combines Pexels-powered discovery with a built-in layer-based wallpaper editor.

## Overview

PixelForge is a React Native (Expo) app with two halves: a discovery/library side for browsing and saving wallpapers pulled from the Pexels API, and a Creator Studio for building your own wallpapers from scratch using gradients, text, images, and drawing tools on a layered canvas. User accounts, favorites, and projects are backed by Firebase, with a guest mode for local-only use.

## Problem It Solves

Most wallpaper apps are either a static gallery or a separate design tool — not both. PixelForge lets a user discover a wallpaper they like and then remix or personalize it (add text, stickers, gradients) inside the same app, without exporting to a third-party editor.

## Key Features

- **Wallpaper discovery** — category browsing, search, infinite scroll, and 10+ themed categories (AMOLED, Minimal, Nature, Space, etc.) backed by the Pexels API
- **Library** — download wallpapers for offline use, favorite/sync them, and organize into custom collections
- **Creator Studio** — a layer-based canvas editor: drag/scale/rotate layers, gradient and image backgrounds, a text tool, stickers, freehand drawing, and undo/redo
- **Project persistence** — projects are auto-saved locally via AsyncStorage for guests, and synced to Firestore for signed-in users (`EditorService`)
- **Auth system** — email/password and Google Sign-In via Firebase Auth, plus a guest mode that keeps working entirely offline
- **Theming** — light, dark, and true-black AMOLED modes via a `ThemeContext`

## What's Unique About It

- **Dual-mode data layer**: the editor and library work fully offline for guests (AsyncStorage) and transparently switch to Firestore-backed sync once a user signs in — the same `EditorService`/`FavoritesService` APIs serve both.
- Wallpaper discovery and creation live in one navigation flow, so a Pexels wallpaper can be opened directly into the editor rather than only saved or downloaded.

## Tech Stack

- **Framework**: React Native via Expo (~54)
- **Language**: JavaScript (JSX)
- **Backend**: Firebase (Auth, Firestore)
- **Wallpaper source**: Pexels API
- **Navigation**: React Navigation (native-stack + bottom-tabs)
- **State**: React Context (`AuthContext`, `EditorContext`, `LibraryContext`, `ThemeContext`, `AlertContext`)
- **Image/export**: `expo-image-manipulator`, `expo-file-system`, `expo-media-library`, `react-native-view-shot`
- **Wallpaper setting**: `rn-expo-wallpaper-manager`

## Project Structure

```
PixelForge/
├── assets/              # Images, gradients
├── src/
│   ├── components/      # Reusable UI components
│   ├── constants/       # Categories, theme tokens
│   ├── context/         # React Context providers (auth, editor, library, theme, alerts)
│   ├── navigation/      # Navigation configuration
│   ├── screens/         # App screens (incl. auth/, Creator, Editor, Library, Search...)
│   ├── services/        # AuthService, EditorService, ExportService, PexelsService, ...
│   └── utils/           # Image and wallpaper helpers
├── plugins/
│   └── withAndroidWallpaperConfig.js  # Custom Expo config plugin for Android wallpaper support
├── App.js
├── app.json
└── firebase.config.js
```

## Getting Started

### Prerequisites

- Node.js >= 18
- Expo CLI
- A Firebase project (Auth + Firestore enabled)
- A Pexels API key

### Installation

```bash
npm install
cp .env.example .env
```

Fill in `.env` with a Pexels API key from [pexels.com/api](https://www.pexels.com/api/), and set up `firebase.config.js` with your Firebase project's Auth + Firestore credentials.

### Run the App

```bash
npm start            # expo start
npm run android       # expo run:android
npm run ios           # expo run:ios
npm run web           # expo start --web
```

## Notes

- Wallpaper export (`ExportService.exportProject`) currently returns a generated filename but does not yet render the composited layers to a final image file — canvas rasterization is a known gap rather than a finished feature.
