# Bible Annals Project

## Project Overview
A comprehensive interactive timeline website showcasing biblical people, events, and regions with accurate historical information. Built with Next.js 14, TypeScript, and Tailwind CSS for responsive design across desktop and mobile platforms.

## Goals
- Create an interactive website to display a chronological timeline of biblical history
- Present complex historical information in a simple, accessible manner
- Maintain historical accuracy based on KJV biblical sources
- Support responsive design for both desktop and mobile screens
- Provide detailed views for people, events, and regions
- Enable efficient search and filtering capabilities

## Core Features

### Timeline Interface
- **Timeline Overview**: Interactive period buttons with visual indicators
- **Period Cards**: Expandable sections showing events, people, and regions for each era
- **Smart Scrolling**: Automatic navigation that only scrolls when content isn't visible
- **Sticky Headers**: Period headers that remain visible while scrolling within sections

### Search & Filtering
- **Universal Search**: Real-time search across people, events, regions, and periods
- **Date Range Filtering**: BC/AD date range controls with flexible era selection
- **Content Toggles**: Show/hide events, people, and regions independently
- **Auto-scroll to Results**: Search results automatically scroll into view

### Detail Views
- **Person Details**: Comprehensive information including family relationships, biblical references, and participated events
- **Event Details**: Full descriptions with dates, locations, participants, and biblical references  
- **Region Details**: Geographic information, time periods, notable people, and key features
- **Clickable References**: All biblical references link to bible.com for easy study

### Mobile Experience
- **Responsive Design**: Optimized layouts for mobile, tablet, and desktop
- **Compact Controls**: Condensed search and filter controls for mobile screens
- **Touch-friendly**: Large tap targets and smooth scroll behavior

## Technical Architecture

### Tech Stack
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript for type safety
- **Styling**: Tailwind CSS for responsive design
- **State Management**: React hooks (useState, useEffect)
- **Routing**: Next.js App Router with URL query parameters
- **Data Format**: YAML files for structured biblical data

### Data Structure
- **Events** (`data/events.yaml`): biblical events with dates, locations, participants
- **Persons** (`data/people.yaml`): Biblical figures with relationships and references
- **Regions** (`data/regions.yaml`): geographic locations with historical context

### Key Components
- **BiblicalTimeline.tsx**: Main timeline interface component
- **TimelinePeriodCard**: Individual period display component
- **PersonDetails**: Detailed person information component
- **Search/Filter Logic**: Advanced relevance scoring and date parsing

## Bash Commands
- `npm run build`: Build the project for production
- `npm run dev`: Start development server
- `npm run lint`: Run ESLint for code quality

## Code Style Guidelines

### Import/Export
- Use ES modules (import/export) syntax, not CommonJS (require)
- Destructure imports when possible: `import { foo } from 'bar'`
- Organize imports: React first, then libraries, then local components

### File Organization
- Keep files focused on a single responsibility
- Create separate files to maintain focus, purpose, and manageable size
- Use TypeScript interfaces for type definitions
- Group related functionality in logical modules

### Component Design
- Use functional components with hooks
- Implement responsive design with Tailwind CSS classes
- Ensure accessibility with proper ARIA labels and semantic HTML
- Maintain consistent naming conventions

### Code Quality
- Follow TypeScript best practices for type safety
- Use meaningful variable and function names
- Add comments for complex business logic
- Implement error handling for edge cases

## Development Workflow

### Before Making Changes
1. Read and understand the current codebase structure
2. Check existing patterns and conventions
3. Identify the specific component or file to modify

### Making Changes
1. Follow the established code style and patterns
2. Ensure responsive design works on all screen sizes
3. Test search and filtering functionality
4. Verify biblical accuracy of any content changes
5. Make sure content isn't initially hidden underneath sticky headers.

### After Making Changes
1. **Always run `npm run build`** to ensure the project compiles
2. Test on both desktop and mobile layouts
3. Verify search and filter functionality works correctly
4. Check that biblical references are properly linked
5. Clean up any unused code or imports

### Testing Guidelines
- Test responsive design on different screen sizes
- Verify search functionality across all content types
- Test date filtering with various BC/AD combinations
- Ensure detail views display correctly on mobile and desktop
- Check that biblical references link properly to bible.com

## Data Management

### Biblical Accuracy
- All events based on King James Version (KJV) biblical sources
- Dates follow traditional biblical chronology
- References include specific book, chapter, and verse citations
- Historical context includes geographic and cultural information

### Date Handling
- BC dates stored as negative numbers internally
- AD dates stored as positive numbers
- Support for date ranges (e.g., "4004-2348 BC", "6 BC-60 AD")
- Advanced date parsing for filtering and search

### Content Relationships
- Events link to participants and locations
- People link to family relationships and participated events
- Regions connect to notable people and historical periods
- Cross-references maintain data integrity

## Performance Considerations
- Efficient search with relevance scoring
- Lazy loading of detailed content
- Optimized bundle size with Next.js build optimization
- Responsive images and content loading
- Smart scrolling to reduce unnecessary navigation

## Accessibility Features
- Semantic HTML structure
- Keyboard navigation support
- Screen reader compatible
- High contrast text and backgrounds
- Touch-friendly mobile interface
- Clear visual hierarchy and typography

## Browser Support
- Modern browsers with ES6+ support
- Mobile browsers (iOS Safari, Chrome Mobile)
- Desktop browsers (Chrome, Firefox, Safari, Edge)
- Progressive enhancement for older browsers

