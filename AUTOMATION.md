# VARM Signing Platform: Webhook & Automation Integration Guide

This document explains how to set up webhooks and automation workflows with the VARM Signing Platform after the addition of the Cloud Functions API layer.

## Overview

With the REST API layer in place, you now have three options for automation:

1. **Airtable Automations**: Setting up automations directly in Airtable when records are updated
2. **Make.com Integration**: Using Make.com to listen for API events or Airtable changes
3. **Direct API Integration**: Calling the REST API endpoints from any external system

## 1. Airtable Automation Setup

This is the simplest approach for basic notifications when an offer is signed.

### Setting up an Airtable Automation:

1. Open your Airtable base
2. Go to the "Automations" tab
3. Create a new automation
4. For the trigger, select "When record matches conditions"
   - Table: Offers
   - Condition: {Signed} is checked (or {Is Signed} depending on your field name)
5. For the action, you can choose:
   - Send an email notification
   - Send a Slack message
   - Create a record in another table
   - Make an HTTP request to another system

Example use cases:
- Send email notification to sales team when offer is signed
- Create a record in a "Contracts" table when an offer is signed
- Update a dashboard counter via webhook

## 2. Make.com Integration

For more complex workflows, Make.com (formerly Integromat) provides powerful automation capabilities.

### Option A: Watch for Airtable Changes

1. Create a new scenario in Make.com
2. Add an Airtable trigger: "Watch Records"
   - Select your base and table
   - Set it to watch for updated records
   - Filter for records where {Signed} = true
3. Add additional modules to your workflow:
   - Send emails
   - Update CRM records
   - Generate documents
   - Post to messaging platforms

### Option B: Use the VARM REST API Directly

1. Create a new scenario in Make.com
2. Add an "HTTP" module with a webhook trigger
3. Configure your Cloud Functions to call this webhook when an offer is signed
4. Process the incoming webhook data in Make.com

## 3. Directly Integrating with REST API

For developers who want to integrate directly with the API:

### API Endpoints

- **GET /api/offer/:slug**: Get offer details by slug
- **POST /api/offer/:slug/sign**: Sign an offer
- **GET /api/offers**: Get all offers

### Authentication

The API currently uses Firebase Authentication. To authenticate your requests:

1. Obtain a Firebase Auth token
2. Include it in the Authorization header: `Authorization: Bearer YOUR_TOKEN`

### Example: Signing an Offer Programmatically

```javascript
async function signOffer(slug) {
  const response = await fetch(`https://us-central1-varm-signing.cloudfunctions.net/api/offer/${slug}/sign`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer YOUR_TOKEN'
    },
    body: JSON.stringify({
      // Additional signing data if needed
    })
  });
  return await response.json();
}
```

## Best Practices

1. **Error Handling**: Always account for the API returning 409 (Conflict) if an offer is already signed
2. **Rate Limiting**: Be mindful of API rate limits and implement backoff strategies
3. **Testing**: Use the Firebase Emulator to test your automation flows locally
4. **Logging**: Enable detailed logging to troubleshoot automation issues

## Implementation Notes

The current REST API layer implements the same validation as the frontend:

- Checks if the offer exists before attempting to sign
- Verifies that the offer hasn't already been signed
- Ensures data integrity across multiple systems

## Future Enhancements

- Webhook subscription endpoint for real-time notifications
- Enhanced authentication options
- Configurable webhook destinations in the admin panel
