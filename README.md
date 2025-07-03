# Paroliamo – Italian Word Game

A classic-style **word game** inspired by the Italian TV show _Paroliamo_, built in **React Native**. Generate a grid of letters, form as many words as possible before time runs out, and challenge your vocabulary!

## Features

- Configurable letter matrix (default 5×5)
- Italian alphabet with weighted probabilities
- Customizable countdown duration
- Visual and audio 3-2-1 start countdown
- Red flashing timer below 10 seconds
- End-of-game sound alert
- Pause, resume, and shuffle functionality
- Native launcher icon and sounds

## Getting Started

> **Note**: Make sure you’ve completed the [React Native Environment Setup](https://reactnative.dev/docs/environment-setup) before proceeding.

### 1. Install Dependencies

```bash
npm install
```

### 2. Link Assets

We use custom sounds (e.g., `beep.mp3`) stored in the `assets/sounds` folder. These need to be linked to native builds:

```bash
npx react-native-asset
```

### 3. Start Metro Server

```bash
npm start
```

### 4. Run the App

#### Android
```bash
npm run android
```

#### iOS
```bash
npm run ios
```

> ⚠️ For **standalone APK builds**, see the section below.

---

## Building a Standalone APK (Android)

To generate a debug APK you can install on a physical device:

```bash
cd android
./gradlew assembleDebug
```

The APK will be generated at:

```
android/app/build/outputs/apk/debug/app-debug.apk
```

Transfer it to your Android device and install it manually.

> ⚠️ If you see an error like:
> _"Unable to load script. Make sure you’re either running Metro or that your bundle 'index.android.bundle' is packaged for release"_
>
> Then you must create a release bundle:

```bash
npx react-native bundle \
  --platform android \
  --dev false \
  --entry-file index.js \
  --bundle-output android/app/src/main/assets/index.android.bundle \
  --assets-dest android/app/src/main/res
```

If `android/app/src/main/assets` doesn’t exist, create it manually.

Then rebuild:

```bash
cd android
./gradlew assembleRelease
```

Install the generated `app-release.apk`.

---

## Post-Install Summary

If you reset or clone the project again, run:

```bash
npm install
npx react-native-asset
```

This ensures your custom assets (like `beep.mp3`) are correctly linked.

---

## Project Structure

```
Paroliamo/
├── assets/
│   └── sounds/
│       └── beep.mp3
├── components/
│   ├── Matrix.tsx
│   └── SettingsPanel.tsx
├── utils/
│   ├── matrixGenerator.ts
│   └── letterGenerator.ts
├── App.tsx
└── Paroliamo.tsx
```

---

## License

MIT
