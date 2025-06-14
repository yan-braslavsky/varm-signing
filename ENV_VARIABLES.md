# Environment Variables in VARM Signing Platform

This document explains how environment variables are managed in the VARM Signing Platform.

## Required Environment Variables

The following environment variables are required for the application to work properly:

- `VITE_AIRTABLE_BASE_ID`: The ID of your Airtable base
- `VITE_AIRTABLE_API_KEY`: Your Airtable API key

## Local Development

For local development, create a `.env` file in the root of your project with the following content:

```
VITE_AIRTABLE_BASE_ID=your_airtable_base_id
VITE_AIRTABLE_API_KEY=your_airtable_api_key
```

## CI/CD Pipeline

GitHub Actions workflows use GitHub repository secrets to set environment variables during the build process. These secrets should be configured in your GitHub repository settings:

1. Go to your repository on GitHub
2. Click on "Settings"
3. Navigate to "Secrets and variables" > "Actions"
4. Add the following repository secrets:
   - `VITE_AIRTABLE_BASE_ID`: Your Airtable base ID
   - `VITE_AIRTABLE_API_KEY`: Your Airtable API key

The workflows in `.github/workflows/*.yml` are configured to use these secrets during the build process.

## Environment Variables in Vite

This project uses Vite as the build tool, which has specific requirements for environment variables:

- Variables must be prefixed with `VITE_` to be accessible in the client code
- Environment variables are replaced during build time, not runtime
- They can be accessed in the code using `import.meta.env.VITE_VARIABLE_NAME`

For more information on environment variables in Vite, see the [Vite documentation](https://vitejs.dev/guide/env-and-mode.html).

## Troubleshooting

If you encounter the error `Airtable getAllOffers error: Error: VITE_AIRTABLE_BASE_ID environment variable is required`, it means that the environment variables are not properly set. Check:

1. For local development: That your `.env` file exists and contains the required variables
2. For deployed versions: That GitHub repository secrets are properly configured

## Using Environment Variables with Firebase Emulators

When using Firebase Emulators for local testing, you may need to set environment variables differently. You can:

1. Use the `--env-file` flag with the Firebase CLI
2. Export environment variables before starting the emulators
3. Use a `.env.local` file that's automatically loaded by the emulators

Example:
```bash
export VITE_AIRTABLE_BASE_ID=your_airtable_base_id
export VITE_AIRTABLE_API_KEY=your_airtable_api_key
firebase emulators:start
```
