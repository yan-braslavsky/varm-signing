# VARM Signing Platform

A production-grade React + TypeScript application for climate-tech offer signing with Airtable integration.

## Live Demo

**Working Prototype:** [https://varm-55a88.web.app/offers](https://varm-55a88.web.app/offers)

**Airtable Backend:** [View the Airtable Base](https://airtable.com/invite/l?inviteId=invAUe8rTZpUsb0vb&inviteToken=66211d94ac89c4ad05e6679412e4c18e46cdee4da890a0a93b9e6aceb5062aa9&utm_medium=email&utm_source=product_team&utm_content=transactional-alerts)

## How to Use the Demo

1. Visit the [Offers Page](https://varm-55a88.web.app/offers)
2. Select any offer from the list to view its details
3. Review the offer information and the embedded PDF document
4. Sign the offer by clicking the "Sign Now" button
5. See the confirmation page with next steps

## Project Overview

### Frontend Implementation

The VARM Signing Platform replaces the traditional Miniextension approach with a custom-built React application that provides:

- **Clear Offer Overview**: A minimalist yet comprehensive display of key offer details (customer name, offer amount, project address, etc.)
- **Document Display**: Embedded PDF viewer showing the complete offer document
- **One-Click Signing**: Simple and intuitive signing mechanism with clear user feedback
- **Success Confirmation**: Post-signing page explaining next steps and providing contact information
- **Responsive Design**: Fully responsive layout that works on all devices from mobile to desktop
- **Quick Loading**: Optimized assets and lazy-loading for fast initial page load

The UI/UX focuses on:
- Clear visual hierarchy emphasizing the most important information
- Consistent branding and professional aesthetic
- Accessible design with proper contrast and semantic HTML
- Progressive loading indicators for longer operations
- Error states with helpful recovery actions

### Airtable Integration

The platform connects seamlessly with Airtable:

- **Record Fetching**: Each offer is retrieved using a unique slug identifier
- **Personalization**: All offer details (customer name, amount, project details) are dynamically populated
- **Status Tracking**: Upon signing, the Airtable record is immediately updated with:
  - Signature status (boolean flag)
  - Timestamp of signature
  - Future enhancements could include signature data or IP address
- **Revisit Handling**: If a user revisits a signed offer, they see a clear notification that it has already been signed, with details of when the signing occurred

### API Architecture

The platform uses a Firebase Cloud Functions-based REST API that:

1. **Endpoints**:
   - `GET /offer/:slug` - Retrieves offer details
   - `POST /offer/:slug/sign` - Signs a specific offer
   - `GET /offers` - Lists all available offers (admin only)

2. **Data Structures**:
   ```typescript
   interface Offer {
     slug: string;
     customerName: string;
     offerAmount: number;
     projectAddress: string;
     pdfUrl: string;
     isSigned: boolean;
     signedAt?: string;
     notes?: string;
   }
   
   interface ApiResponse<T> {
     data?: T;
     error?: string;
     status: number;
     details?: any;
   }
   ```

3. **Data Integrity**:
   - Optimistic concurrency control prevents race conditions
   - Retry mechanisms handle transient errors
   - Input validation on all endpoints
   - Error handling with specific status codes and messages

4. **Data Flow**:
   - Frontend calls API endpoints securely
   - Firebase authenticates and authorizes requests
   - Cloud Functions interact with Airtable API
   - Changes in Airtable can trigger automations via Make.com or Zapier

## Technical Implementation Details

### Concurrency Control

The platform implements a robust concurrency control mechanism to handle multiple signing attempts:

- **Check-and-Set Pattern**: Verifies offer status before and during signing operation
- **Retry Logic**: Employs exponential backoff with jitter for transient failures
- **Clear Error Messages**: Provides user-friendly notifications if an offer was already signed
- **Idempotent Operations**: Prevents duplicate signatures even with multiple submission attempts

### Connection Loss Handling

The application gracefully manages connection issues during the signing process:

- **State Persistence**: Maintains signing state through connection interruptions
- **Automatic Retry**: Backend retry logic for failed submission attempts
- **User Feedback**: Clear messaging about connection status
- **Data Consistency**: Server-side validation ensures no duplicate records are created

### Performance Optimizations

- **Lazy Loading**: Non-critical assets are loaded only when needed
- **Efficient API Calls**: Minimal payloads and selective field fetching
- **Caching Strategy**: PDF documents are cached for quicker repeat access
- **Responsive Images**: Properly sized images for different viewport sizes
- **Compression**: Minified assets and gzip/Brotli compression

### Future Enhancements

1. **Signature Capture**:
   - Add optional signature drawing or typed signature
   - Store signature image/data with the signed record

2. **Multi-step Signing**:
   - Enable more complex contracts with multi-party signing
   - Add sequential approval workflows

3. **Webhooks**:
   - Allow subscribing to signing events for integration with other systems
   - Support custom callbacks for different stages of the signing process

4. **Analytics**:
   - Add view tracking to see when offers were viewed vs. signed
   - Implement conversion rate analytics and funnel visualization

## Code Architecture

The project follows a clean, modular architecture:

- **Components**: Reusable UI elements with clear interfaces
- **Pages**: Route-based containers for components
- **API Layer**: Abstraction for backend communication
- **Services**: Business logic separated from UI concerns
- **Types**: Strong TypeScript typing throughout the codebase
- **Tests**: Comprehensive test coverage with Vitest

### REST API Design

The API design prioritizes:

1. **Simplicity**: Straightforward endpoints with clear purposes
2. **Consistency**: Uniform error handling and response structure
3. **Security**: Proper authentication and authorization checks
4. **Validation**: Input validation on all endpoints
5. **Documentation**: Self-documenting patterns and clear comments

Each endpoint includes:
- Input validation
- Authorization checks
- Error handling
- Logging
- Response formatting

### Error Handling Strategy

The application implements a multi-layered error handling strategy:

- **Client-side validation**: Prevents invalid requests from being sent
- **Server-side validation**: Ensures data integrity regardless of client state
- **Concurrency control**: Prevents race conditions with multiple simultaneous operations
- **Clear user feedback**: Helpful error messages when issues occur
- **Logging**: Comprehensive logging for debugging and monitoring

## Deployment and Infrastructure

The application is deployed using:

- **Hosting**: Firebase Hosting for the frontend application
- **API**: Firebase Cloud Functions for the backend API
- **Database**: Airtable as the primary data store
- **CI/CD**: GitHub Actions for automated deployment
- **Monitoring**: Firebase Monitoring and Logging

## Technical Assumptions and Trade-offs

1. **Airtable as the Database**:
   - **Pro**: Excellent for rapid development and non-technical user management
   - **Con**: Limited transaction support and query capabilities
   - **Mitigation**: Added concurrency control at the application layer

2. **Firebase Functions**:
   - **Pro**: Serverless architecture scales automatically
   - **Con**: Cold start times can impact performance
   - **Mitigation**: Optimized function code and implemented keepalive strategies

3. **React SPA**:
   - **Pro**: Rich interactive experience with minimal page reloads
   - **Con**: Initial load time can be longer than server-rendered pages
   - **Mitigation**: Implemented code-splitting and optimized bundle size

4. **PDF Viewing**:
   - **Pro**: Embedded viewing provides seamless experience
   - **Con**: Large PDF files can slow page loading
   - **Mitigation**: Added progressive loading and caching strategies

## Getting Started for Development

```bash
# Clone the repository
git clone <repository-url>

# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test
```

## Environment Variables

This project requires configuration through environment variables:

```bash
# Create environment file
cp .env.example .env

# Edit the file with your specific configuration
```

Required variables:
- `VITE_API_BASE_URL`: URL to your Firebase Functions API
- `FIREBASE_API_KEY`: Firebase API key (for deployment)
- `AIRTABLE_API_KEY`: Airtable API key (for Cloud Functions)
- `AIRTABLE_BASE_ID`: Airtable Base ID

## License

This project is proprietary and confidential. All rights reserved.

export default tseslint.config({
  plugins: {
    // Add the react-x and react-dom plugins
    'react-x': reactX,
    'react-dom': reactDom,
  },
  rules: {
    // other rules...
    // Enable its recommended typescript rules
    ...reactX.configs['recommended-typescript'].rules,
    ...reactDom.configs.recommended.rules,
  },
})
```
