# 🏀 Court Check-In

A community web app for reporting who's at the basketball court.

## Courts
- Sierra Bella
- Green River Clubhouse
- Cerritos Courts

## Live site
https://saintjt-coder.github.io/Park-Check-In/

Enter a nickname, tap **Check in** at a court, and tap **Leave** when you go. Check-ins expire after three hours. This is a voluntary, user-reported count—not a verified headcount or a court reservation.

## Privacy and access
Check-in nicknames, selected courts, and arrival times are visible to other users who open the app. Firebase Realtime Database stores shared check-in data, not just data on your own device. A browser-generated identifier is stored locally to remember your check-in; it is not a verified account identity. Avoid using your full name or posting sensitive information.

The privacy policy is available at https://saintjt-coder.github.io/privacy.html .

## Running and deploying
The frontend is static: open `index.html` locally to inspect the layout, or use GitHub Pages for hosting. Shared check-ins and notification behavior require network access and the configured Firebase services. Do not assume opening a local HTML file fully exercises production behavior.

Changes to Firebase Functions and security rules require separate review and deployment. Always confirm database rules restrict unwanted writes, test on multiple devices, and verify expiring check-ins after a release.

## Troubleshooting
If check-ins are not updating, verify network connectivity and Firebase status. On iPhone, web push notifications generally require adding the app to the Home Screen and granting notification permissions from there. Report issues at https://github.com/SaintJT-coder/Park-Check-In/issues without including personal data or credentials.
