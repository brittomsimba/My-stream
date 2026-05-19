// My-Stream Configuration
const CONFIG = {
  BACKEND_URL: 'https://naijared.com',
  APP_NAME: 'My-Stream',
  VERSION: '1.0.0',
  CACHE_EXPIRY: 3600000, // 1 hour in milliseconds
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

// Initialize App
window.addEventListener('DOMContentLoaded', () => {
  initializeApp();
});

async function initializeApp() {
  try {
    console.log('Initializing My-Stream...');
    const statusText = document.getElementById('status-text');
    
    // Test connection to backend
    statusText.textContent = 'Connecting to naijared.com...';
    
    const connected = await testConnection();
    
    if (connected) {
      statusText.textContent = 'Loading videos...';
      await loadVideos();
      showApp();
    } else {
      statusText.textContent = 'Failed to connect to server. Check your connection and try again.';
      document.getElementById('retry-btn').classList.remove('hidden');
    }
  } catch (error) {
    console.error('Initialization error:', error);
    document.getElementById('status-text').textContent = 'Error: ' + error.message;
    document.getElementById('retry-btn').classList.remove('hidden');
  }
}

async function testConnection() {
  try {
    const response = await fetch(CONFIG.BACKEND_URL, {
      method: 'HEAD',
      mode: 'no-cors',
      timeout: 5000,
    });
    return true;
  } catch (error) {
    console.warn('Connection test failed:', error);
    return false;
  }
}

async function loadVideos() {
  try {
    const loader = document.getElementById('loader');
    const emptyState = document.getElementById('empty-state');
    const videoGrid = document.getElementById('video-grid');
    
    loader.classList.remove('hidden');
    emptyState.classList.add('hidden');
    videoGrid.innerHTML = '';
    
    // Attempt to fetch from backend
    let videos = [];
    try {
      const response = await fetch(`${CONFIG.BACKEND_URL}/api/videos`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (response.ok) {
        const data = await response.json();
        videos = data.videos || [];
      }
    } catch (error) {
      console.warn('Backend fetch failed, using demo videos:', error);
      videos = getDemoVideos();
    }
    
    videosCache = videos;
    
    if (videos.length === 0) {
      emptyState.classList.remove('hidden');
    } else {
      renderVideos(videos);
    }
    
    loader.classList.add('hidden');
  } catch (error) {
    console.error('Error loading videos:', error);
    document.getElementById('empty-state').classList.remove('hidden');
  }
}

function getDemoVideos() {
  // Demo videos for testing - replace with real data from backend
  return [
    {
      id: '1',
      title: 'Welcome to My-Stream',
      uploader: 'My-Stream Team',
      thumbnail: 'https://images.unsplash.com/photo-1505228395891-9a51e7e86e81?w=300&h=170&fit=crop',
      url: 'https://commondatastorage.googleapis.com/gtv-videos-library/sample/BigBuckBunny.mp4',
      views: '1.2M',
      duration: '9:56',
      description: 'Welcome to My-Stream! This is a sample video. Connect naijared.com as your backend to load real videos.',
    },
    {
      id: '2',
      title: 'Sample Video 2',
      uploader: 'Demo Channel',
      thumbnail: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=300&h=170&fit=crop',
      url: 'https://commondatastorage.googleapis.com/gtv-videos-library/sample/ElephantsDream.mp4',
      views: '856K',
      duration: '2:47',
      description: 'This is a demo video. Replace with real content from your backend.',
    },
    {
      id: '3',
      title: 'Sample Video 3',
      uploader: 'Content Creator',
      thumbnail: 'https://images.unsplash.com/photo-1498038432885-ccd8e8c352e5?w=300&h=170&fit=crop',
      url: 'https://commondatastorage.googleapis.com/gtv-videos-library/sample/ForBiggerBlazes.mp4',
      views: '2.1M',
      duration: '3:34',
      description: 'Demo content for testing. Configure naijared.com API for production videos.',
    },
  ];
}

function renderVideos(videos) {
  const videoGrid = document.getElementById('video-grid');
  videoGrid.innerHTML = '';
  
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
  
  vidPlayer.src = video.url;
  playerOverlay.style.display = 'flex';
  
  // Add to history
  addToHistory(video);
}

function closePlayer() {
  document.getElementById('player-overlay').style.display = 'none';
  document.getElementById('mini-player').style.display = 'none';
  document.getElementById('vid-player').pause();
}

function minimizePlayer() {
  document.getElementById('player-overlay').style.display = 'none';
  const miniPlayer = document.getElementById('mini-player');
  const vidPlayer = document.getElementById('vid-player');
  const miniVidPlayer = document.getElementById('mini-vid-player');
  
  miniPlayer.style.display = 'block';
  miniVidPlayer.src = vidPlayer.src;
  miniVidPlayer.currentTime = vidPlayer.currentTime;
  miniVidPlayer.play();
}

function expandPlayer() {
  document.getElementById('player-overlay').style.display = 'flex';
  document.getElementById('mini-player').style.display = 'none';
  const vidPlayer = document.getElementById('vid-player');
  const miniVidPlayer = document.getElementById('mini-vid-player');
  vidPlayer.currentTime = miniVidPlayer.currentTime;
  vidPlayer.play();
}

function toggleMiniPlay() {
  const miniVidPlayer = document.getElementById('mini-vid-player');
  const miniPlayIcon = document.getElementById('mini-play-icon');
  
  if (miniVidPlayer.paused) {
    miniVidPlayer.play();
    miniPlayIcon.className = 'fas fa-pause text-sm';
  } else {
    miniVidPlayer.pause();
    miniPlayIcon.className = 'fas fa-play text-sm';
  }
}

function runSearch() {
  const query = document.getElementById('q-input').value.toLowerCase();
  
  if (!query) {
    renderVideos(videosCache);
    return;
  }
  
  const filtered = videosCache.filter((video) =>
    video.title.toLowerCase().includes(query) ||
    video.uploader.toLowerCase().includes(query) ||
    video.description?.toLowerCase().includes(query)
  );
  
  renderVideos(filtered);
}

function goHome() {
  document.getElementById('q-input').value = '';
  loadVideos();
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
  alert(`${CONFIG.APP_NAME} v${CONFIG.VERSION}\n\nA modern video streaming platform.\n\nBackend: ${CONFIG.BACKEND_URL}`);
}

function openDlPopup() {
  document.getElementById('dl-popup').style.display = 'flex';
}

function closeDlPopup() {
  document.getElementById('dl-popup').style.display = 'none';
}

function startDownload() {
  showToast('Download preparation started');
  document.getElementById('dl-start-btn').classList.add('hidden');
  document.getElementById('dl-progress').classList.remove('hidden');
  document.getElementById('dl-save-btn').classList.remove('hidden');
  document.getElementById('dl-audio-btn').classList.remove('hidden');
}

function saveFile() {
  if (!currentVideo) return;
  const fileName = document.getElementById('dl-name').value || currentVideo.title;
  const link = document.createElement('a');
  link.href = currentVideo.url;
  link.download = `${fileName}.mp4`;
  link.click();
  showToast('Download started');
  closeDlPopup();
}

function extractAudio() {
  showToast('Audio extraction not available in demo mode');
}

function saveAudioFile() {
  showToast('Audio save not available in demo mode');
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
  document.getElementById('share-audio-btn').classList.remove('hidden');
}

function shareFile() {
  if (!currentVideo) return;
  if (navigator.share) {
    navigator.share({
      title: currentVideo.title,
      text: `Check out: ${currentVideo.title}`,
      url: window.location.href,
    });
  } else {
    copyLink();
  }
}

function extractAudioShare() {
  showToast('Audio extraction not available in demo mode');
}

function copyLink() {
  const url = `${window.location.href}?video=${currentVideo?.id || ''}`;
  navigator.clipboard.writeText(url);
  showToast('Link copied to clipboard');
}

function shareToTwitter() {
  if (!currentVideo) return;
  const text = `Check out: ${currentVideo.title} on My-Stream`;
  const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
  window.open(url, '_blank');
}

function shareToWhatsApp() {
  if (!currentVideo) return;
  const text = `Check out: ${currentVideo.title} on My-Stream`;
  const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
  window.open(url, '_blank');
}

function shareNative() {
  if (navigator.share) {
    navigator.share({
      title: currentVideo?.title || 'My-Stream',
      text: 'Check this out on My-Stream',
      url: window.location.href,
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
