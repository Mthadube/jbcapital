# Notification Sounds

This folder contains sound files used for the notification system.

## Sound Files

- `notification.mp3` - Default notification sound
- `application.mp3` - New loan application notification
- `document.mp3` - Document upload/verification notification
- `payment.mp3` - Payment received notification
- `warning.mp3` - Warning/alert notification

## Adding New Sounds

When adding new sound files:

1. Use MP3 format for best browser compatibility
2. Keep files small (under 100KB) for performance
3. Update the sound mappings in the `playNotificationSound` function in AppDataContext.tsx

## Attribution

These sounds are either:
- Created specifically for JB Capital
- Licensed under CC0 (Creative Commons Zero)
- Used under appropriate licensing

## Usage

Sounds are played automatically by the notification system when:
- New applications are submitted
- Documents are uploaded
- Payments are processed
- Important system events occur

Sound playback is controlled by user preferences in Settings. 