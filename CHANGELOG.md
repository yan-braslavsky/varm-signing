# Changelog

## Unreleased

### Fixed
- Fixed Firebase hosting configuration in firebase.json to use the correct build output directory (`dist` instead of `web/dist`), resolving GitHub Actions deployment errors.
- Fixed environment variables issue in GitHub Actions workflows by properly passing Airtable API keys during build process.
- Fixed React key prop warning in DemoPage component by correcting Tailwind CSS class names (changed `lg-grid-cols-2` to `lg:grid-cols-2` and `hover:scale-102` to `hover:scale-105`).
- Improved key prop uniqueness in DemoPage component by adding more specific prefixes to list keys (changed numeric keys to `skeleton-${i}` and slug keys to `offer-${offer.slug}`).
- Fixed duplicate key error in DemoPage component by adding fallback to index when offer.slug is undefined and adding visual indicators for offers with missing slugs.
