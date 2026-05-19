# My-Stream - YouTube Video Platform

A modern video streaming platform powered by YouTube API.

## 🎬 Features

- 🔍 **Search YouTube**: Search any video from YouTube
- 📺 **Stream Videos**: Watch YouTube videos embedded directly
- ❤️ **Save Videos**: Save your favorite videos locally
- 📜 **Watch History**: Automatic watch history tracking
- 🔔 **Subscriptions**: Subscribe to favorite channels
- 📱 **Responsive Design**: Works on desktop, tablet, and mobile
- 🌙 **Dark Theme**: Modern dark interface
- ♾️ **Infinite Scroll**: Automatically load more videos
- 📤 **Share**: Share videos on Twitter, WhatsApp, or copy link
- ⚡ **Fast**: Lightweight and optimized

## 🚀 Quick Start

### Option 1: GitHub Pages (Recommended)

1. Go to: https://github.com/brittomsimba/My-stream
2. Go to **Settings** → **Pages**
3. Select `main` branch as source
4. Your site will be live at: `https://brittomsimba.github.io/My-stream`

### Option 2: Local Development

```bash
# Clone the repository
git clone https://github.com/brittomsimba/My-stream.git
cd My-stream

# Serve with Python
python -m http.server 8000

# Or with Node.js
npx http-server
```

Then open: `http://localhost:8000`

## ⚙️ Configuration

The app uses **YouTube API v3** for all video content.

### API Key Status
- ✅ **Active API Key**: `AIzaSyC2M4wChKNkxsxXj9w0eibUgN65JVXw4dk`
- ✅ **Daily Quota**: 10,000 units
- ✅ **Ready to Use**: No additional setup needed

### Customization

Edit `scripts/MyStream.js` to customize:

```javascript
const CONFIG = {
  YOUTUBE_API_KEY: 'AIzaSyC2M4wChKNkxsxXj9w0eibUgN65JVXw4dk',
  APP_NAME: 'My-Stream',
  VERSION: '1.0.0',
  DEFAULT_SEARCH: 'popular videos',
};
```

### Colors

Edit `styles/MyStream.css` to change theme:

```css
:root {
  --primary-color: #ff0000;      /* Red accent */
  --secondary-color: #3ea6ff;    /* Blue accent */
  --bg-dark: #0f0f0f;            /* Dark background */
}
```

## 📁 File Structure

```
My-stream/
├── index.html              # Main HTML file
├── styles/
│   └── MyStream.css        # Stylesheet
├── scripts/
│   └── MyStream.js         # Application logic
├── README.md               # Documentation
└── .gitignore             # Git ignore
```

## 🎯 How to Use

### Search Videos
1. Use the search bar at the top
2. Type any video title, artist, or topic
3. Results load automatically

### Watch Videos
1. Click on any video thumbnail
2. Video plays in full-screen player
3. Use YouTube's native controls

### Save Videos
1. While watching, click "Save" button
2. Video is saved to your library
3. Access from "Library" → "Saved Videos"

### Track History
- All watched videos are automatically saved
- Access from "Library" → "Watch History"
- Shows last 50 videos watched

### Subscribe to Channels
1. While watching a video, click "Subscribe"
2. Subscribe to that channel
3. Access subscriptions from "Library"

### Share Videos
1. Click "Share" while watching
2. Choose sharing method:
   - Twitter
   - WhatsApp
   - Copy Link
   - Native Share (mobile)

## 📱 Features Explained

### Infinite Scroll
- Scroll down to automatically load more videos
- Seamless browsing experience
- Loads 20 videos at a time

### Mini Player
- Minimize to picture-in-picture mode
- Continue browsing while watching
- Expand to full screen anytime

### Watch History
- Stores last 50 videos watched
- Automatic timestamping
- Never lose your place

### Local Storage
- All data saved locally in your browser
- No account needed
- Data persists across sessions

## 🔧 Troubleshooting

### Videos not loading?
1. Check internet connection
2. Open browser console (F12) for errors
3. Refresh the page

### Search not working?
1. Make sure you have internet connection
2. YouTube API key might have quota exceeded
3. Try again later

### Videos not playing?
1. Ensure JavaScript is enabled
2. Try a different browser
3. Clear browser cache and reload

## 📊 YouTube API Information

- **API Used**: YouTube Data API v3
- **Rate Limit**: 10,000 units per day
- **Cost per Search**: ~100 units
- **Capacity**: ~100 searches per day

## 📄 License

MIT License - Feel free to use and modify

## 🙋 Support

- Report issues on GitHub
- Check browser console for errors
- Ensure YouTube API key is active

---

**Made with ❤️ by brittomsimba**

Live Demo: https://brittomsimba.github.io/My-stream
