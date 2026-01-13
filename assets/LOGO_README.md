# SpendSwipe Logo

This directory contains the logo files for the SpendSwipe app.

## Files

- **logo.svg** - Main logo (512x512) for general use
- **icon.svg** - App icon version (1024x1024) optimized for app icons

## Design

The logo combines:
- A **card/expense element** (white card with transaction lines) representing expense tracking
- A **swipe gesture** (curved arrow) representing the Tinder-style swipe interface
- **Purple gradient** (#8B5CF6 to #6200EE) matching the app's color scheme

## Usage

### In React Native Components

1. **Using SVG (Recommended)** - Install react-native-svg:
   ```bash
   npx expo install react-native-svg
   ```
   Then use the SVG files directly or create a component using `react-native-svg`.

2. **Using Image Component** - For simple use cases, you can convert the SVG to PNG and use:
   ```jsx
   import { Image } from 'react-native';
   <Image source={require('../assets/logo.png')} style={{ width: 64, height: 64 }} />
   ```

3. **Using the Logo Component** - Import the Logo component:
   ```jsx
   import Logo from './src/components/Logo';
   <Logo size={64} />
   ```

### Converting SVG to PNG for App Icons

For Expo app icons, you'll need PNG files. You can:

1. **Use an online converter**:
   - Visit https://cloudconvert.com/svg-to-png
   - Upload `icon.svg`
   - Set size to 1024x1024
   - Download and save as `icon.png` in the `assets` folder

2. **Use ImageMagick** (if installed):
   ```bash
   convert -background none -size 1024x1024 icon.svg icon.png
   ```

3. **Update app.json**:
   ```json
   {
     "expo": {
       "icon": "./assets/icon.png"
     }
   }
   ```

### Required Icon Sizes for Expo

- **icon.png**: 1024x1024 (main app icon)
- **adaptiveIcon** (Android): 1024x1024 foreground, 1024x1024 background
- **splash**: 1242x2436 (iOS), 2048x2732 (Android)

## Color Scheme

- Primary Purple: `#6200EE`
- Secondary Purple: `#8B5CF6`
- White: `#FFFFFF`

## License

This logo is part of the SpendSwipe project and follows the same license as the project.

