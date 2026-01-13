# SwipeLy - SMS-Based Expense Tracker App Summary

## App Overview
**SwipeLy** (formerly SpendSwipe) is a React Native mobile expense tracking app that automatically parses SMS messages from banks and payment services to extract financial transactions. Users review and categorize transactions through an intuitive Tinder-style swipe interface, making expense tracking quick and engaging.

**Tagline:** "Swipe your expenses into control"

---

## Core Value Proposition
- **Automated Transaction Detection**: Automatically reads SMS messages and extracts financial transactions
- **Quick Review Process**: Tinder-style swipe interface for fast transaction categorization
- **Smart Parsing**: AI-powered confidence scoring to identify valid transactions
- **Local-First**: All data stored locally using SQLite (privacy-focused)
- **Zero Manual Entry**: No need to manually type expenses

---

## Key Features

### 1. SMS Transaction Parsing
- **Automatic SMS Reading**: Scans incoming SMS messages from banks/payment services
- **Smart Detection**: Uses regex patterns and keyword matching to identify:
  - Currency symbols (₹, Rs, INR)
  - Debit/Credit keywords (debited, credited, paid, received)
  - Transaction amounts
  - Sender information
- **Confidence Scoring**: Each transaction gets a confidence score (0.0-1.0) based on:
  - Presence of currency symbols
  - Transaction keywords
  - Amount extraction accuracy
  - Context analysis (distinguishes balance vs transaction amounts)
- **Mock Data Support**: Includes realistic mock SMS data for testing when permissions unavailable
- **Duplicate Prevention**: Automatically skips duplicate transactions

### 2. Review Screen (Main Interaction)
**Purpose**: Review and categorize pending transactions through swipe gestures

**Key Components:**
- **Swipeable Cards**: Each transaction displayed as a card showing:
  - Sender name (bank/service)
  - Full SMS body text
  - Extracted amount (if detected)
  - Timestamp
  - Confidence percentage badge
- **Swipe Actions** (4 directions):
  - **Swipe Right (Green)**: Confirm transaction → Status: `confirmed`
  - **Swipe Left (Red)**: Reject/Discard → Status: `rejected`
  - **Swipe Up (Blue)**: Mark as Favorite/Special → Status: `special`
  - **Swipe Down (Yellow)**: Mark as Food → Status: `confirmed` + Category: `food`
- **Action Buttons**: Alternative to swiping (appears when star button pressed):
  - Reject (X icon)
  - Favorite (Star icon)
  - Food (Restaurant icon)
  - Confirm (Checkmark icon)
- **Filter Bar**: Date filtering options (Today, This Week, This Month, All Time)
- **Eye Button**: Hold to view last processed transaction (modal with transaction details)
- **Cards Remaining Counter**: Shows number of pending transactions
- **Completion Animation**: Star celebration animation when all cards processed
- **Empty State**: Animated star with "All Done!" message

**Visual Feedback:**
- Cards change background color based on swipe direction (real-time preview)
- Smooth animations with velocity-based timing
- Card rotation and opacity changes during swipe
- Action buttons replace bottom bar when active

### 3. Summary Screen (Dashboard)
**Purpose**: View statistics and manage transaction data

**Key Components:**
- **Summary Grid**: Animated stat cards showing:
  - Confirmed transactions (count + total amount)
  - Rejected transactions (count)
  - Special/Favorite transactions (count + total)
  - Pending transactions (count)
  - Food category transactions (count + total)
  - Average confidence score
- **Stats Card**: Detailed breakdown of transaction statistics
- **Database Card**: Management options:
  - Clear all transactions
  - Reset database
- **Pull-to-Refresh**: Refresh data by pulling down
- **Swipe Navigation**: Right-edge swipe to peek at Review screen

**Data Display:**
- Transaction counts
- Total amounts (in ₹)
- Confidence metrics
- Recent transaction lists

### 4. Transaction Management
- **Status Types**:
  - `pending`: Awaiting review
  - `confirmed`: Approved transaction
  - `rejected`: Discarded transaction
  - `special`: Favorite/important transaction
- **Categories**:
  - `food`: Food-related expenses
  - (Extensible for future categories)
- **Database Operations**:
  - Save new transactions
  - Update status
  - Update category
  - Query by status/category
  - Get summary statistics
  - Clear/reset database

---

## User Flows

### Primary Flow: Transaction Review
1. App automatically detects SMS transactions
2. User opens Review screen
3. Sees pending transactions as swipeable cards
4. Swipes card in desired direction (or uses action buttons)
5. Card animates off screen
6. Next card appears
7. Process repeats until all transactions reviewed
8. Completion animation plays
9. Auto-navigates to Summary screen

### Secondary Flow: View Statistics
1. User navigates to Summary screen
2. Views transaction statistics
3. Can refresh data
4. Can manage database (clear/reset)
5. Can swipe right edge to peek at Review screen

### Alternative Flow: Manual Actions
1. User presses star button on Review screen
2. Action buttons appear at bottom
3. User taps desired action button
4. Transaction processed
5. Action buttons remain visible until user taps outside
6. Buttons hide when no cards remain

---

## Technical Stack
- **Framework**: React Native (Expo SDK 54)
- **React**: 19.1.0
- **Navigation**: React Navigation (Native Stack)
- **Database**: SQLite (expo-sqlite)
- **Animations**: React Native Animated API
- **Gestures**: PanResponder for swipe detection
- **Fonts**: Inter, Space Grotesk (Google Fonts)
- **Icons**: Ionicons (@expo/vector-icons)
- **Platform**: iOS & Android compatible

---

## Current UI/UX Characteristics

### Design Style
- **Color Scheme**:
  - Primary: Purple (#8B5CF6, #6366F1)
  - Success: Green (#e8f7f0)
  - Reject: Red (#ffe6e6)
  - Favorite: Blue (#edf0ff)
  - Food: Yellow (#fff5d9)
  - Background: White (#FFFFFF)
  - Text: Dark gray (#1F2937, #6B7280)
- **Typography**: Inter (body), Space Grotesk (headings)
- **Spacing**: Consistent spacing system (xs, sm, md, lg, xl, xxl)
- **Shadows**: Subtle elevation for cards and buttons
- **Border Radius**: 24px for cards, 18-24px for buttons/pills

### Layout Structure
- **ScreenShell**: Consistent wrapper with header, body, top/bottom slots
- **SafeAreaView**: Ensures content doesn't overlap system UI
- **Card-Based Design**: Primary content in card format
- **Pill Components**: Rounded pill-shaped UI elements for buttons/counters
- **Modal Overlays**: For eye button preview and action feedback

### Interaction Patterns
- **Swipe Gestures**: Primary interaction method (Tinder-style)
- **Tap Gestures**: Secondary actions (buttons, navigation)
- **Hold Gestures**: Eye button (press and hold to view)
- **Pull-to-Refresh**: Summary screen data refresh
- **Edge Swipes**: Navigation between screens (Summary → Review peek)

### Animations
- **Card Swipes**: Smooth, velocity-based animations
- **Color Transitions**: Real-time background color changes
- **Star Celebration**: Scale, rotate, pulse animations
- **Stat Cards**: Staggered entrance animations
- **Modal Transitions**: Fade in/out for modals

---

## Current Pain Points & Areas for Improvement

### UX Issues
1. **Action Button Visibility**: Buttons toggle on/off when clicked - should only hide on outside tap
2. **Card Sizing**: Cards may not fit perfectly in all screen sizes
3. **Navigation Clarity**: Edge swipe navigation might not be discoverable
4. **Empty State**: Could be more engaging
5. **Feedback**: Limited visual feedback for actions
6. **Onboarding**: No tutorial for first-time users

### UI Issues
1. **Information Density**: Summary screen could be more scannable
2. **Color Coding**: Could be more intuitive for transaction types
3. **Typography Hierarchy**: Could be clearer
4. **Spacing**: Some areas feel cramped
5. **Icon Usage**: Inconsistent icon sizes and styles
6. **Loading States**: Basic loading indicators

---

## Target Users
- **Primary**: Tech-savvy individuals who receive many transaction SMS
- **Secondary**: People who want to track expenses without manual entry
- **Tertiary**: Users who prefer gamified/engaging interfaces over traditional forms

---

## Success Metrics (Potential)
- Number of transactions processed per session
- Time to process a transaction
- User retention rate
- Transaction accuracy (confidence scores)
- Database size (number of transactions stored)

---

## Future Enhancement Ideas
- Category management (custom categories)
- Export functionality (CSV, PDF)
- Recurring transaction detection
- Budget tracking
- Charts and visualizations
- Search and filter improvements
- Cloud sync
- Multi-currency support
- Receipt photo attachment
- Recurring payment reminders

---

## Design Requirements for ChatGPT

### What We Need:
1. **Modern, Clean UI Design**: 
   - Improve visual hierarchy
   - Better color usage
   - Enhanced spacing and typography
   - More polished components

2. **Better UX Patterns**:
   - Clearer navigation
   - More intuitive gestures
   - Better feedback mechanisms
   - Improved empty states
   - Onboarding flow

3. **Component Redesigns**:
   - Review screen card layout
   - Summary screen dashboard
   - Action buttons placement and behavior
   - Filter bar design
   - Bottom navigation

4. **Animation Improvements**:
   - Smoother transitions
   - More delightful micro-interactions
   - Better loading states
   - Enhanced celebration animations

5. **Accessibility**:
   - Better contrast ratios
   - Larger touch targets
   - Screen reader support
   - Haptic feedback

### Design Constraints:
- Must work on both iOS and Android
- React Native components only
- Expo SDK 54 compatible
- Performance: 60fps animations
- Screen sizes: Small phones to tablets
- Dark mode: Not yet implemented (future consideration)

---

## Key Screens to Redesign

1. **Review Screen** (Primary)
   - Card design and layout
   - Action button placement
   - Filter bar
   - Bottom navigation
   - Empty state

2. **Summary Screen** (Secondary)
   - Dashboard layout
   - Stat card design
   - Data visualization
   - Database management UI

3. **Loading/Splash Screen**
   - App initialization
   - Logo animation
   - Error states

4. **Modal Components**
   - Eye button preview
   - Action feedback
   - Confirmation dialogs

---

## Brand Identity
- **Name**: SwipeLy
- **Personality**: Modern, Fast, Intuitive, Playful
- **Tone**: Clean, Minimal, Efficient
- **Visual Style**: Card-based, Rounded, Soft shadows, Vibrant accents

---

This document provides a comprehensive overview of the SwipeLy app for UI/UX design purposes. Use this to create improved designs that enhance user experience while maintaining the core functionality and interaction patterns.

