# VARM Digital Signing App

A production-grade React + TypeScript application for VARM's digital offer signing platform. This app provides a modern, trustworthy, and mobile-first experience for customers to view and sign climate-tech offer documents.

## 🎯 Features

### Core Functionality
- **Personalized Offer Display**: Shows customer name, offer amount, and document details
- **PDF Document Viewer**: Inline PDF viewing with download and external link options
- **One-Click Signing**: Simple "Sign and Accept" functionality with loading states
- **Success Confirmation**: Animated success page with signature timestamp
- **Mobile-First Design**: Responsive layout optimized for all devices
- **Demo Interface**: Interactive demo page showcasing all available offers

### Technical Features
- **TypeScript**: Full type safety throughout the application
- **Error Handling**: Comprehensive error states and retry mechanisms
- **Loading States**: Skeleton loaders and smooth transitions
- **Toast Notifications**: User-friendly feedback for actions
- **Mock API**: Realistic API simulation with network delays and error scenarios
- **Scalable Architecture**: Modular components and clear separation of concerns

## 🧩 Tech Stack

- **Frontend**: React 19, TypeScript, Vite
- **Styling**: Custom CSS with modern design patterns (utility-class based)
- **Routing**: React Router v6
- **Icons**: Lucide React
- **Notifications**: React Hot Toast
- **Backend**: Firebase Cloud Functions (configured)
- **Data**: Airtable integration (ready for implementation)

## 🚀 Getting Started

### Prerequisites
- Node.js 20+
- npm or yarn

### Installation & Running

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start the development server**:
   ```bash
   npm run dev
   ```

3. **Open in browser**:
   Navigate to `http://localhost:5175` (or the port shown in terminal)

### Available Demo URLs

The app includes a demo page at `/demo` with the following test offers:

- `/sign/test-offer-123` - John Doe ($150,000) - Unsigned
- `/sign/signed-offer-456` - Jane Smith ($275,000) - Already signed  
- `/sign/demo-offer-789` - Alice Johnson ($320,000) - Unsigned
- `/sign/solar-deal-abc` - Michael Brown ($85,000) - Unsigned
- `/sign/wind-project-xyz` - Sarah Wilson ($450,000) - Unsigned

## 🎨 Design System

### Color Palette
- **Primary**: Blue tones (`#2563eb`, `#1d4ed8`)
- **Accent**: Green tones (`#059669`, `#047857`)
- **Neutral**: Gray scale (`#f9fafb` to `#111827`)

### Typography
- **Font**: Inter (Google Fonts)
- **Sizes**: Responsive scaling from mobile to desktop
- **Weights**: 300-700 for proper hierarchy

### Components
- **Rounded Corners**: Consistent 0.75rem-1rem radius
- **Shadows**: Subtle depth with modern shadow patterns
- **Animations**: Smooth transitions and loading states
- **Mobile-First**: Progressive enhancement approach

## 📦 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── OfferCard.tsx   # Displays offer details
│   ├── SignButton.tsx  # Sign and accept button
│   ├── PDFViewer.tsx   # PDF document viewer
│   ├── SuccessMessage.tsx # Success confirmation
│   ├── ErrorMessage.tsx   # Error handling
│   └── LoadingSkeleton.tsx # Loading states
├── pages/              # Main application pages
│   ├── DemoPage.tsx    # Demo interface with all offers
│   ├── SignPage.tsx    # Offer signing page
│   └── SuccessPage.tsx # Success confirmation page
├── api/                # API layer and data management
│   └── offerApi.ts     # Offer data operations
├── types/              # TypeScript interfaces
│   └── offer.ts        # Data type definitions
├── App.tsx             # Main application component
├── main.tsx            # Application entry point
└── index.css           # Global styles and utilities
```

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file:

```env
VITE_API_BASE_URL=/api
VITE_AIRTABLE_API_KEY=your_airtable_api_key_here
VITE_AIRTABLE_BASE_ID=your_airtable_base_id_here
```

### Firebase Setup

The project is configured for Firebase hosting and Cloud Functions:

- `firebase.json` - Firebase configuration
- `functions/` - Cloud Functions for API endpoints
- Ready for deployment with `firebase deploy`

## 📋 API Design

### Current Implementation (Mock Data)

The app currently uses mock data with realistic network delays and error simulation:

**Mock API Endpoints:**
- `getOffer(slug)` - Fetches offer details
- `signOffer(slug)` - Signs offer and updates timestamp
- `getAllOffers()` - Returns all available demo offers

### Production API (Ready for Implementation)

**GET /api/offer/:slug**
- Fetches offer details by slug
- Returns: `{ data: Offer, status: number }`
- Errors: 404 (not found), 500 (server error)

**POST /api/offer/:slug/sign**
- Signs an offer and updates timestamp
- Returns: `{ data: Offer, status: number }`
- Errors: 409 (already signed), 404 (not found), 500 (server error)

### Data Structure

```typescript
interface Offer {
  slug: string;
  customerName: string;
  offerAmount: number;
  pdfUrl: string;
  isSigned: boolean;
  signedAt?: string;
}
```

## 🚨 Error Handling

### Edge Cases Covered
- **Invalid slugs**: Clear error messaging with retry options
- **Already signed offers**: Disabled button with status indicator
- **Network failures**: Toast notifications with retry suggestions
- **Concurrent signatures**: Proper status validation
- **PDF loading errors**: Fallback download options
- **Random network errors**: 5% simulation for testing resilience

### User Experience
- **Loading skeletons** during data fetching
- **Toast notifications** for success/error feedback
- **Retry mechanisms** for failed operations
- **Clear error messages** with actionable next steps
- **Navigation breadcrumbs** for easy movement between pages

## 🔄 Airtable Integration (Ready for Implementation)

The app is designed to integrate with Airtable for data storage:

### Expected Airtable Schema

**Offers Table**:
- `slug` (Single line text) - Unique identifier
- `customerName` (Single line text) - Customer name
- `offerAmount` (Number) - Offer amount in dollars
- `pdfUrl` (URL) - Link to PDF document
- `isSigned` (Checkbox) - Signature status
- `signedAt` (Date) - Signature timestamp

### Implementation Notes
- API functions in `functions/src/index.ts` are ready for Airtable integration
- Replace mock data with actual Airtable API calls
- Use environment variables for API keys
- Implement proper error handling for Airtable API responses

## 📱 Mobile Experience

### Responsive Design
- **Mobile-first** approach with progressive enhancement
- **Touch-friendly** buttons and interactions
- **Optimized PDFs** for mobile viewing
- **Fast loading** with skeleton states

### Performance
- **Optimized bundle** with Vite's fast bundling
- **Minimal dependencies** for faster loading
- **Efficient re-renders** with React optimization
- **Smooth animations** with CSS transitions

## 🧪 Testing Scenarios

### Happy Path
1. Visit demo page at `/demo`
2. Select an unsigned offer
3. View offer details and PDF
4. Click "Sign and Accept"
5. See success page with confirmation

### Error Scenarios
1. Invalid offer URL → Error message with retry
2. Already signed offer → Disabled button with status
3. Network failure → Toast notification with retry
4. PDF loading failure → Download fallback

### Demo Features
- Random network delays (600-1200ms)
- 5% random error simulation
- Multiple offer types and states
- Mobile and desktop testing

## 🚀 Deployment

### Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Firebase Deployment

```bash
# Build the project
npm run build

# Deploy to Firebase
firebase deploy
```

### Environment Setup
- **Development**: Mock data with realistic delays
- **Staging**: Firebase Functions with Airtable integration
- **Production**: Full stack with analytics and monitoring

## 🔮 Future Enhancements

### Planned Features
- **Electronic Signatures**: Digital signature capture with canvas
- **Multi-page PDFs**: Enhanced PDF viewer with pagination and zoom
- **Email Notifications**: Automated confirmation emails
- **Analytics Integration**: User behavior tracking
- **Accessibility**: WCAG 2.1 AA compliance
- **Internationalization**: Multi-language support

### Backend Improvements
- **Airtable Integration**: Replace mock data with real API
- **Authentication**: Optional user accounts for tracking
- **Audit Trail**: Signature logging and verification
- **PDF Generation**: Dynamic PDF creation
- **File Storage**: Firebase Storage integration

## 🛠️ Development

### Code Quality
- **TypeScript**: Strict type checking enabled
- **ESLint**: Code linting and formatting
- **Modular Architecture**: Reusable components
- **Clean Code**: Well-documented and maintainable

### Performance Optimizations
- **Lazy Loading**: Components loaded on demand
- **Bundle Optimization**: Tree shaking with Vite
- **Image Optimization**: Optimized assets
- **Caching Strategy**: API response caching ready

## 📝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes with proper TypeScript types
4. Test thoroughly on mobile and desktop
5. Submit a pull request

## ✅ Project Status

### ✅ Completed Features
- [x] Full React + TypeScript application
- [x] Mobile-responsive design with custom CSS
- [x] Complete offer signing workflow
- [x] PDF viewer with fallback options
- [x] Comprehensive error handling
- [x] Loading states and animations
- [x] Toast notifications
- [x] Demo page with all offers
- [x] Firebase project configuration
- [x] Mock API with realistic delays
- [x] Edge case coverage
- [x] Success page with animations
- [x] Navigation between pages
- [x] Production-ready code structure

### 🔄 Ready for Implementation
- [ ] Airtable API integration
- [ ] Firebase Functions deployment
- [ ] Production environment variables
- [ ] Analytics tracking
- [ ] Email notifications

### 🎯 Production Ready
The application is fully functional and ready for production use with mock data. Simply replace the mock API calls with real Airtable integration to go live.

## 📄 License

This project is private and proprietary to VARM.

---

**Built with ❤️ for VARM's climate-tech mission**
