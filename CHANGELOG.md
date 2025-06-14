# Changelog

## Unreleased

### Added
- Implemented comprehensive logging system with the new `utils/logger.ts` utility
- Added detailed data validation for offers to filter out incomplete or invalid data
- Added error retry functionality in DemoPage with visual feedback
- Added empty state handling when no offers are available
- Added better error handling with user-friendly error messages
- Added data inspection logging utility for better debugging
- Added robust data fallback mechanism to handle incomplete data from API

### Changed
- Enhanced API calls with structured logging to track request/response cycles
- Improved DemoPage to use proper loading skeleton components
- Refactored data fetching logic with better error handling
- Improved UI feedback with success indicators for data loading

### Fixed
- Fixed Firebase hosting configuration in firebase.json to use the correct build output directory (`dist` instead of `web/dist`), resolving GitHub Actions deployment errors.
- Fixed environment variables issue in GitHub Actions workflows by properly passing Airtable API keys during build process.
- Fixed React key prop warning in DemoPage component by correcting Tailwind CSS class names (changed `lg-grid-cols-2` to `lg:grid-cols-2` and `hover:scale-102` to `hover:scale-105`).
- Improved key prop uniqueness in DemoPage component by adding more specific prefixes to list keys (changed numeric keys to `skeleton-${i}` and slug keys to `offer-${offer.slug}`).
- Fixed duplicate key error in DemoPage component by adding fallback to index when offer.slug is undefined and adding visual indicators for offers with missing slugs.
- Fixed TypeScript environment variable reference by using Vite's `import.meta.env` instead of Node's `process.env`.
- Fixed offers not displaying due to overly strict data validation by adding fallbacks for missing fields and a recovery mechanism.
