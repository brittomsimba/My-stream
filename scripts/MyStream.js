// My-Stream Configuration with YouTube API
const CONFIG = {
  YOUTUBE_API_KEY: 'YOUR_YOUTUBE_API_KEY_HERE', // Get from: https://console.cloud.google.com/
  APP_NAME: 'My-Stream',
  VERSION: '1.0.0',
  CACHE_EXPIRY: 3600000, // 1 hour in milliseconds
  DEFAULT_SEARCH: 'popular videos', // Default search term on load
};

// Local Storage Keys
const STORAGE_KEYS = {
  HISTORY: 'mystream_history',
  SAVED: 'mystream_saved',
  SUBS: 'mystream_subs',
  THEME: 'mystream_theme',
};

let currentPlayer = null;
let currentVideo = null;
let videosCache = [];
let nextPageToken = '';

// Initialize App
window.addEventListener('DOMContentLoaded', () => {
  initializeApp();
});

async function initializeApp() {
  try {
    console.log('Initializing My-Stream...');
    const statusText = document.getElementById('status-text');
    
    // Check if API key is set
    if (CONFIG.YOUTUBE_API_KEY === 'YOUR_YOUTUBE_API_KEY_HERE') {
      statusText.textContent = 'YouTube API key not configured. Using demo videos. See README for setup.';
      await loadDemoVideos();
      showApp();
      return;
    }
    
    // Test YouTube API connection
    statusText.textContent = 'Connecting to YouTube API...';
    
    const connected = await testYouTubeConnection();
    
    if (connected) {
      statusText.textContent = 'Loading videos from YouTube...';
      await searchYouTube(CONFIG.DEFAULT_SEARCH);
      showApp();
    } else {
      statusText.textContent = 'Failed to connect to YouTube API. Using demo videos.';
      await loadDemoVideos();
      showApp();
    }
  } catch (error) {
    console.error('Initialization error:', error);
    document.getElementById('status-text').textContent = 'Error: ' + error.message;
    await loadDemoVideos();
    showApp();
  }
}

async function testYouTubeConnection() {
  try {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&q=test&maxResults=1&type=video&key=${CONFIG.YOUTUBE_API_KEY}`,
      { method: 'GET' }
    );
    return response.ok;
  } catch (error) {
    console.warn('YouTube API connection test failed:', error);
    return false;
  }
}

async function searchYouTube(query, pageToken = '') {
  try {
    const loader = document.getElementById('loader');
    const emptyState = document.getElementById('empty-state');
    const videoGrid = document.getElementById('video-grid');
    
    if (!pageToken) {
      loader.classList.remove('hidden');
      emptyState.classList.add('hidden');
      videoGrid.innerHTML = '';
    }
    
    const url = new URL('https://www.googleapis.com/youtube/v3/search');
    url.searchParams.append('part', 'snippet');
    url.searchParams.append('q', query);
    url.searchParams.append('maxResults', '20');
    url.searchParams.append('type', 'video');
    url.searchParams.append('key', CONFIG.YOUTUBE_API_KEY);
    
    if (pageToken) {
      url.searchParams.append('pageToken', pageToken);
    }
    
    console.log('Searching YouTube for:', query);
    const response = await fetch(url.toString());
    
    if (!response.ok) {
      throw new Error(`YouTube API error: ${response.status}`);
    }
    
    const data = await response.json();
    const videos = formatYouTubeVideos(data.items || []);
    
    nextPageToken = data.nextPageToken || '';
    
    if (pageToken) {
      videosCache = [...videosCache, ...videos];
    } else {
      videosCache = videos;
    }
    
    if (videosCache.length === 0) {
      emptyState.classList.remove('hidden');
    } else {
      renderVideos(videos, !pageToken);
    }
    
    loader.classList.add('hidden');
  } catch (error) {
    console.error('Error searching YouTube:', error);
    document.getElementById('empty-state').classList.remove('hidden');
    document.getElementById('loader').classList.add('hidden');
  }
}

function formatYouTubeVideos(items) {
  return items.map((item) => ({
    id: item.id.videoId,
    title: item.snippet.title,
    uploader: item.snippet.channelTitle,
    thumbnail: item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default?.url,
    url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
    views: 'N/A',
    duration: 'N/A',
    description: item.snippet.description,
    channelId: item.snippet.channelId,
  }));
}

async function loadDemoVideos() {
  try {
    const loader = document.getElementById('loader');
    const emptyState = document.getElementById('empty-state');
    const videoGrid = document.getElementById('video-grid');
    
    loader.classList.remove('hidden');
    emptyState.classList.add('hidden');
    videoGrid.innerHTML = '';
    
    const videos = getDemoVideos();
    videosCache = videos;
    
    if (videos.length === 0) {
      emptyState.classList.remove('hidden');
    } else {
      renderVideos(videos);
    }
    
    loader.classList.add('hidden');
  } catch (error) {
    console.error('Error loading demo videos:', error);
    document.getElementById('empty-state').classList.remove('hidden');
  }
}

function getDemoVideos() {
  // Demo videos for testing
  return [
    {
      id: 'dQw4w9WgXcQ',
      title: 'Welcome to My-Stream - YouTube Integration',
      uploader: 'My-Stream Team',
      thumbnail: 'https://images.unsplash.com/photo-1505228395891-9a51e7e86e81?w=300&h=170&fit=crop',
      url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      views: '1.2M',
      duration: '3:33',
      description: 'Welcome to My-Stream with YouTube API integration! Connect a real YouTube API key to load live videos.',
    },
    {
      id: 'jNQXAC9IVRw',
      title: 'Sample Video 2 - Demo Mode',
      uploader: 'Demo Channel',
      thumbnail: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=300&h=170&fit=crop',
      url: 'https://www.youtube.com/watch?v=jNQXAC9IVRw',
      views: '856K',
      duration: '2:47',
      description: 'This is a demo video. Get a YouTube API key to load real videos.',
    },
    {
      id: '9bZkp7q19f0',
      title: 'Sample Video 3 - YouTube API Demo',
      uploader: 'Content Creator',
      thumbnail: 'https://images.unsplash.com/photo-1498038432885-ccd8e8c352e5?w=300&h=170&fit=crop',
      url: 'https://www.youtube.com/watch?v=9bZkp7q19f0',
      views: '2.1M',
      duration: '3:34',
      description: 'Demo content for testing. Set up YouTube API in config for production.',
    },
  ];
}

function renderVideos(videos, clear = true) {
  const videoGrid = document.getElementById('video-grid');
  
  if (clear) {
    videoGrid.innerHTML = '';
  }
  
  videos.forEach((video) => {
    const videoItem = document.createElement('div');
    videoItem.className = 'video-item';
    videoItem.innerHTML = `
      <div class="video-thumbnail">
        <img src="${video.thumbnail}" alt="${video.title}" onerror="this.src='https://via.placeholder.com/300x170?text=Video'">
        <span class="video-duration">${video.duration || 'N/A'}</span>
      </div>
      <div class="mt-2">
        <h3 class="text-sm font-medium truncate">${video.title}</h3>
        <p class="text-xs text-gray-400">${video.uploader}</p>
        <p class="text-xs text-gray-500">${video.views} views</p>
      </div>
    `;
    
    videoItem.addEventListener('click', () => playVideo(video));
    videoGrid.appendChild(videoItem);
  });
}

function playVideo(video) {
  currentVideo = video;
  const playerOverlay = document.getElementById('player-overlay');
  const vidPlayer = document.getElementById('vid-player');
  
  document.getElementById('p-title').textContent = video.title;
  document.getElementById('p-uploader').textContent = video.uploader;
  document.getElementById('p-views').textContent = `${video.views} views`;
  document.getElementById('p-description').innerHTML = `<p class="text-sm text-gray-300">${video.description || 'No description available.'}</p>`;
  
  // Embed YouTube video
  const embedUrl = `https://www.youtube.com/embed/${video.id}?autoplay=1`;
  vidPlayer.innerHTML = `<iframe width="100%" height="100%" src="${embedUrl}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
  
  playerOverlay.style.display = 'flex';
  
  // Add to history
  addToHistory(video);
}

function closePlayer() {
  document.getElementById('player-overlay').style.display = 'none';
  document.getElementById('mini-player').style.display = 'none';
  document.getElementById('vid-player').innerHTML = '';
}

function minimizePlayer() {
  document.getElementById('player-overlay').style.display = 'none';
  const miniPlayer = document.getElementById('mini-player');
  const miniTitle = document.getElementById('mini-title');
  const miniUploader = document.getElementById('mini-uploader');
  
  if (currentVideo) {
    miniTitle.textContent = currentVideo.title;
    miniUploader.textContent = currentVideo.uploader;
  }
  
  miniPlayer.style.display = 'block';
}

function expandPlayer() {
  document.getElementById('player-overlay').style.display = 'flex';
  document.getElementById('mini-player').style.display = 'none';
}

function toggleMiniPlay() {
  // YouTube embed auto-plays, just toggle mini player visibility
  showToast('Playing in mini player');
}

function runSearch() {
  const query = document.getElementById('q-input').value.trim();
  
  if (!query) {
    loadDemoVideos();
    return;
  }
  
  // If YouTube API is configured, search YouTube
  if (CONFIG.YOUTUBE_API_KEY !== 'YOUR_YOUTUBE_API_KEY_HERE') {
    searchYouTube(query);
  } else {
    // Otherwise search in demo videos
    const filtered = videosCache.filter((video) =>
      video.title.toLowerCase().includes(query) ||
      video.uploader.toLowerCase().includes(query) ||
      video.description?.toLowerCase().includes(query)
    );
    renderVideos(filtered);
  }
}

function goHome() {
  document.getElementById('q-input').value = '';
  
  if (CONFIG.YOUTUBE_API_KEY !== 'YOUR_YOUTUBE_API_KEY_HERE') {
    searchYouTube(CONFIG.DEFAULT_SEARCH);
  } else {
    loadDemoVideos();
  }
}

function loadSubs() {
  const subs = JSON.parse(localStorage.getItem(STORAGE_KEYS.SUBS) || '[]');
  const filtered = videosCache.filter((v) => subs.includes(v.uploader));
  renderVideos(filtered);
}

function addToHistory(video) {
  const history = JSON.parse(localStorage.getItem(STORAGE_KEYS.HISTORY) || '[]');
  history.unshift({ ...video, watchedAt: new Date().toISOString() });
  localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history.slice(0, 50)));
}

function loadHistory() {
  const history = JSON.parse(localStorage.getItem(STORAGE_KEYS.HISTORY) || '[]');
  renderVideos(history);
  closeLibrary();
}

function loadSaved() {
  const saved = JSON.parse(localStorage.getItem(STORAGE_KEYS.SAVED) || '[]');
  renderVideos(saved);
  closeLibrary();
}

function addToPlaylist() {
  if (!currentVideo) return;
  
  const saved = JSON.parse(localStorage.getItem(STORAGE_KEYS.SAVED) || '[]');
  if (!saved.find((v) => v.id === currentVideo.id)) {
    saved.push(currentVideo);
    localStorage.setItem(STORAGE_KEYS.SAVED, JSON.stringify(saved));
    showToast('Added to saved videos');
  } else {
    showToast('Already in saved videos');
  }
}

function toggleSub() {
  if (!currentVideo) return;
  
  const subs = JSON.parse(localStorage.getItem(STORAGE_KEYS.SUBS) || '[]');
  const index = subs.indexOf(currentVideo.uploader);
  
  if (index > -1) {
    subs.splice(index, 1);
    showToast('Unsubscribed');
  } else {
    subs.push(currentVideo.uploader);
    showToast('Subscribed to ' + currentVideo.uploader);
  }
  
  localStorage.setItem(STORAGE_KEYS.SUBS, JSON.stringify(subs));
}

function showLibrary() {
  const history = JSON.parse(localStorage.getItem(STORAGE_KEYS.HISTORY) || '[]');
  const saved = JSON.parse(localStorage.getItem(STORAGE_KEYS.SAVED) || '[]');
  const subs = JSON.parse(localStorage.getItem(STORAGE_KEYS.SUBS) || '[]');
  
  document.getElementById('history-count').textContent = `${history.length} videos`;
  document.getElementById('saved-count').textContent = `${saved.length} videos`;
  document.getElementById('subs-count').textContent = `${subs.length} channels`;
  
  document.getElementById('library-popup').style.display = 'flex';
}

function closeLibrary() {
  document.getElementById('library-popup').style.display = 'none';
}

function loadSubsList() {
  const subs = JSON.parse(localStorage.getItem(STORAGE_KEYS.SUBS) || '[]');
  const filtered = videosCache.filter((v) => subs.includes(v.uploader));
  renderVideos(filtered);
  closeLibrary();
}

function showSettings() {
  document.getElementById('settings-popup').style.display = 'flex';
}

function closeSettings() {
  document.getElementById('settings-popup').style.display = 'none';
}

function clearHistory() {
  if (confirm('Clear all watch history?')) {
    localStorage.removeItem(STORAGE_KEYS.HISTORY);
    showToast('History cleared');
  }
}

function clearSaved() {
  if (confirm('Clear all saved videos?')) {
    localStorage.removeItem(STORAGE_KEYS.SAVED);
    showToast('Saved videos cleared');
  }
}

function clearSubs() {
  if (confirm('Clear all subscriptions?')) {
    localStorage.removeItem(STORAGE_KEYS.SUBS);
    showToast('Subscriptions cleared');
  }
}

function showAbout() {
  const apiStatus = CONFIG.YOUTUBE_API_KEY === 'YOUR_YOUTUBE_API_KEY_HERE' ? 'Not configured' : 'Configured';
  alert(`${CONFIG.APP_NAME} v${CONFIG.VERSION}\n\nA modern video streaming platform with YouTube integration.\n\nYouTube API: ${apiStatus}`);
}

function openDlPopup() {
  document.getElementById('dl-popup').style.display = 'flex';
}

function closeDlPopup() {
  document.getElementById('dl-popup').style.display = 'none';
}

function startDownload() {
  showToast('Download not available for YouTube videos');
  closeDlPopup();
}

function saveFile() {
  showToast('Download not available for YouTube videos');
}

function extractAudio() {
  showToast('Audio extraction not available for YouTube videos');
}

function saveAudioFile() {
  showToast('Audio save not available for YouTube videos');
}

function openSharePopup() {
  document.getElementById('share-popup').style.display = 'flex';
}

function closeSharePopup() {
  document.getElementById('share-popup').style.display = 'none';
}

function prepareShare() {
  document.getElementById('share-prepare-btn').classList.add('hidden');
  document.getElementById('share-progress').classList.remove('hidden');
  document.getElementById('share-file-btn').classList.remove('hidden');
}

function shareFile() {
  if (!currentVideo) return;
  if (navigator.share) {
    navigator.share({
      title: currentVideo.title,
      text: `Check out: ${currentVideo.title} on My-Stream`,
      url: currentVideo.url,
    });
  } else {
    copyLink();
  }
}

function extractAudioShare() {
  showToast('Audio extraction not available for YouTube videos');
}

function copyLink() {
  if (!currentVideo) return;
  navigator.clipboard.writeText(currentVideo.url);
  showToast('YouTube link copied to clipboard');
}

function shareToTwitter() {
  if (!currentVideo) return;
  const text = `Check out: ${currentVideo.title} on My-Stream`;
  const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(currentVideo.url)}`;
  window.open(url, '_blank');
}

function shareToWhatsApp() {
  if (!currentVideo) return;
  const text = `Check out: ${currentVideo.title} ${currentVideo.url}`;
  const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
  window.open(url, '_blank');
}

function shareNative() {
  if (navigator.share && currentVideo) {
    navigator.share({
      title: currentVideo.title,
      text: 'Check this out on My-Stream',
      url: currentVideo.url,
    });
  }
}

function showApp() {
  document.getElementById('connect-screen').style.display = 'none';
  document.getElementById('app').style.display = 'flex';
}

function showToast(message) {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = 'bg-[#ff0000] text-white px-4 py-3 rounded-lg text-sm font-medium animate-slide-up';
  toast.textContent = message;
  container.appendChild(toast);
  
  setTimeout(() => {
    toast.remove();
  }, 3000);
}

// Load more videos on scroll
window.addEventListener('scroll', () => {
  if (
    window.innerHeight + window.scrollY >= document.body.offsetHeight - 100 &&
    nextPageToken &&
    CONFIG.YOUTUBE_API_KEY !== 'YOUR_YOUTUBE_API_KEY_HERE'
  ) {
    const query = document.getElementById('q-input').value || CONFIG.DEFAULT_SEARCH;
    searchYouTube(query, nextPageToken);
  }
});
