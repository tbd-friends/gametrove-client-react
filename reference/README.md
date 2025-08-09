# Reference Images

This directory contains visual references for the Gametrove application design and development.

## Directory Structure

### `/design/` - Final Design References
Contains approved design references and layout patterns that should be maintained long-term.

- `dashboard-my-collection-layout.png` - My Collection page layout reference

### `/temp-communication/` - Active Issue Communication
**✅ TRACKED & ACCESSIBLE TO CLAUDE CODE**
- Current issues being discussed with Claude Code
- Images for active debugging and development
- **Clean up regularly** after issues are resolved

### `/issues/` - Issue-Specific References  
**✅ TRACKED & ACCESSIBLE TO CLAUDE CODE**
- Organized by date and issue topic
- Format: `YYYY-MM-DD-issue-name/`
- Keeps historical context for specific problems and solutions

### `/archive/` - Historical References
**✅ TRACKED & ACCESSIBLE TO CLAUDE CODE**

#### `/archive/layout-iterations/`
Previous layout versions and design iterations that have been resolved or superseded.

#### `/archive/communication/`
Resolved communication images moved from `/temp-communication/`

### `/temp/` - Personal Temporary Files
**❌ IGNORED BY GIT & CLAUDE**
- Personal temporary files not for Claude communication
- Auto-ignored, use for private notes/screenshots

## Workflows

### 🔄 For Active Issue Communication with Claude:
1. **Add image** to `reference/temp-communication/issue-description.png`
2. **Claude can access** and analyze the image immediately  
3. **After resolution**, move to `reference/archive/communication/`
4. **Regular cleanup** to keep temp-communication folder manageable

### 📁 For Detailed Issue Tracking:
1. **Create folder** in `reference/issues/2025-MM-DD-issue-name/`
2. **Add related images** (problem.png, solution.png, etc.)
3. **Keep permanently** for historical development reference

### 🎨 For Permanent Design References:
1. **Add to** `reference/design/` with descriptive names
2. **Update this README** when adding new permanent references
3. **Keep tracked** for team and future development

## Naming Conventions

### Good Examples:
- **Temp communication**: `sidebar-height-issue.png`, `navigation-alignment-problem.png`
- **Issue folders**: `2025-01-09-sidebar-height/`, `2025-01-10-mobile-layout/`
- **Design references**: `dashboard-final-layout.png`, `collection-grid-pattern.png`

### Avoid (Will be ignored):
- `temp_*.png` - Auto-ignored by git
- `debug_*.png` - Auto-ignored by git  
- `*.screenshot.png` - Auto-ignored by git

## Git Tracking Status

- ✅ **TRACKED (Claude accessible)**: `/design/`, `/temp-communication/`, `/issues/`, `/archive/`
- ❌ **IGNORED (Claude cannot access)**: `/temp/`, `temp_*.png`, `debug_*.png`, `*.screenshot.png`

## Current Active References

### Design References:
- `dashboard-my-collection-layout.png` - My Collection page layout pattern

### Active Communication:
- *(Clean - no active issues)*

---

**💡 Tip**: For sharing images with Claude Code, always use the tracked directories (`temp-communication/`, `issues/`, `archive/`) to ensure accessibility.