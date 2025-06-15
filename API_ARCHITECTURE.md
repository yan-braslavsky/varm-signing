# VARM Signing Platform API Architecture

This document outlines the architecture of the VARM Signing Platform API, which uses Firebase Cloud Functions to securely interact with Airtable as the data source.

## Architecture Overview

The VARM Signing Platform uses a layered approach:

```
Frontend (React) → REST API (Firebase Cloud Functions) → Airtable
```

### Key Components

1. **Frontend API Service (`restApiService.ts`)**
   - Provides a clean interface for the React frontend to interact with the API
   - Handles HTTP requests and responses
   - Manages error handling and logging

2. **Cloud Functions API Layer (`functions/src/index.ts`)**
   - Implements REST API endpoints
   - Handles CORS and authentication
   - Routes requests to appropriate handlers

3. **Request Handlers (`functions/src/handlers/offerHandlers.ts`)**
   - Process incoming requests
   - Implement business logic
   - Call the appropriate service methods
   - Handle response formatting

4. **Airtable Service (`functions/src/services/airtableService.ts`)**
   - Encapsulates Airtable-specific code
   - Handles data mapping between Airtable records and application models
   - Manages Airtable API authentication and requests

5. **Authentication Middleware (`functions/src/middleware/authMiddleware.ts`)**
   - Provides API key authentication for sensitive endpoints
   - Supports Firebase Authentication (optional)
   - Enforces CORS security

## Security Benefits

This architecture provides several security advantages:

1. **No Client-Side API Keys**: Airtable API keys are only stored in Firebase configuration and never exposed to the client.

2. **Centralized Access Control**: All data access is controlled through the API layer.

3. **Input Validation**: Requests are validated both on client and server side.

4. **API Key Authentication**: Sensitive endpoints require an API key for access.

5. **CORS Protection**: API requests are restricted to allowed origins.

## Flow of Data

1. **User Request**: A user interacts with the frontend (e.g., viewing an offer).

2. **Frontend API**: The `offerApi.ts` calls `restApiService.ts` to make an HTTP request to the Cloud Functions API.

3. **API Gateway**: The request is received by Firebase Cloud Functions, validated, and routed to the appropriate handler.

4. **Request Processing**: The handler calls the Airtable service with the necessary parameters.

5. **Data Access**: The Airtable service fetches or updates data in Airtable using the secured API key.

6. **Response**: Data is transformed to the application model and sent back through the layers to the frontend.

## Integration Points

- **Webhooks**: External systems can interact with the API to trigger actions or receive notifications.

- **Automation Services**: Services like Make.com or Zapier can use the API to integrate with other systems.

- **Custom Clients**: Any client that can make HTTP requests can interact with the API using appropriate authentication.

## Testing Approach

- **Unit Tests**: Individual components are tested in isolation with mocks.
  - `offerApi.test.ts`: Tests the frontend API service using mocks for `restApiService`.
  - `restApiService.mock.ts`: Mock implementation for REST API service with sample data.
  - `airtableService.mock.ts`: Mock implementation of the removed Airtable service to support legacy tests.

- **Integration Tests**: API endpoints are tested with mock Airtable responses.
  - Tests for the Cloud Functions API endpoints can verify proper request handling and data transformation.

- **End-to-End Tests**: Complete flows are tested from frontend to backend.
  - Tests can verify the complete user journey from viewing offers to signing.

## Future Enhancements

- **Caching Layer**: Add Redis or Firebase Cache to improve performance.

- **Rate Limiting**: Implement rate limiting to prevent abuse.

- **Enhanced Authentication**: Add user-specific authentication for personalized experiences.
