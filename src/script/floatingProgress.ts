// Content script to show a floating progress bar and success animation in the right corner

let progressBar: HTMLDivElement | null = null;
let successDiv: HTMLDivElement | null = null;

function createProgressBar() {
  if (progressBar) return;
  progressBar = document.createElement('div');
  progressBar.id = 'bookmark-buddy-progress-bar';
  progressBar.style.position = 'fixed';
  progressBar.style.top = '24px';
  progressBar.style.right = '24px';
  progressBar.style.width = '240px';
  progressBar.style.height = '18px';
  progressBar.style.background = 'rgba(0,0,0,0.15)';
  progressBar.style.borderRadius = '9px';
  progressBar.style.zIndex = '2147483647';
  progressBar.style.overflow = 'hidden';
  progressBar.innerHTML = `
    <div id="bookmark-buddy-progress-inner" style="height:100%;width:0%;background:#4f46e5;transition:width 0.4s cubic-bezier(.4,0,.2,1);"></div>
  `;
  document.body.appendChild(progressBar);
}

function updateProgressBar(percent: number) {
  createProgressBar();
  const inner = document.getElementById('bookmark-buddy-progress-inner');
  if (inner) {
    inner.style.width = `${percent}%`;
  }
}

function removeProgressBar() {
  if (progressBar) {
    progressBar.remove();
    progressBar = null;
  }
}

function showSuccessAnimation() {
  if (successDiv) return;
  successDiv = document.createElement('div');
  successDiv.id = 'bookmark-buddy-success';
  successDiv.style.position = 'fixed';
  successDiv.style.top = '24px';
  successDiv.style.right = '24px';
  successDiv.style.zIndex = '2147483647';
  successDiv.style.background = 'rgba(76, 175, 80, 0.95)';
  successDiv.style.color = '#fff';
  successDiv.style.fontSize = '16px';
  successDiv.style.padding = '12px 28px';
  successDiv.style.borderRadius = '20px';
  successDiv.style.boxShadow = '0 4px 16px rgba(0,0,0,0.12)';
  successDiv.style.display = 'flex';
  successDiv.style.alignItems = 'center';
  successDiv.style.gap = '10px';
  successDiv.innerHTML = `
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
    <span>Bookmark Saved!</span>
  `;
  document.body.appendChild(successDiv);
  setTimeout(() => {
    if (successDiv) {
      successDiv.style.transition = 'opacity 0.7s';
      successDiv.style.opacity = '0';
      setTimeout(() => {
        if (successDiv) {
          successDiv.remove();
          successDiv = null;
        }
      }, 700);
    }
  }, 1700);
}

// Listen for messages from background or popup
window.addEventListener('message', (event) => {
  if (!event.data || typeof event.data !== 'object' || !event.data.__bookmarkBuddy) return;
  const { type, progress } = event.data;
  if (type === 'progress') {
    updateProgressBar(progress ?? 0);
  } else if (type === 'done') {
    removeProgressBar();
    showSuccessAnimation();
  } else if (type === 'hide') {
    removeProgressBar();
  }
});

// For debugging: expose manual triggers
(window as any).BookmarkBuddyProgress = {
  show: updateProgressBar,
  hide: removeProgressBar,
  success: showSuccessAnimation,
};
