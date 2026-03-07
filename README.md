# GrootMade Connect

[![GitHub license](https://img.shields.io/github/license/GrootMade/connect)](https://github.com/GrootMade/connect/blob/main/LICENSE)
[![GitHub issues](https://img.shields.io/github/issues/GrootMade/connect)](https://github.com/GrootMade/connect/issues)
[![GitHub stars](https://img.shields.io/github/stars/GrootMade/connect)](https://github.com/GrootMade/connect/stargazers)
[![Crowdin](https://badges.crowdin.net/grootmade/localized.svg)](https://crowdin.com)

Connect your site to GrootMade and manage plugins, themes, template kits, installs, updates, collections, and workflow settings from one place.

GrootMade Connect is the official site-side plugin for the GrootMade platform. It is built to make asset discovery, installation, updates, organization, and day-to-day workflow easier to manage inside a connected environment.

---

## Table of contents

- [Overview](#overview)
- [Why GrootMade Connect](#why-grootmade-connect)
- [Key highlights](#key-highlights)
- [Features](#features)
- [Typical use cases](#typical-use-cases)
- [Who it is for](#who-it-is-for)
- [Requirements](#requirements)
- [Installation](#installation)
- [Getting started](#getting-started)
- [Development](#development)
- [Architecture](#architecture)
- [Tech stack](#tech-stack)
- [Environment configuration](#environment-configuration)
- [Branch strategy](#branch-strategy)
- [Roadmap direction](#roadmap-direction)
- [Contributing](#contributing)
- [Support](#support)
- [Important note on names and references](#important-note-on-names-and-references)
- [Disclaimer](#disclaimer)
- [License](#license)

---

## Overview

Managing site assets manually gets messy fast.

Teams and builders often end up repeating the same tasks over and over again:
- searching for the right assets
- installing the same tools on multiple sites
- checking which items are active
- handling updates one by one
- organizing favorites and requests in separate places
- exposing the wrong functionality to the wrong user roles

GrootMade Connect is built to reduce that friction.

It creates a more direct connection between your site and the GrootMade platform so you can work from a cleaner, faster, more centralized workflow.

The core idea is simple:

**connect your site, reduce overhead, and keep moving.**

---

## Why GrootMade Connect

GrootMade Connect exists because day-to-day site operations often become more fragmented than they need to be.

Instead of juggling scattered tools, separate workflows, manual installs, and repeated update checks, GrootMade Connect brings those actions closer together inside a connected interface.

That means less context switching, less repetitive work, and a more practical way to handle site assets over time.

---

## Key highlights

- Browse a large asset catalog from one connected place
- Install items directly from the dashboard
- Configure automatic updates with flexible scheduling
- Organize assets into collections
- Control access by user role
- Submit requests for assets not yet available
- White-label the plugin for custom environments
- Use translation-ready language files with Crowdin integration

---

## Features

## Asset discovery and organization

GrootMade Connect helps users discover and organize assets more efficiently.

### Included capabilities
- Browse a large catalog of plugins, themes, and template kits
- Search instantly with Typesense-powered search
- Filter and find items faster
- Organize favorites into collections
- Keep frequently used assets easier to access
- Request items that are not yet available in the catalog

## Installation and updates

A connected workflow should make routine tasks easier, not slower.

### Included capabilities
- Install items directly from the dashboard
- Reduce manual installation steps
- Configure automatic update schedules
- Set per-item update preferences
- Keep update workflows more controlled and predictable

## Workflow and access control

Different users need different levels of access.

### Included capabilities
- Restrict plugin access by role
- Support cleaner client and team workflows
- Reduce clutter for users who do not need advanced actions
- Keep operational controls more focused

## Branding and localization

GrootMade Connect is designed to be flexible in different environments.

### Included capabilities
- White-label through `.env` configuration
- Customize visual brand elements
- Adjust naming and presentation settings
- Use translation-ready files with Crowdin integration

---

## Typical use cases

## Single-site workflow

A site owner connects one site, browses the catalog, installs what they need, organizes favorites into collections, and keeps updates under control from one place.

## Freelancer workflow

A freelancer uses GrootMade Connect across multiple client environments, requests missing items, manages collections, and keeps update settings consistent.

## Agency workflow

A team uses role controls and white-label settings to create a cleaner experience for internal users or clients while maintaining access to shared asset workflows.

## Operational workflow

A technical user uses the connected interface to reduce repetitive install and update tasks, keeping the workflow faster and more centralized.

---

## Who it is for

GrootMade Connect is built for:

- freelancers
- developers
- agencies
- technical site owners
- teams managing multiple sites and workflows

It is especially useful for users who want a cleaner and more repeatable process around asset discovery, installation, updates, and access control.

---

## Requirements

| Requirement | Version |
|-------------|---------|
| PHP         | 7.4+    |
| Node.js     | 18+     |
| npm         | 9+      |

Additional environment requirements may vary depending on the way the plugin is built, deployed, or connected to the GrootMade platform.

---

## Installation

## From a release

1. Download `grootmade.zip` from the [stable branch](https://github.com/GrootMade/connect/tree/stable).
2. In your site dashboard, go to **Plugins → Add New → Upload Plugin**.
3. Select the ZIP file and click **Install Now**.
4. Activate the plugin.
5. Open GrootMade Connect and complete the connection flow.

## Via FTP

1. Extract `grootmade.zip` on your local machine.
2. Upload the extracted folder to `/wp-content/plugins/`.
3. Go to **Plugins → Installed Plugins** and activate the plugin.
4. Open GrootMade Connect and complete the connection flow.

## From source

~~~bash
git clone https://github.com/GrootMade/connect.git wp-content/plugins/grootmade
cd wp-content/plugins/grootmade
cp .env.example .env
npm install
composer install
npm run build
# or
npm start
~~~

Then activate the plugin from **Plugins → Installed Plugins** and continue with the connection flow.

---

## Getting started

After activation:

1. Open **GrootMade Connect**
2. Connect your site to your GrootMade account
3. Browse available assets
4. Install or update the items you need
5. Organize favorites into collections
6. Configure roles, branding, and update preferences
7. Use requests when an item is not yet available

### Recommended first steps

For a clean setup, start with this order:

1. confirm connection status  
2. review branding and environment settings  
3. configure role access  
4. test installation flow  
5. review update preferences  
6. create your first collection  

---

## Development

## Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Start the Vite development server with HMR |
| `npm run build` | Create a production build in `build/` |
| `npm run deploy` | Build and copy output to `deploy/` |
| `npm run dist` | Build and create a distributable ZIP in `dist/` |
| `npm run format` | Format code with Prettier |
| `npm run lint` | Lint code with ESLint |
| `npm test` | Run format and lint checks |

## Local development flow

A typical local development flow looks like this:

~~~bash
git clone https://github.com/GrootMade/connect.git wp-content/plugins/grootmade
cd wp-content/plugins/grootmade
cp .env.example .env
npm install
composer install
npm start
~~~

For a production-style local build:

~~~bash
npm run build
~~~

For a packaged distributable:

~~~bash
npm run dist
~~~

---

## Architecture

The plugin combines a PHP backend with a React-based SPA frontend.

- **PHP** handles backend integration, bootstrapping, REST endpoints, install/update logic, and environment constants.
- **React** powers the connected dashboard experience.
- **Vite** is used for fast local development and build output.
- **Typesense** supports the search experience.
- **Environment-based configuration** controls branding, identity, and endpoint behavior.

---

## Project structure

~~~text
├── includes/src/         # PHP backend (PSR-4 autoloaded under Grootmade\)
│   ├── api/              # REST API endpoints
│   ├── Admin.php         # Admin integration
│   ├── AutoUpdate.php    # Scheduled auto-update logic
│   ├── Constants.php     # Build-injected constants from .env
│   ├── Helper.php        # Engine API proxy
│   ├── Installer.php     # Theme/plugin installer
│   ├── RestAPI.php       # REST route registration
│   └── ViteAssets.php    # Dev/prod asset loading
├── src/                  # React SPA frontend
│   ├── pages/            # File-based routing
│   ├── components/       # UI components
│   ├── hooks/            # React Query hooks
│   ├── lib/              # Utilities and i18n wrapper
│   ├── types/            # TypeScript definitions
│   └── zod/              # Validation schemas
├── .env.example          # Environment template
├── .env.stable           # Stable release configuration
├── plugin.php            # Plugin entry point
└── vite.config.ts        # Vite configuration
~~~

---

## Tech stack

### Frontend
- React 18
- TypeScript
- Tailwind CSS
- shadcn/ui
- Radix UI
- React Router
- TanStack Query
- TanStack Table
- react-hook-form
- Zod
- Typesense InstantSearch
- Recharts

### Backend
- PHP 7.4+
- REST API
- PSR-4 autoloading

### Build and tooling
- Vite
- ESLint
- Prettier
- Husky

---

## Environment configuration

The `.env` file controls build and runtime configuration.

It can be used to define:
- plugin identity
- branding
- namespaces
- external API endpoints
- search configuration
- white-label settings

See `.env.example` for all available options.

## Key variables

- `SLUG` / `NAME` / `NAMESPACE` — Plugin identity
- `ENGINE_URL` — External API endpoint
- `WHITELABEL` — Enable or disable white-label mode (`1` / `0`)
- `LOGO_LIGHT` / `LOGO_DARK` — Branding assets
- `TYPESENSE_*` — Search configuration

## Notes on configuration

Because configuration is environment-driven, changes to branding and identity can affect both build behavior and presentation. Keep environment settings consistent across development, staging, and production where possible.

---

## Branch strategy

| Branch | Purpose |
|--------|---------|
| `main` | Active development |
| `stable` | Latest production release |
| `beta-release` | Beta releases |

If your release process evolves, this section can also be extended with tagging, release channels, and CI notes.

---

## Roadmap direction

The direction of GrootMade Connect is centered around:

- smoother connected workflows
- faster discovery and installation
- better update handling
- cleaner collections and organization
- stronger role-based access control
- improved white-label flexibility
- better asset visibility and usability
- continued refinement of the connected dashboard experience

---

## Contributing

We welcome legitimate contributions.

Before contributing, please review:
- repository structure
- coding conventions
- linting and formatting expectations
- issue and pull request scope

If a dedicated contribution guide is available, read [CONTRIBUTING.md](CONTRIBUTING.md) before submitting changes.

---

## Support

If you encounter an issue or have a question, please [open an issue](https://github.com/GrootMade/connect/issues).

For broader platform-related information, use the official GrootMade channels:
- Website: https://grootmade.com
- Community: https://meta.grootmade.com
- Pricing: https://grootmade.com/pricing

---

## Important note on names and references

GrootMade is an independent platform.

References to third-party product names, brands, trademarks, compatibility notes, or related identifiers may be used for descriptive, informational, or compatibility purposes only where relevant.

Such references do **not** imply affiliation, sponsorship, endorsement, or official connection unless explicitly stated otherwise.

---

## Disclaimer

GrootMade is an independent platform and all products distributed through GrootMade are presented as forks.

These products may be renamed, repackaged, reorganized, or otherwise adapted for platform use, operational consistency, compatibility handling, or compliance-related presentation.

GrootMade is **not affiliated with, endorsed by, sponsored by, or officially connected to** the original developers, authors, publishers, companies, trademark owners, or rights holders of any referenced third-party products, unless explicitly stated otherwise.

GrootMade is **not affiliated with, endorsed by, sponsored by, or officially connected to WordPress, the WordPress Foundation, WooCommerce, or any related trademark owner**, unless explicitly stated otherwise.

References to third-party names, trademarks, brands, logos, product titles, or compatibility notes are used strictly for descriptive, identification, informational, or compatibility purposes only.

No such reference should be understood as implying endorsement, partnership, sponsorship, or official association.

---

## License

This project is licensed under the GNU General Public License v3.0. See the [LICENSE](LICENSE) file for details.