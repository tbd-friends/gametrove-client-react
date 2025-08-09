# Reference Images

This directory contains visual references for the Gametrove application design and development.

## Directory Structure

### `/design/` - Final Design References
Contains approved design references and layout patterns that should be maintained long-term.

- `dashboard-my-collection-layout.png` - My Collection page layout reference

### `/archive/` - Historical References
Contains older iterations and temporary communication images for historical context.

#### `/archive/layout-iterations/`
Previous layout versions and design iterations that have been resolved or superseded.

#### `/archive/communication/`
Temporary screenshots and images used for debugging/communication with Claude Code.

## Guidelines

### For Final Design References (`/design/`)
- Use descriptive, permanent filenames
- Keep only current, approved designs
- Document purpose in this README when adding new files

### For Temporary/Communication Images
- Use `temp_` or `debug_` prefixes for easy identification
- Place in `/archive/communication/` 
- Clean up regularly after issues are resolved

### For Historical Context (`/archive/`)
- Move resolved design iterations here
- Keep for reference but not active development
- Organize by topic/timeframe

## Naming Conventions

- **Design references**: `component-purpose-description.png`
- **Temporary/debug**: `temp_issue-description.png` or `debug_component-name.png` 
- **Archive**: Keep original names but organize by folder structure

## Git Tracking

- `/design/` - Tracked in git for team reference
- `/archive/communication/` - Excluded from git (see .gitignore)
- Temporary debug images - Excluded from git