/**
 * Favorite Notification Handler
 * Handles real-time updates for favorite status changes
 */

document.addEventListener('DOMContentLoaded', function() {
  console.log('Initializing favorite notification handler...');
  
  // Setup event listeners for notifications related to favorites
  setupFavoriteNotificationListeners();
  
  // Periodically check for rented assets in favorites
  checkRentedAssets();
});

// Setup event listeners for notifications
function setupFavoriteNotificationListeners() {
  // Check for favorite-related notifications when notifications are loaded
  document.addEventListener('notificationsLoaded', handleFavoriteNotifications);
  
  // When a notification is clicked, check if it's about a favorite
  document.addEventListener('notificationClicked', handleFavoriteNotificationClick);
}

// Handle favorite notifications
function handleFavoriteNotifications(event) {
  const notifications = event.detail?.notifications || [];
  
  // Check for favorite-related notifications
  const favoriteNotifications = notifications.filter(notif => 
    notif.title.includes('Favorit') || 
    notif.message.includes('favorit') ||
    notif.message.includes('Favorit')
  );
  
  if (favoriteNotifications.length > 0) {
    console.log(`Found ${favoriteNotifications.length} favorite-related notifications`);
    
    // Reload favorites to ensure UI is up-to-date
    if (typeof loadFavorites === 'function') {
      loadFavorites();
    } else if (typeof loadUserFavorites === 'function') {
      loadUserFavorites();
    }
    
    // Update favorite count
    if (typeof updateFavoriteCounter === 'function') {
      updateFavoriteCounter();
    }
  }
}

// Handle a notification click
function handleFavoriteNotificationClick(event) {
  const notification = event.detail?.notification;
  
  if (!notification) return;
  
  // Check if it's a favorite-related notification
  if (notification.title.includes('Favorit') || 
      notification.message.includes('favorit') ||
      notification.message.includes('Favorit')) {
    
    console.log('Favorite-related notification clicked');
    
    // Reload favorites to ensure UI is up-to-date
    if (typeof loadFavorites === 'function') {
      loadFavorites();
    } else if (typeof loadUserFavorites === 'function') {
      loadUserFavorites();
    }
    
    // Update favorite count
    if (typeof updateFavoriteCounter === 'function') {
      updateFavoriteCounter();
    }
    
    // Navigate to favorites tab if possible
    const favoriteTab = document.querySelector('.menu-link[data-target="favorit-aset"]');
    if (favoriteTab) {
      favoriteTab.click();
    }
  }
}

// Periodically check for rented assets in favorites
function checkRentedAssets() {
  // Run every minute
  setInterval(async function() {
    try {
      // If we're on the favorites tab, reload favorites
      const activeFavoritTab = document.querySelector('.content-section.active#favorit-aset');
      if (activeFavoritTab) {
        console.log('Checking for updates to favorite assets...');
        
        if (typeof loadFavorites === 'function') {
          await loadFavorites();
        } else if (typeof loadUserFavorites === 'function') {
          await loadUserFavorites();
        }
      }
      
      // Always update the counter
      if (typeof updateFavoriteCounter === 'function') {
        updateFavoriteCounter();
      }
    } catch (error) {
      console.error('Error checking rented assets:', error);
    }
  }, 60000); // Check every 60 seconds
}
