# VARM Digital Signing Platform - Airtable Setup

This document outlines how to set up the Airtable integration for the VARM Digital Signing Platform.

## Airtable Configuration

1. Create an Airtable account if you don't have one already
2. Create a new base for the VARM Digital Signing Platform
3. Create a table called "Offers" with the following fields.

   The application supports flexible field naming, including:

   | App Field Name | Acceptable Airtable Field Names |
   |----------------|--------------------------------|
   | `slug`         | `slug`, `Slug`, `ID`, `Id`, `id` |
   | `customerName` | `customerName`, `Customer Name`, `Name`, `Client`, `Client Name` |
   | `offerAmount`  | `offerAmount`, `Offer Amount`, `Amount`, `Value`, `Price` |
   | `pdfUrl`       | `pdfUrl`, `Pdf Url`, `PDF URL`, `PDF`, `Document URL`, `Document Link`, `Attachment` |
   | `isSigned`     | `isSigned`, `Is Signed`, `Signed`, `Status` |
   | `signedAt`     | `signedAt`, `Signed At`, `Sign Date`, `Date Signed` |

4. Add a few sample offers to test the integration

   Sample fields to include:
   ```
   slug: offer-123  
   customerName: John Doe
   offerAmount: 150000
   pdfUrl: https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf
   isSigned: false
   ```

## Environment Variables

1. Get your Airtable API key from https://airtable.com/account
2. Find your Base ID from the Airtable API documentation for your base
3. Create a `.env` file in the project root (based on `.env.example`)
4. Set the following environment variables:
   ```
   VITE_AIRTABLE_API_KEY=your_api_key_here
   VITE_AIRTABLE_BASE_ID=your_base_id_here
   ```

## Validation Script

A validation script is included to verify your Airtable configuration:

```bash
# Install dependencies if you haven't already
npm install dotenv

# Run the validation script
node scripts/validate-airtable.js
```

The script will:
- Check your environment variables
- Connect to your Airtable base
- Verify that all required fields are present (with any supported naming patterns)
- Test record retrieval and transformation
- Display a sample record before and after transformation

## Manual Verification

Once you've set up the Airtable integration:

1. Run the application with `npm run dev`
2. Verify that offers are being fetched from Airtable on the Offers page
3. Test the signing process to ensure that updates work correctly
4. Check the Airtable base to confirm that offers are being updated

## Troubleshooting Common Issues

### Environment Variables Not Found
- Ensure your `.env` file is in the project root
- Verify the variable names start with `VITE_`
- Restart the development server after updating the file

### Authentication Errors
- Check that your Airtable API key is still valid
- Ensure you have proper permissions to the base

### Field Mapping Issues
- Use the validation script to check field mapping
- The application supports various field naming patterns
- If needed, the transform function in `src/api/airtableService.ts` can be customized further
