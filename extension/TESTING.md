# Testing the Snitch Browser Extension

## Quick Start

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Select the `extension` folder from this project
5. Extension should now be installed

## Test Cases

### Test 1: Apple App Store Badge
1. Visit: https://apps.apple.com/us/app/discord-chat-talk-hangout/id985746746
2. Wait for page to load
3. Look for Snitch privacy badge near the app header
4. Badge should show score, label, and summary

### Test 2: Google Play Store Badge
1. Visit: https://play.google.com/store/apps/details?id=com.discord
2. Wait for page to load
3. Look for Snitch privacy badge
4. Badge should appear near app name

### Test 3: Extension Popup
1. While on any app store page, click the Snitch extension icon
2. Popup should show:
   - App name
   - Privacy score (colored)
   - Summary text
   - Link to full details

### Test 4: Non-App Store Page
1. Visit any regular website (e.g., google.com)
2. Click the Snitch extension icon
3. Should show message: "Visit an app store page to check privacy scores"

## Troubleshooting

### Badge not appearing
- Check browser console for errors (F12)
- Verify API is responding: https://snitchh.onrender.com
- Check if app name extraction is working (see console logs)

### Rate limiting
- Backend limits to 10 requests per minute per IP
- Wait 1 minute if you hit the limit
- Error will show in console

### API errors
- Backend might be cold starting (Render free tier)
- First request may take 30-60 seconds
- Subsequent requests should be fast

## Known Issues

1. App name extraction may not work for all app store layouts
2. Some apps may not be recognized by the AI
3. Rate limiting applies across all users from same IP

## Next Steps

1. Test on various app store pages
2. Improve app name extraction if needed
3. Add error handling for edge cases
4. Consider caching results to reduce API calls
5. Publish to Chrome Web Store
