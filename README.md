# SpendSwipe - SMS-Based Expense Tracker

A React Native mobile app that automatically parses SMS messages for financial transactions and presents them in a Tinder-style swipe interface for manual verification.

## Features

- 📱 **SMS Reading**: Automatically reads and processes incoming SMS messages (with mock data fallback)
- 🤖 **Smart Parsing**: Uses regex and keyword matching to detect financial transactions
- 💳 **Tinder-Style Review**: Swipe right (confirm), left (discard), or up (special) on transaction cards
- 📊 **Summary Dashboard**: View statistics and recent confirmed transactions
- 💾 **SQLite Storage**: Local database for transaction persistence
- 🎯 **Confidence Scoring**: Each parsed transaction gets a confidence score (0-1)
- ✅ **Expo SDK 54 Compatible**: Works with latest Expo Go app

## Tech Stack

- React Native (Expo SDK 54)
- React 19.1.0
- SQLite (expo-sqlite)
- React Navigation
- React Native Gesture Handler & Reanimated

## Installation

1. Install dependencies:
```bash
cd spendswipe
npm install
```

**Note for Windows PowerShell users:** If you get an execution policy error, use `npm.cmd install` instead.

2. Fix Expo package versions (recommended):
```bash
npx expo install --fix
```

3. Start the development server:
```bash
npm start
```

**Windows PowerShell users:** Use `npm.cmd start` if needed.

4. Run on device:
   - **Option A (Recommended):** Use Expo Go app - scan the QR code
   - **Option B:** Press `a` for Android emulator (requires Android Studio setup)

## Project Structure

```
spendswipe/
├── App.js                 # Main app component with navigation
├── src/
│   ├── components/
│   │   └── SwipeCard.js   # Tinder-style swipeable card component
│   ├── screens/
│   │   ├── ReviewScreen.js    # Main swipe interface
│   │   └── SummaryScreen.js   # Statistics dashboard
│   └── services/
│       ├── database.js    # SQLite database operations
│       ├── parser.js      # Transaction parsing logic
│       └── smsService.js  # SMS reading service (with mock data)
├── app.json               # Expo configuration (SDK 54)
└── package.json           # Dependencies
```

## Permissions

The app requires SMS read permissions on Android. If permissions are not granted, the app will automatically use mock data for development.

### Android Permissions (in app.json):
- `android.permission.RECEIVE_SMS`
- `android.permission.READ_SMS`
- `android.permission.SEND_SMS`

## Features in Detail

### 1. SMS Parser
- Detects currency symbols (₹, Rs, INR)
- Identifies debit/credit keywords
- Extracts amounts using regex patterns
- Calculates confidence scores based on keyword matches

### 2. Swipe Interactions
- **Swipe Right (Green)**: Confirm transaction → Status: `confirmed`
- **Swipe Left (Red)**: Discard transaction → Status: `rejected`
- **Swipe Up (Blue)**: Mark as special → Status: `special`

### 3. Database Schema
```sql
transactions (
  id INTEGER PRIMARY KEY,
  sender TEXT,
  body TEXT,
  amount REAL,
  timestamp INTEGER,
  status TEXT,        -- 'pending', 'confirmed', 'rejected', 'special'
  confidence REAL     -- 0.0 to 1.0
)
```

## Mock Data

The app includes realistic mock SMS messages from various Indian banks and payment services for testing when SMS permissions aren't available.

## Development Notes

- The SMS reading functionality requires native code implementation for full functionality
- Currently uses mock data when permissions aren't available
- SQLite database is initialized on app startup
- All pending transactions from today are shown in the review screen
- **Upgraded to Expo SDK 54** - fully compatible with Expo Go

## Compatibility

- ✅ **Expo SDK 54**
- ✅ **React 19.1.0**
- ✅ **React Native 0.81.5**
- ✅ **Expo Go app** (latest version)

## Future Enhancements

- TensorFlow Lite integration for smart categorization
- Firebase backend for cloud sync
- Advanced filtering and search
- Export functionality (CSV, PDF)
- Recurring transaction detection
- Category tagging

## Troubleshooting

See `SETUP.md` for detailed setup and troubleshooting instructions.

## License

MIT

git add .
git commit -m "HOHO"
git push