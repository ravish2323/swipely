# SwipeLy - Quick App Summary for UI/UX Design

## What It Does
SwipeLy is a React Native expense tracker that automatically reads SMS from banks, extracts transactions, and lets users categorize them via Tinder-style swipes.

## Core Features

### 1. SMS Transaction Parsing
- Auto-detects financial transactions from SMS
- Extracts amounts, sender, timestamp
- Confidence scoring (0-100%)
- Duplicate prevention

### 2. Review Screen (Main Screen)
**Swipeable Cards** with transaction details:
- **Swipe Right** → Confirm (Green)
- **Swipe Left** → Reject (Red)  
- **Swipe Up** → Favorite (Blue)
- **Swipe Down** → Food category (Yellow)

**UI Elements:**
- Filter bar (Today/Week/Month/All)
- Cards remaining counter + Eye button (pill layout)
- Action buttons (appear when star pressed)
- Completion star animation
- Empty state with "All Done!" message

### 3. Summary Screen (Dashboard)
- Animated stat cards (Confirmed, Rejected, Favorite, Pending, Food)
- Total amounts and counts
- Database management (Clear/Reset)
- Pull-to-refresh
- Right-edge swipe to peek Review screen

## Current Design
- **Colors**: Purple primary (#8B5CF6), Green/Red/Blue/Yellow for actions
- **Style**: Card-based, rounded corners (24px), soft shadows
- **Fonts**: Inter (body), Space Grotesk (headings)
- **Layout**: ScreenShell wrapper, SafeAreaView, pill components

## Pain Points to Fix
1. Action buttons toggle on click (should only hide on outside tap)
2. Card sizing doesn't fit all screens perfectly
3. Navigation not discoverable
4. Information density could be better
5. Limited visual feedback
6. Basic loading states

## Tech Stack
- React Native (Expo SDK 54)
- SQLite database
- React Navigation
- Animated API + PanResponder

## What We Need
Modern, clean UI redesign focusing on:
- Better visual hierarchy
- Improved spacing & typography
- Clearer navigation patterns
- Enhanced animations
- Better empty states
- More intuitive component layouts

**Target**: iOS & Android, React Native components, 60fps animations

---

**Use this to design improved UI/UX while keeping core swipe functionality intact.**

