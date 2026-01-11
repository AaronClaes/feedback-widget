# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev        # Start development server
pnpm build      # Type-check and build for production
pnpm lint       # Run ESLint
pnpm preview    # Preview production build
npx tsc --noEmit  # Type-check without emitting
```

## Architecture

This is a React + TypeScript + Vite application using Tailwind CSS v4 and shadcn/ui components.

### Key Technologies
- **React 19** with TypeScript
- **Vite 7** for bundling
- **Tailwind CSS v4** via `@tailwindcss/vite` plugin (no tailwind.config.js)
- **shadcn/ui** with `base-nova` style and `@base-ui/react` primitives
- **@tabler/icons-react** for icons
- **@react-three/fiber** + **three.js** for 3D rendering

### Path Aliases
`@/*` maps to `./src/*` (configured in tsconfig.json and vite.config.ts)

### Project Structure
- `src/components/ui/` - shadcn/ui components (use `npx shadcn add <component>`)
- `src/packages/feedback-widget/` - Embeddable feedback widget (see below)
- `src/lib/utils.ts` - Utility functions including `cn()` for className merging

### Feedback Widget (`src/packages/feedback-widget/`)
Self-contained feedback collection widget with screen capture capabilities:
- `index.tsx` - Main component with all state management and capture logic
- `components/FeedbackDialog/` - Form dialog (type selector, attachments, note textarea)
- `components/FeedbackButton.tsx` - Trigger button with configurable position
- `components/StopRecordingButton.tsx` - Floating button shown during screen recording

Uses browser APIs: `getDisplayMedia` for screen capture, `ImageCapture` for screenshots, `MediaRecorder` for video recording.

### Styling
- CSS variables defined in `src/index.css` with light/dark theme support
- Uses OKLCH color space for theme colors
- Custom font: Outfit (variable weight)
