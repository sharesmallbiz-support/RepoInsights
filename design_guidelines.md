# GitHub Repository Analysis Tool - Design Guidelines

## Design Approach
**Design System Approach**: Using a data-focused design system optimized for analytics dashboards and developer tools. Drawing inspiration from Linear, GitHub's interface, and Vercel's clean aesthetic for technical products.

## Core Design Elements

### A. Color Palette
**Dark Mode Primary** (default):
- Background: 12 8% 6% (deep dark gray)
- Surface: 220 13% 9% (slightly blue-tinted dark)
- Primary: 220 100% 60% (GitHub blue)
- Accent: 142 76% 36% (GitHub green for positive metrics)
- Text: 0 0% 95% (near white)
- Muted: 215 20% 65% (subtle gray-blue)

**Light Mode**:
- Background: 0 0% 98%
- Surface: 0 0% 100%
- Primary: 220 100% 50%
- Accent: 142 76% 28%
- Text: 0 0% 9%

### B. Typography
- **Primary**: Inter (via Google Fonts CDN)
- **Code/Metrics**: JetBrains Mono for numbers and repository names
- **Headers**: Inter Bold (font-bold)
- **Body**: Inter Regular (font-normal)
- **Metrics**: Inter Semi-bold (font-semibold) for key statistics

### C. Layout System
**Spacing Units**: Tailwind units of 2, 4, 6, 8, and 12
- Container padding: p-6 or p-8
- Section margins: mb-8 or mb-12
- Component spacing: gap-4 or gap-6
- Card padding: p-6

### D. Component Library

**Dashboard Layout**:
- Clean header with URL input and analysis controls
- Grid-based metrics cards (3-4 per row on desktop)
- Full-width timeline charts and visualizations
- Sidebar navigation for switching between repo/org/user views

**Metric Cards**:
- Rounded corners (rounded-lg)
- Subtle borders in dark mode
- Large metric numbers with descriptive labels
- Small trend indicators (arrows/percentages)
- Color-coded based on performance (green/yellow/red)

**Charts & Visualizations**:
- Minimal, clean chart styling
- Consistent color palette across all graphs
- Subtle grid lines and axis labels
- Interactive hover states with tooltips

**Forms & Inputs**:
- Dark mode compatible input styling
- GitHub URL validation with real-time feedback
- Loading states with subtle animations
- Export buttons with download icons

### E. Navigation & Information Architecture

**Main Sections**:
1. **Overview Dashboard** - Key DORA metrics and health score
2. **Repository Analysis** - Commit patterns, code churn, file changes
3. **Contributors** - Individual developer statistics and collaboration
4. **Timeline View** - Historical trends and activity patterns
5. **Health Assessment** - Risk indicators and recommendations

**Data Presentation**:
- Emphasize key numbers with large, bold typography
- Use consistent iconography for different metric types
- Group related metrics in logical card layouts
- Provide contextual explanations for complex metrics

### F. Responsive Design
- Mobile-first approach with collapsible navigation
- Stacked metric cards on smaller screens
- Horizontal scroll for wide charts on mobile
- Touch-friendly interactive elements

## Visual Treatment Notes
- Maintain professional, developer-focused aesthetic
- Use subtle shadows and borders rather than heavy visual elements
- Consistent spacing and alignment throughout
- High contrast for accessibility in both modes
- Minimal animations - focus on data clarity over visual flourishes