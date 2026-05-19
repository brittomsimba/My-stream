# My-Stream

A modern video streaming platform built with HTML, CSS, and JavaScript.

## Features

- 🎬 Video streaming and playback
- 🔍 Search functionality
- 📚 Watch history and saved videos
- 🔔 Subscriptions
- 📥 Video download (demo mode)
- 📤 Share videos
- 🎨 Modern dark theme UI
- 📱 Fully responsive design
- ⚡ Fast and lightweight

## Backend Integration

This project is configured to use **naijared.com** as the backend server for videos.

### Backend API Requirements

To integrate a custom backend, it should provide:

```
GET /api/videos

Response format:
{
  "videos": [
    {
      "id": "1",
      "title": "Video Title",
      "uploader": "Channel Name",
      "thumbnail": "https://...",
      "url": "https://...",
      "views": "1.2M",
      "duration": "9:56",
      "description": "Video description"
    }
  ]
}
```

## Quick Start

### Local Development

1. Clone the repository:
   ```bash
   git clone https://github.com/brittomsimba/My-stream.git
   cd My-stream
   ```

2. Serve the files locally:
   ```bash
   # Using Python 3
   python -m http.server 8000
   
   # Or using Node.js (with http-server)
   npx http-server
   ```

3. Open in browser:
   ```
   http://localhost:8000
   ```

### Configuration

Edit `scripts/MyStream.js` to configure:

```javascript
const CONFIG = {
  BACKEND_URL: 'https://naijared.com',  // Change backend URL
  APP_NAME: 'My-Stream',                 // Change app name
  VERSION: '1.0.0',
  CACHE_EXPIRY: 3600000,                 // Cache expiry in ms
};
```

## Customization

### Colors

Edit `styles/MyStream.css` to change colors:

```css
:root {
  --primary-color: #ff0000;      /* Red accent */
  --secondary-color: #3ea6ff;    /* Blue accent */
  --bg-dark: #0f0f0f;            /* Dark background */
}
```

### App Name

Change in `index.html` and `scripts/MyStream.js`

## File Structure

```
My-stream/
├── index.html           # Main HTML file
├── styles/
│   └── MyStream.css     # Stylesheet
├── scripts/
│   └── MyStream.js      # Application logic
├── README.md            # This file
└── .gitignore          # Git ignore file
```

## Features Explained

### Video Playing
- Click any video to play it in full screen
- Use native HTML5 video controls
- Minimize to picture-in-picture mode

### Search
- Search across video titles, uploaders, and descriptions
- Real-time filtering

### Library
- **Watch History**: Automatically tracks watched videos
- **Saved Videos**: Manually save videos for later
- **Subscriptions**: Subscribe to channels

### Storage
- All data stored locally in browser (localStorage)
- No server-side account needed
- Data persists across sessions

## Deployment

### GitHub Pages

1. Push to GitHub (already done)
2. Go to repository Settings → Pages
3. Select `main` branch as source
4. Your site will be available at: `https://brittomsimba.github.io/My-stream`

### Other Platforms

- **Vercel**: Connect GitHub repo directly
- **Netlify**: Drag and drop or connect GitHub
- **Any static hosting**: Just upload the files

## Troubleshooting

### Videos not loading
1. Check if naijared.com is accessible
2. Open browser console (F12) for error messages
3. Try demo videos by checking the fallback in console

### Backend connection failed
- Check your internet connection
- Verify naijared.com URL in CONFIG
- Check browser console for CORS errors

## License

MIT License - Feel free to use and modify

## Support

For issues and questions, please create an issue on GitHub.

---

**Made with ❤️ by brittomsimba**
