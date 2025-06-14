# GitHub Copilot Instructions for VARM Signing Platform

## Project Overview
- This is a production-grade React + TypeScript application for climate-tech offer signing
- The project uses Vite as the build tool and Firebase as the backend platform
- Main dependencies include React 19, React Router, React Hot Toast, and Lucide for icons
- Node.js 20+ and npm 10+ are required for development

## Changelog Management
- When making significant changes to the codebase (new feature, bug fix, refactor, dependency update), create a `CHANGELOG.md` file if it doesn't exist or update it.
- Follow this format for changelog entries:
  
  ```md
  ## [Version] - YYYY-MM-DD
  ### Added
  - Brief description of new features.
  
  ### Changed
  - List of modifications or improvements.
  
  ### Fixed
  - Description of bug fixes.
  ```
- If no versioning system is in place, add changes under an `## Unreleased` section.
- Include changelog updates in your commits when making relevant changes.

## Project Structure
- Maintain the current structure with:
  - `src/components/`: Reusable UI components
  - `src/pages/`: Full page components with routing
  - `src/api/`: API service layers
  - `src/types/`: TypeScript types and interfaces
  - `src/assets/`: Static assets like images
  - `src/test/`: Test files

## TypeScript Conventions
- Use `React.FC<Props>` for functional components with explicitly defined prop interfaces
- Prefer `useState<Type>` for typed state hooks
- Avoid `any` type; use specific types or `unknown` when necessary
- Always type API responses with interfaces or type aliases

## React Development Guidelines
- Use hooks instead of class components (`useState`, `useEffect`, `useMemo`, `useCallback`)
- For data fetching, consider adding React Query if needed
- Use Context API for global state management as the project grows
- Follow accessibility best practices (e.g., `aria-*` attributes, semantic HTML)

## Styling Approach
- The project currently uses component-specific CSS files
- When creating new components, create a corresponding CSS file
- Prefix CSS classes with 3 prominent letters from the component name for uniqueness
- If implementing TailwindCSS:
  - Install with `npm install -D tailwindcss postcss autoprefixer`
  - Initialize with `npx tailwindcss init -p`
  - Configure content paths in `tailwind.config.js`
  - Add Tailwind directives to your CSS
  - Use utility classes directly in components
  - For complex components, consider extracting reusable classes with `@apply`
- Whether using CSS files or Tailwind, maintain consistent styling patterns throughout the project

## Testing Standards
- Write tests using Vitest and React Testing Library in the `src/test` directory
- Follow the Vite testing conventions with proper test setup in `src/test/setup.ts`
- Create test files with `.test.tsx` or `.test.ts` extensions
- Structure tests with descriptive test cases using `describe` and `it` blocks
- Use MSW (Mock Service Worker) for API mocking when necessary
- Use the testing scripts in package.json:
  - `npm test`: Run tests in watch mode
  - `npm run test:ui`: Open Vitest UI for interactive testing
  - `npm run test:coverage`: Generate coverage report
- Aim for comprehensive test coverage of components and business logic
- Write both unit tests and integration tests when appropriate

## Code Formatting & Standards
- The project uses ESLint for linting
- Follow proper code organization practices:
  - Use absolute imports for better module resolution
  - Use descriptive variable and function names
  - Extract reusable logic into custom hooks or utility functions
- Always look for existing components and code to reuse before creating new ones
- Check the `src/components` directory for reusable UI components
- Apply the Boy Scout Rule: "Always leave the code cleaner than you found it"
  - Refactor code to improve readability when working in a file
  - Improve test coverage when modifying functionality
  - Extract hardcoded values into constants where appropriate
  - Consolidate duplicate logic into shared functions
  - Add or improve documentation for complex sections of code

## Commit Message Guidelines
- Follow conventional commit messages:
  - `feat: ` for new features
  - `fix: ` for bug fixes
  - `refactor: ` for code improvements
  - `docs: ` for documentation updates
  - `chore: ` for dependency updates
