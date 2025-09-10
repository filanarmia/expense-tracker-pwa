# Expense Tracker PWA

A super-fast way to record and review your daily spending. Built as a Progressive Web App (PWA) that works offline and can be installed on your iPhone's home screen.

## Features

- ⚡ **Quick Add Flow**: Add expenses from iOS Shortcuts with just 3 parameters
- 📊 **Smart Analytics**: Daily lists, weekly bar charts, monthly pie & line charts  
- 🏷️ **Categories**: 8 default categories + ability to add custom ones
- 💾 **Local Storage**: All data stored locally using IndexedDB (no backend needed)
- 🌙 **Theme Toggle**: Dark and light theme support
- 📱 **Mobile First**: Optimized for iPhone with native app-like experience
- 📤 **Export**: Export data as CSV or JSON
- 🔄 **Offline Ready**: Service Worker enables offline functionality

## Installation

### On iPhone (iOS Safari)

1. Open Safari and navigate to your PWA URL
2. Tap the Share button (square with arrow up)
3. Select "Add to Home Screen"
4. Customize the name if desired and tap "Add"
5. The app will appear on your home screen like a native app

### Local Development

1. Download all files to a folder
2. Serve the files using a local web server:
   ```bash
   # Using Python 3
   python -m http.server 8000
   
   # Using Node.js http-server
   npx http-server
   
   # Using PHP
   php -S localhost:8000
   ```
3. Open `http://localhost:8000` in your browser

## iOS Shortcuts Integration

### Setting up Quick Add Shortcut

1. Open the **Shortcuts** app on your iPhone
2. Tap the "+" to create a new shortcut
3. Add the following actions:

   **Action 1: Ask for Input**
   - Input Type: Number
   - Prompt: "How much did you spend?"
   - Variable Name: `Amount`

   **Action 2: Ask for Input**
   - Input Type: Text  
   - Prompt: "What did you buy? (optional)"
   - Variable Name: `Note`
   - Allow Empty: Yes

   **Action 3: Choose from Menu**
   - Prompt: "Select category"
   - Menu Items: Food, Transport, Bills, Shopping, Health, Zakat/Charity, Entertainment, Other
   - Variable Name: `Category`

   **Action 4: Open URL**
   - URL: `https://yoursite.com/quick-add.html?amount=[Amount]&note=[Note]&category=[Category]`
   - Replace `yoursite.com` with your actual domain
   - Use the magic variables from previous steps

4. Name your shortcut "Add Expense"
5. Add to Siri for voice activation: "Hey Siri, add expense"

### Example Quick-Add URLs

```
# Basic expense
quick-add.html?amount=15.50&category=Food

# With note
quick-add.html?amount=25.00&note=Lunch%20at%20cafe&category=Food

# Different category
quick-add.html?amount=8.50&category=Transport
```

## File Structure

```
expense-tracker/
├── index.html          # Main dashboard
├── add.html           # Manual add form
├── quick-add.html     # Quick add from URLs/shortcuts
├── styles.css         # CSS with theme support
├── storage.js         # IndexedDB management
├── charts.js          # Chart.js visualization
├── service-worker.js  # PWA offline support
├── manifest.json      # PWA configuration
└── icons/
    ├── icon-192.png   # App icon (192x192)
    └── icon-512.png   # App icon (512x512)
```

## Usage

### Dashboard Views

- **Day**: Shows today's expenses as a list with total
- **Week**: Bar chart showing daily spending for current week
- **Month**: Pie chart by category + line chart showing daily trend

### Adding Expenses

**Manual Add:**
1. Tap the "+" button (FAB) on dashboard
2. Enter amount, note (optional), and select category
3. Add custom categories as needed
4. Tap "Save Expense"

**Quick Add (from iOS Shortcuts):**
1. Use your iOS Shortcut or visit the quick-add URL with parameters
2. The expense saves automatically and shows confirmation
3. Redirects back to dashboard

### Data Management

- **Export**: Tap the export button (📤) to download CSV or JSON
- **Delete**: Tap the × button next to any expense in daily view
- **Theme**: Toggle between light/dark theme using the theme button

## Technical Details

- **Storage**: IndexedDB (client-side, no server needed)
- **Charts**: Chart.js for data visualization  
- **Offline**: Service Worker caches all resources
- **Mobile**: Responsive design optimized for iPhone
- **PWA**: Installable with app-like experience

## Categories

**Default categories:**
- Food
- Transport  
- Bills
- Shopping
- Health
- Zakat/Charity
- Entertainment
- Other

You can add custom categories through the manual add form.

## Browser Compatibility

- ✅ iOS Safari (recommended for iPhone installation)
- ✅ Chrome (Android & Desktop)
- ✅ Firefox  
- ✅ Edge
- ⚠️ IE 11+ (limited PWA support)

## Customization

The app uses CSS custom properties (variables) for easy theming. Edit `styles.css` to customize colors, fonts, and layout.

Key variables in `:root` and `body.light`:
- `--bg`: Background color
- `--fg`: Text color
- `--primary-color`: Accent color
- `--card-bg`: Card background
- `--border-color`: Border color

## Security & Privacy

- 🔒 **No backend**: All data stays on your device
- 📱 **Local storage**: Uses IndexedDB - data never leaves your phone
- 🚫 **No tracking**: No analytics or third-party scripts
- 🔄 **Offline-first**: Works without internet connection

---

Made with ❤️ for fast, private expense tracking. Perfect for daily use with iOS Shortcuts integration.
