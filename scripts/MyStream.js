// My-Stream Configuration with YouTube API
const CONFIG = {
  YOUTUBE_API_KEY: 'AIzaSyC2M4wChKNkxsxXj9w0eibUgN65JVXw4dk',
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
let currentSearchQuery = '';

// Initialize App
window.addEventListener('DOMContentLoaded', () => {
  initializeApp();
});

async function initializeApp() {
  try {
    console.log('Initializing My-Stream with YouTube API...');
    const statusText = document.getElementById('status-text');
    
    statusText.textContent = 'Loading videos from YouTube...';
    
    const connected = await testYouTubeConnection();
    
    if (connected) {
      await searchYouTube(CONFIG.DEFAULT_SEARCH);
      showApp();
    } else {
      statusText.textContent = 'Failed to connect to YouTube API. Check your connection and try again.';
      document.getElementById('retry-btn').classList.remove('hidden');
    }
  } catch (error) {
    console.error('Initialization error:', error);
    document.getElementById('status-text').textContent = 'Error: ' + error.message;
    document.getElementById('retry-btn').classList.remove('hidden');
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
      currentSearchQuery = query;
      nextPageToken = '';
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
      renderVideos(videos, false);
    } else {
      videosCache = videos;
      renderVideos(videos, true);
    }
    
    if (videosCache.length === 0 && !pageToken) {
      emptyState.classList.remove('hidden');
    }
    
    loader.classList.add('hidden');
  } catch (error) {
    console.error('Error searching YouTube:', error);
    document.getElementById('empty-state').classList.remove('hidden');
    document.getElementById('loader').classList.add('hidden');
    showToast('Error loading videos: ' + error.message);
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
        <span class="video-duration">${video.duration || 'LIVE'}</span>
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
  const embedUrl = `https://www.youtube.com/embed/${video.id}?autoplay=1&controls=1`;
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
  // YouTube embed auto-plays
  showToast('Playing in mini player');
}

function runSearch() {
  const query = document.getElementById('q-input').value.trim();
  
  if (!query) {
    searchYouTube(CONFIG.DEFAULT_SEARCH);
    return;
  }
  
  searchYouTube(query);
}

function goHome() {
  document.getElementById('q-input').value = '';
  searchYouTube(CONFIG.DEFAULT_SEARCH);
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
  alert(`${CONFIG.APP_NAME} v${CONFIG.VERSION}\n\nA modern video streaming platform powered by YouTube.\n\nSearch YouTube, save your favorites, and manage your subscriptions - all in one place.`);
}

function openDlPopup() {
  showToast('Download not available for YouTube videos');
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
      text: `Check out: ${currentVideo.title}`,
      url: currentVideo.url,
    });
  } else {
    copyLink();
  }
}

function extractAudioShare() {
  showToast('Use YouTube\'s official download feature for audio');
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
    nextPageToken
  ) {
    searchYouTube(currentSearchQuery, nextPageToken);
  }
});
