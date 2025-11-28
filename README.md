# VeloVibe - HIIT Tracker

![App Icon](public/favicon.png)

VeloVibe is a sleek and modern High-Intensity Interval Training (HIIT) tracker designed to help you monitor your workout progress. Log your sessions, track your calories, and visualize your trends with a beautiful, dark-themed interface.

## Features

- **Log Workouts:** Quickly add new workout sessions with date and calories burned.
- **Custom Exercises:** Create and manage your own list of exercises.
- **Track Progress:** View key statistics and a trend chart of your performance.
- **Modern UI:** A beautiful dark theme with neon accents.
- **Cross-Platform:** Runs on the web, Android, and iOS thanks to Capacitor.

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later)
- [npm](https://www.npmjs.com/)
- For Android: [Android Studio](https://developer.android.com/studio) and the Android SDK.
- For iOS: [Xcode](https://developer.apple.com/xcode/) (on a macOS machine).

### Installation

1.  **Clone the repository:**
    ```bash
    git clone <repository_url>
    cd velovibe_-hiit-tracker
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

## Development

To run the app in a web browser for development with live reload:

```bash
npm run dev
```

## Building for Production

To build the web app for production:

```bash
npm run build
```
The production-ready files will be in the `dist/` directory.

## Running on Mobile (Android & iOS)

This project uses [Capacitor](https://capacitorjs.com/) to run as a native mobile app.

### Android

1.  **Build the web app:**
    ```bash
    npm run build
    ```

2.  **Sync the web assets with the Android project:**
    ```bash
    npx cap sync android
    ```

3.  **Run on a connected device or emulator:**
    ```bash
    npx cap run android
    ```

    **Note:** You may need to set the `ANDROID_HOME` environment variable if the command fails.

    **Wireless Debugging Tip:** If you are using wireless debugging and the connection fails, you may need to re-pair and re-connect your device using `adb pair` and `adb connect`. VPNs like Cloudflare WARP can interfere with the connection.

### iOS

1.  **Add the iOS platform (only needs to be done once):**
    ```bash
    npx cap add ios
    ```

2.  **Build the web app:**
    ```bash
    npm run build
    ```

3.  **Sync the web assets with the iOS project:**
    ```bash
    npx cap sync ios
    ```

4.  **Open the project in Xcode:**
    ```bash
    npx cap open ios
    ```

5.  **Run the app:** From Xcode, you can run the app on a simulator or a connected physical device.