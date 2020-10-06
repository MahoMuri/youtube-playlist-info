const { google } = require('googleapis');
const youtube = google.youtube('v3');
const fs = require('fs');

function playlistInfoRecursive(playlistId, callStackSize, pageToken, currentItems, customRequestAmount, callback) {
  youtube.playlistItems.list({
    part: 'snippet, contentDetails',
    pageToken: pageToken,
    maxResults: (customRequestAmount > 50 || !customRequestAmount ? 50 : customRequestAmount),
    playlistId: playlistId,
  }, function(err, res) {
    if (err) return callback(err);
    res.data.items.forEach(item => {
      currentItems.push(item);
    });
    if (res.data.nextPageToken && (customRequestAmount > 50 || !customRequestAmount)) {
      playlistInfoRecursive(playlistId, callStackSize + 1, res.data.nextPageToken, currentItems, (customRequestAmount > 50 ? customRequestAmount - 50 : customRequestAmount), callback);
    } else {
      callback(null, currentItems);
    }
  });
}

module.exports = function playlistInfo(apiKey, playlistId, options) {
  return new Promise((resolve, reject) => {
    if (!apiKey) return reject(new Error('No API Key Provided'));
    if (!playlistId) return reject(new Error('No Playlist ID Provided'));
    if (!options) options = {};
    google.options({ auth: apiKey });
    playlistInfoRecursive(playlistId, 0, null, [], options.maxResults || null, (err, list) => {
      if (err) return reject(err);
      return resolve(list);
    });
  });
};