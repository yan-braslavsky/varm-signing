# VARM Digital Signing Platform - Airtable Setup

This document outlines how to set up the Airtable integration for the VARM Digital Signing Platform.

## Airtable Configuration

1. Create an Airtable account if you don't have one already
2. Create a new base for the VARM Digital Signing Platform
3. Create a table called "Offers" with the following fields:
   - `slug` (Single line text, Primary field)
   - `customerName` (Single line text)
   - `offerAmount` (Number)
   - `pdfUrl` (URL)
   - `isSigned` (Checkbox)
   - `signedAt` (Date & time)
4. Add a few sample offers to test the integration

## Environment Variables

1. Get your Airtable API key from https://airtable.com/account
2. Find your Base ID from the Airtable API documentation for your base
3. Create a `.env` file in the project root (based on `.env.example`)
4. Set the following environment variables:
   ```
   VITE_AIRTABLE_API_KEY=your_api_key_here
   VITE_AIRTABLE_BASE_ID=your_base_id_here
   ```

## Verification

Once you've set up the Airtable integration:

1. Run the application with `npm run dev`
2. Verify that offers are being fetched from Airtable
3. Test the signing process to ensure that updates work correctly
4. Check the Airtable base to confirm that offers are being updated
