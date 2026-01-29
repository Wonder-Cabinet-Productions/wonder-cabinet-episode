# Wonder Cabinet

<p align="center">
  <img src="assets/images/logo-primary-wordmark-dark-bg-800w.png" alt="Wonder Cabinet Logo" width="400">
</p>

<p align="center">
  <em>A custom Ghost theme for the Wonder Cabinet podcast</em><br>
  <strong>From the creators of <em>To The Best Of Our Knowledge</em></strong>
</p>

---

## About Wonder Cabinet

Wonder Cabinet is a podcast that embodies the spirit of a "cabinet of curiosities"—an exploratory, otherworldly journey through ideas that spark wonder. The brand identity, designed by [Art & Sons](https://artandsons.com), features a distinctive cabinet icon with a cosmic spiral, representing the show's blend of intellectual curiosity and cosmic exploration.

This theme translates that vision into a fully functional Ghost CMS experience, purpose-built for podcast publishing with WaveSurfer.js audio playback, brand-compliant design, and seamless integration with major podcast platforms.

## Features

- **WaveSurfer.js Audio Player** — Custom waveform visualization with brand colors, skip controls, and time display
- **Brand-Compliant Design System** — CSS variables implementing the full Art & Sons brand guide
- **Responsive Layout** — Mobile-first design optimized for all screen sizes
- **Ghost 5.0+ Compatibility** — Built on `@tryghost/shared-theme-assets` v2
- **Podcast Service Integration** — Apple Podcasts, Spotify, and YouTube Music links
- **Custom Components** — Bracket buttons, wave dividers, galaxy backgrounds, and cabinet illustrations

## Development Credits

| Role | Contributor |
|------|-------------|
| **Brand Design** | [Art & Sons](https://artandsons.com) |
| **Wireframes** | Art & Sons |
| **Human Developer** | Mark Riechers (project lead, creative direction) |
| **AI Development Partner** | Claude (Anthropic) |

---

## Development Methodology

This theme was developed using a **component-by-component wireframe-to-code methodology** with systematic auditing at each stage. This approach represents a case study in human-AI collaborative development for design-driven projects.

### Component-by-Component Workflow

Each wireframe component was treated as an isolated implementation unit:

1. **Navbar** — Centered logo with responsive menu and wave divider
2. **Home Hero** — Galaxy background with headline typography
3. **Episode List** — Card layout with green left border and bracket-style buttons
4. **Email CTA** — Signup form flanked by decorative bracket graphics
5. **Footer** — Cabinet illustration with social links
6. **Audio Player Hero** — WaveSurfer.js integration with custom controls
7. **Tag Archive** — Header with galaxy background and episode count
8. **Pagination** — Numbered navigation with bracket styling

Each component was built to match wireframe specifications exactly before integration with the larger layout. This isolation allowed for precise CSS implementation and easier debugging when visual discrepancies arose.

### Structured Audit Prompts

Each component audit was conducted using formally structured prompts that defined:

- **Agent role** — A specialized role definition (e.g., "spectral-engineer" for Ghost theme rendering)
- **Context block** — Codebase location, brand authority documents, approved values
- **Phased responsibilities** — Systematic verification steps with explicit deliverables
- **Considerations** — Edge cases, platform constraints, and scope boundaries

This prompt engineering approach ensured consistent, repeatable audits across diverse components. For example, the brand color audit systematically searched for every hex value, `rgba()` call, and named color in the CSS, cross-referencing each against the three-color brand palette.

### Visual Auditing Process

After initial implementation, each component underwent a visual audit against the original wireframe:

- **Pixel-level comparison** — Screenshots overlaid with wireframe reference
- **Spacing verification** — Margins and padding checked against design specifications
- **Typography audit** — Font sizes, weights, line heights, and letter-spacing validated
- **Color compliance** — Hex values verified against brand palette (only `#10A544`, `#000000`, `#FFFAEB`, and derived `#043013` allowed)
- **Responsive behavior** — Breakpoint testing to ensure mobile layouts matched design intent

Deviations were documented in commit messages and corrected systematically. This audit loop often revealed subtle issues—a 2px margin difference, incorrect letter-spacing, or a color that appeared correct but used the wrong hex value. Comments like "Figma spec: Episode Notes green" flagged instances where eyedropped mockup colors (`#31B15B`) differed from the actual brand palette (`#10A544`).

### Brand Compliance Auditing

A comprehensive CSS audit was conducted against the brand guide specifications:

| Element | Brand Spec | CSS Variable |
|---------|------------|--------------|
| Primary Green | `#10A544` | `--wc-green` |
| Black | `#000000` | `--wc-black` |
| Cream | `#FFFAEB` | `--wc-cream` |
| Dark Green | `#043013` | `--wc-dark-green` |
| Headline Font | Futura → Jost | `--font-heading` |
| Body Font | Adobe Garamond → EB Garamond | `--font-body` |

The brand guide specified Futura and Adobe Garamond, which are commercial fonts. The theme uses Jost and EB Garamond as open-source alternatives loaded via Google Fonts—visually similar but freely available.

WCAG-compliant color derivatives were generated for interactive states (hover, focus) and accessibility requirements.

### Multi-Agent Coordination

The project employed specialized AI agents for different audit domains:

| Agent Role | Responsibility |
|------------|----------------|
| `spectral-engineer` | Ghost platform mechanics, CSS cascade, template rendering |
| `wonder-cabinet-designer` | Design fidelity against wireframes |
| `adhd-friendly-ui-designer` | Accessibility, cognitive load, responsive behavior |
| `code-troubleshooter` | Scope validation, over-engineering detection |

Each agent received the same structured prompt format but focused on its domain. The comprehensive theme audit coordinated all agents to produce a phased action plan covering: critical foundations, responsive alignment, design fidelity, Ghost feature integration, and polish.

### Human-AI Collaboration Model

The development process followed an iterative cycle that leveraged the strengths of both human and AI contributors:

**Human responsibilities:**
- Creative direction and design judgment calls
- Visual review against wireframes
- Subjective decisions about "feel" and polish
- Project prioritization and scope definition
- Final approval of each component

**AI responsibilities:**
- Code implementation from specifications
- Systematic CSS audits against brand guide
- Documentation generation and maintenance
- Pattern recognition across similar components
- Identifying edge cases and potential issues

The workflow followed a consistent pattern: **implement → review → refine → commit**. The human provided direction and visual QA; the AI executed implementations and performed systematic verification. This division allowed rapid iteration while maintaining high design fidelity.

### Lessons Learned

1. **Isolation reduces complexity** — Building components in isolation before integration revealed issues earlier and made debugging tractable.

2. **Systematic auditing catches drift** — Without explicit audits against source specifications, small deviations accumulate into significant departures from the design.

3. **Documentation enables iteration** — Comprehensive `CLAUDE.md` and supporting docs allowed the AI to maintain context across sessions and components.

4. **Visual QA remains human** — While AI can verify hex values and spacing numbers, human judgment was essential for "Does this feel right?" decisions.

5. **Prompt engineering is infrastructure** — Well-structured audit prompts with explicit context, phased responsibilities, and documented considerations enabled consistent quality across sessions.

---

## Quick Start

### Prerequisites

- Node.js 18+
- A running Ghost instance (5.0+)

### Installation

```bash
# Clone or copy the theme to your Ghost themes directory
cd your-ghost/content/themes/
git clone <repository-url> wonder-cabinet-episode

# Install dependencies
cd wonder-cabinet-episode
npm install
```

### Development

```bash
# Start Gulp watch with livereload
npm run dev

# One-time build (CSS + JS)
npx gulp build

# Run GScan theme validation
npm run test

# Create distribution archive
npm run zip
```

### Configuration

In Ghost Admin → Settings → Design:

1. Set the **background color** (default: `#000000`)
2. Add **podcast service links** (Apple, Spotify, YouTube Music)
3. Configure **email signup text** for the CTA section
4. Add **social media links** as needed

---

## Documentation

| Document | Description |
|----------|-------------|
| [Brand Guide](docs/wonder-cabinet/brand-guide.md) | Colors, typography, logo usage |
| [Ghost Theme Reference](docs/GHOST_THEME_REFERENCE.md) | Ghost theming fundamentals |
| [Handlebars Helpers](docs/HANDLEBARS_HELPERS.md) | Template helper reference |
| [Audio Player Integration](docs/AUDIO_PLAYER_INTEGRATION.md) | WaveSurfer.js setup |
| [Development Workflow](docs/DEVELOPMENT_WORKFLOW.md) | Build process and tooling |
| [Package.json Config](docs/PACKAGE_JSON_CONFIG.md) | Custom settings reference |

---

## Project Structure

```
wonder-cabinet-episode/
├── assets/
│   ├── built/           # Compiled CSS/JS (committed)
│   ├── css/             # Source CSS
│   ├── images/          # Brand assets
│   └── js/              # Source JS (audio player)
├── docs/                # Technical documentation
│   └── wonder-cabinet/  # Brand guide
├── partials/
│   ├── components/      # UI components (navbar, footer, etc.)
│   └── *.hbs            # Shared partials
├── *.hbs                # Page templates
├── package.json         # Theme metadata and config
└── gulpfile.js          # Build configuration
```

---

## License

MIT License — see [package.json](package.json) for details.

---

<p align="center">
  <em>Built with curiosity by humans and AI</em>
</p>
