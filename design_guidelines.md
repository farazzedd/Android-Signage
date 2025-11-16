# Elvision Digital Signage System - Design Guidelines

## Design Approach

**System Selected**: Hybrid approach drawing from **Linear** (for dashboard clarity), **Notion** (for content management), and **Carbon Design** (for enterprise data displays)

**Justification**: Enterprise B2B SaaS tool requiring efficiency, clarity, and professional credibility. The CMS is utility-focused with information-dense interfaces, while the player requires distraction-free full-screen presentation.

---

## Core Design Elements

### A. Typography

**Font Family**: Inter (via Google Fonts CDN)

**Hierarchy**:
- Page titles: text-2xl md:text-3xl, font-semibold
- Section headings: text-xl, font-semibold
- Card/component titles: text-lg, font-medium
- Body text: text-base, font-normal
- Labels/metadata: text-sm, font-medium
- Captions/helper text: text-xs, font-normal

### B. Layout System

**Spacing Primitives**: Tailwind units of 2, 4, 6, and 8 (e.g., p-4, gap-6, mb-8)

**Grid System**:
- Sidebar navigation: fixed w-64
- Main content area: max-w-7xl with px-6 py-8
- Dashboard cards: grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6
- Forms: max-w-2xl for optimal readability

### C. Component Library

#### Navigation
- **Sidebar**: Fixed left navigation (264px) with logo, primary nav items, user profile at bottom
- **Top Bar**: Breadcrumbs, search, notifications, account dropdown on dashboard pages
- **Mobile**: Collapsible hamburger menu with slide-out sidebar

#### Core UI Elements

**Cards**: Rounded corners (rounded-lg), subtle border, p-6, hover:shadow-md transition
- Status indicators: Small badge with dot indicator (online: green, offline: gray)
- Media cards: Aspect ratio containers with thumbnail, title, metadata overlay
- Display cards: Show device name, status, last check-in, assigned playlist

**Buttons**:
- Primary: px-6 py-3, rounded-lg, font-medium
- Secondary: px-6 py-3, rounded-lg, border-2
- Icon buttons: p-2, rounded

**Forms**:
- Input fields: px-4 py-3, rounded-lg, border, focus ring
- Labels: mb-2, font-medium
- Helper text: text-sm below inputs
- File uploads: Drag-and-drop zone with dashed border, center-aligned upload icon and text

**Tables**:
- Zebra striping for row differentiation
- Sticky headers on scroll
- Sortable column headers with sort indicators
- Action buttons/dropdowns in right-most column
- Pagination at bottom

#### Data Displays

**Dashboard Stats**: Grid of stat cards showing key metrics (total displays, active playlists, storage used)
- Large number: text-3xl font-bold
- Label: text-sm
- Optional trend indicator: small arrow with percentage

**Media Library**: Grid view (default) with list view toggle
- Grid: 4 columns on desktop, responsive down to 1
- Thumbnails: Aspect ratio 16:9, object-cover
- Overlay on hover: Edit, Delete, Preview actions

**Playlist Builder**: 
- Two-column layout: Media library (left) + Playlist items (right)
- Drag-and-drop reordering with visual indicators
- Duration badges on images
- Remove buttons on playlist items

**Schedule Calendar**: 
- Week/month view toggle
- Color-coded playlist assignments
- Click to add/edit schedule blocks
- Timeline view showing display schedules

#### Overlays

**Modals**: Centered, max-w-2xl, rounded-xl, with backdrop blur
- Header with close button
- Content area with p-6
- Footer with action buttons (right-aligned)

**Toasts**: Fixed top-right, slide-in animation, auto-dismiss
- Success, error, warning, info variants
- Icon + message + optional action

**Invite Code Display**: Modal with large, prominent code display (text-4xl, font-mono, tracking-wider, center-aligned)

#### Player Interface

**Full-Screen Media Player**:
- Completely chromeless during playback
- Invite code screen: Centered card with logo, input field, submit button
- Loading states: Centered spinner
- Error states: Centered message with retry button
- No visible controls during normal operation

### D. Animations

**Minimal and Purposeful**:
- Card hover: shadow transition (200ms)
- Modal enter/exit: fade + scale (300ms)
- Toast slide-in: translate (250ms)
- Drag-and-drop: visual lift effect
- Loading spinners: smooth rotation

**No scroll animations, parallax, or decorative motion**

---

## Page-Specific Layouts

### Login Page
- Centered card (max-w-md)
- Elvision logo at top
- Email/password inputs
- "Remember me" checkbox
- Primary action button (full width)
- Clean, minimal background

### Dashboard (Admin/Client)
- Sidebar navigation (always visible on desktop)
- Top bar with breadcrumbs and user menu
- Hero stats row (3-4 cards showing key metrics)
- Main content grid with recent displays, media uploads, schedules

### Displays Management
- Table view of all displays with columns: Name, Status, Last Check-in, Assigned Playlist, Actions
- "Generate Invite Code" button (top-right)
- Filter/search bar above table
- Click row to view display details

### Media Library
- Grid/list view toggle (top-right)
- Upload button (primary, top-right)
- Filter by type (images/videos) and search
- Pagination for large libraries
- Click thumbnail to preview, show metadata, edit, or delete

### Playlist Builder
- Split view: Available media (left 40%) | Current playlist (right 60%)
- Drag media from left to right
- Reorder playlist items with drag handles
- Set image duration inline
- Save/Cancel buttons (sticky footer)

### Scheduling
- Display selector dropdown
- Calendar/timeline view
- "Add Schedule" button opens modal with datetime picker, playlist selector, recurrence options

### Player (Android TV Web App)
- **Invite Code Entry**: Fullscreen centered form with 6-digit code input
- **Playback Mode**: Completely full-screen, no UI chrome
- **Offline/Error States**: Centered message with simple retry option

---

## Accessibility

- All interactive elements have focus states (ring-2)
- Proper label associations for all form inputs
- Keyboard navigation support throughout
- Alt text for all media thumbnails
- ARIA labels for icon-only buttons
- Sufficient contrast ratios maintained

---

## Images

**CMS Dashboard**: No hero images needed - focus on data clarity and functional UI

**Player Interface**: No decorative images - pure content display (user-uploaded media only)

**Login Page**: Optional subtle background pattern or gradient, but keep minimal to emphasize form