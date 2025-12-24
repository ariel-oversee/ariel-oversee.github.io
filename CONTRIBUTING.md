# Contributing to Pooler

Thank you for your interest in contributing to Pooler! This document provides guidelines and information to help you contribute effectively.

## Table of Contents
- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Testing Guidelines](#testing-guidelines)
- [Submitting Changes](#submitting-changes)
- [Feature Requests](#feature-requests)
- [Bug Reports](#bug-reports)

## Code of Conduct

### Our Pledge

We are committed to providing a welcoming and harassment-free experience for everyone. We pledge to:
- Use welcoming and inclusive language
- Be respectful of differing viewpoints
- Accept constructive criticism gracefully
- Focus on what's best for the community
- Show empathy towards other community members

### Unacceptable Behavior

- Harassment, discrimination, or offensive comments
- Trolling or insulting/derogatory comments
- Public or private harassment
- Publishing others' private information
- Other conduct which could reasonably be considered inappropriate

## Getting Started

### Prerequisites

Before you begin, ensure you have:
- A modern web browser (Chrome, Firefox, Safari, or Edge)
- A text editor or IDE (VS Code, Sublime Text, etc.)
- Basic knowledge of HTML, CSS, and JavaScript
- Git installed on your machine
- A GitHub account

### Setting Up Your Development Environment

1. **Fork the Repository**
   - Visit https://github.com/ariel-oversee/ariel-oversee.github.io
   - Click the "Fork" button in the top-right corner
   - This creates a copy of the repository in your GitHub account

2. **Clone Your Fork**
   ```bash
   git clone https://github.com/YOUR-USERNAME/ariel-oversee.github.io.git
   cd ariel-oversee.github.io
   ```

3. **Add Upstream Remote**
   ```bash
   git remote add upstream https://github.com/ariel-oversee/ariel-oversee.github.io.git
   ```

4. **Start Local Server**
   ```bash
   # Option 1: Python
   python -m http.server 8000

   # Option 2: Node.js
   npx serve .

   # Option 3: PHP
   php -S localhost:8000
   ```

5. **Open in Browser**
   - Navigate to `http://localhost:8000`
   - Allow location access when prompted
   - Verify the app loads correctly

### Project Structure

```
ariel-oversee.github.io/
├── index.html              # Main application UI
├── app.js                  # Core application logic
├── backend-sync.js         # Cross-device sync module
├── maps-integration.js     # Map provider abstraction
├── sensor-integration.js   # Advanced detection features
├── service-worker.js       # PWA offline support
├── manifest.json           # PWA manifest
├── README.md               # User-facing documentation
├── POOLER_README.md        # Comprehensive user guide
├── ARCHITECTURE.md         # Technical architecture docs
├── CONTRIBUTING.md         # This file
└── .github/
    └── workflows/          # CI/CD workflows
```

## Development Workflow

### Branching Strategy

We use a feature-branch workflow:

1. **Create a Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

   Branch naming conventions:
   - `feature/` - New features (e.g., `feature/ar-mode`)
   - `fix/` - Bug fixes (e.g., `fix/alert-distance`)
   - `docs/` - Documentation updates (e.g., `docs/api-guide`)
   - `refactor/` - Code refactoring (e.g., `refactor/map-manager`)
   - `test/` - Test additions (e.g., `test/proximity-alerts`)

2. **Make Your Changes**
   - Write clean, readable code
   - Follow our coding standards (see below)
   - Test thoroughly in multiple browsers
   - Update documentation as needed

3. **Commit Your Changes**
   ```bash
   git add .
   git commit -m "Add feature: descriptive commit message"
   ```

   Commit message format:
   ```
   <type>: <short summary>

   <detailed description>

   <optional footer>
   ```

   Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

   Examples:
   ```
   feat: Add AR mode for smart glasses

   Implements WebXR API integration for Apple Vision Pro
   and Meta Quest devices. Adds overlay indicators for
   poop locations in the user's field of view.

   Closes #42
   ```

4. **Push to Your Fork**
   ```bash
   git push origin feature/your-feature-name
   ```

5. **Create a Pull Request**
   - Go to your fork on GitHub
   - Click "New Pull Request"
   - Select your feature branch
   - Fill out the PR template
   - Submit for review

## Coding Standards

### JavaScript Style Guide

We follow a relaxed but consistent style:

**General Principles:**
- Use ES6+ features (classes, arrow functions, template literals)
- Prefer `const` over `let`, avoid `var`
- Use descriptive variable names
- Keep functions small and focused
- Comment complex logic

**Naming Conventions:**
```javascript
// Classes: PascalCase
class PoolerApp { }

// Functions/Methods: camelCase
function addPoopReport() { }

// Constants: UPPER_SNAKE_CASE
const MAX_REPORT_AGE = 30;

// Variables: camelCase
let userLocation = null;

// Private methods: _prefixWithUnderscore
_calculateDistance() { }
```

**Code Organization:**
```javascript
class FeatureName {
    // Constructor first
    constructor() {
        this.property = value;
    }

    // Public methods
    publicMethod() {
        // Implementation
    }

    // Private methods last
    _privateMethod() {
        // Implementation
    }
}
```

**Comments:**
```javascript
// Good: Explain WHY, not WHAT
// Use Haversine formula because it's more accurate for short distances
const distance = this._calculateHaversineDistance(a, b);

// Bad: Stating the obvious
// Calculate the distance
const distance = this._calculateDistance(a, b);
```

### HTML/CSS Standards

**HTML:**
- Use semantic HTML5 elements
- Include appropriate ARIA labels for accessibility
- Keep markup clean and well-indented
- Use descriptive IDs and classes

**CSS:**
- Use consistent indentation (4 spaces)
- Group related properties
- Use CSS variables for colors and common values
- Mobile-first responsive design
- Avoid `!important` unless absolutely necessary

### File Organization

- Keep files under 500 lines when possible
- One major class per file
- Group related functionality together
- Extract reusable utilities to separate files

## Testing Guidelines

### Manual Testing Checklist

Before submitting a PR, test your changes in:

- [ ] Chrome (desktop)
- [ ] Firefox (desktop)
- [ ] Safari (desktop)
- [ ] Chrome (mobile)
- [ ] Safari (iOS)

**Core Functionality:**
- [ ] Map loads and displays correctly
- [ ] Location tracking works
- [ ] Report submission succeeds
- [ ] Proximity alerts trigger at correct distance
- [ ] Settings can be changed and persist
- [ ] Sync works (if applicable)

**Edge Cases:**
- [ ] Location permission denied
- [ ] Offline functionality
- [ ] Invalid coordinates
- [ ] Empty form submission
- [ ] Very old reports (30+ days)

### Performance Testing

- Check load time (should be <3 seconds on 3G)
- Verify smooth map panning/zooming
- Ensure no memory leaks during extended use
- Test with 1000+ reports

### Browser Console

- No JavaScript errors
- No console warnings (except expected ones)
- Proper logging for debugging

## Submitting Changes

### Pull Request Process

1. **Update Documentation**
   - Update README.md if user-facing features changed
   - Update ARCHITECTURE.md if architecture changed
   - Add inline code comments for complex logic

2. **Fill Out PR Template**
   ```markdown
   ## Description
   Brief description of changes

   ## Type of Change
   - [ ] Bug fix
   - [ ] New feature
   - [ ] Breaking change
   - [ ] Documentation update

   ## Testing
   - [ ] Tested in Chrome
   - [ ] Tested in Firefox
   - [ ] Tested in Safari
   - [ ] Tested on mobile

   ## Screenshots
   (If applicable)

   ## Related Issues
   Closes #123
   ```

3. **Wait for Review**
   - Maintainers will review within 3-5 days
   - Address any requested changes
   - Be patient and respectful

4. **Merge Requirements**
   - All review comments addressed
   - No merge conflicts
   - Passes manual testing
   - Documentation updated

### Review Process

**What We Look For:**
- Code quality and readability
- Adherence to coding standards
- Proper error handling
- Browser compatibility
- Performance impact
- Security implications

**Common Review Comments:**
- "Could you add a comment explaining this?"
- "This could be simplified by..."
- "Did you test this in Safari?"
- "We should handle the error case where..."

## Feature Requests

### Proposing New Features

1. **Check Existing Issues**
   - Search for similar feature requests
   - Avoid duplicates

2. **Open a Discussion**
   - Create a GitHub Discussion (not an issue)
   - Describe the problem you're solving
   - Explain your proposed solution
   - Provide use cases

3. **Template for Feature Requests**
   ```markdown
   ## Problem Statement
   What problem does this solve?

   ## Proposed Solution
   How should it work?

   ## Alternatives Considered
   What other approaches did you consider?

   ## Use Cases
   Who would use this and how?

   ## Implementation Ideas
   (Optional) Technical approach
   ```

### Feature Development Process

1. **Discussion & Approval** - Community discusses, maintainer approves
2. **Design** - Create technical design if complex
3. **Implementation** - Develop feature in branch
4. **Review** - PR review by maintainers
5. **Testing** - Thorough testing by community
6. **Merge** - Integration into main branch

## Bug Reports

### Reporting Bugs

1. **Search Existing Issues**
   - Check if bug already reported
   - Add details to existing issue if found

2. **Create Detailed Bug Report**
   ```markdown
   ## Bug Description
   Clear description of the bug

   ## Steps to Reproduce
   1. Go to...
   2. Click on...
   3. See error

   ## Expected Behavior
   What should happen?

   ## Actual Behavior
   What actually happens?

   ## Environment
   - Browser: Chrome 120
   - OS: macOS 14.0
   - Device: Desktop

   ## Screenshots/Logs
   (If applicable)

   ## Additional Context
   Any other relevant information
   ```

3. **Include Console Errors**
   - Open browser DevTools (F12)
   - Check Console tab
   - Copy any error messages

### Bug Fix Process

1. **Reproduce the Bug** - Verify you can reproduce it
2. **Create Fix Branch** - `fix/bug-description`
3. **Implement Fix** - Minimal changes to fix the issue
4. **Add Test Case** - Prevent regression
5. **Submit PR** - Reference original bug report
6. **Verify Fix** - Original reporter confirms fix

## Development Tips

### Debugging

**Enable Verbose Logging:**
```javascript
// In app.js, set at top of file
const DEBUG_MODE = true;

// Then throughout code
if (DEBUG_MODE) {
    console.log('[Debug] User location:', this.userLocation);
}
```

**Test Sync Without Backend:**
```javascript
// Mock sync for testing
this.backendSync = {
    uploadReports: () => Promise.resolve(),
    downloadReports: () => Promise.resolve([])
};
```

**Simulate Different Locations:**
```javascript
// Override geolocation for testing
navigator.geolocation.getCurrentPosition = (success) => {
    success({
        coords: {
            latitude: 40.7128,
            longitude: -74.0060
        }
    });
};
```

### Common Issues

**Service Worker Caching:**
- Clear cache: Application tab > Clear storage
- Or use incognito mode for testing

**Location Permission:**
- Reset in browser settings
- Use HTTPS or localhost (required for geolocation)

**Map Not Loading:**
- Check browser console for errors
- Verify internet connection
- Check API key if using Google Maps

## Community

### Getting Help

- **GitHub Discussions** - General questions, ideas
- **GitHub Issues** - Bug reports, specific problems
- **Pull Requests** - Code review, implementation questions

### Recognition

Contributors are recognized in several ways:
- Listed in CONTRIBUTORS.md
- Mentioned in release notes
- Special recognition for significant contributions

## License

By contributing to Pooler, you agree that your contributions will be licensed under the MIT License.

## Questions?

If you have questions not covered in this guide:
1. Check the [FAQ](https://github.com/ariel-oversee/ariel-oversee.github.io/discussions)
2. Open a GitHub Discussion
3. Reach out to maintainers

Thank you for contributing to Pooler! Together we're building a cleaner, safer community.
