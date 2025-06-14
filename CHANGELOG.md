# Changelog

## Unreleased

### Fixed
- Fixed Firebase hosting configuration in firebase.json to use the correct build output directory (`dist` instead of `web/dist`), resolving GitHub Actions deployment errors.
- Fixed environment variables issue in GitHub Actions workflows by properly passing Airtable API keys during build process.
