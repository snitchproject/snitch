# Snitch Browser Extension

Check app privacy scores instantly while browsing app stores.

## Features

- Shows privacy scores on Apple App Store, Google Play Store, and Chrome Web Store pages
- Click extension icon for quick privacy check
- Minimal design matching Snitch's aesthetic

## Installation

### Chrome/Edge/Brave

1. Open `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select the `extension` folder
5. Done!

### Firefox

1. Open `about:debugging#/runtime/this-firefox`
2. Click "Load Temporary Add-on"
3. Select `manifest.json` from the `extension` folder
4. Done!

## Usage

1. Visit any app page on:
   - Apple App Store (apps.apple.com)
   - Google Play Store (play.google.com)
   - Chrome Web Store (chrome.google.com/webstore)

2. Privacy score badge appears automatically on the page

3. Or click the extension icon for a quick popup with the score

## Icons

Icon files are included (generated from Snitch logo):
- `icon16.png` (16x16)
- `icon48.png` (48x48)
- `icon128.png` (128x128)

## Testing

1. Load the extension in Chrome (see Installation above)
2. Visit test pages:
   - Apple App Store: https://apps.apple.com/us/app/discord-chat-talk-hangout/id985746746
   - Google Play Store: https://play.google.com/store/apps/details?id=com.discord
3. Check if privacy badge appears on the page
4. Click the extension icon to see the popup
5. Check browser console for any errors

## Publishing

To publish to Chrome Web Store:
1. Zip the extension folder
2. Go to chrome.google.com/webstore/devconsole
3. Upload the zip
4. Fill in details and submit for review
