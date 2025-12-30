# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.1] - 2025-12-30

### Added
- Tabbed admin interface (Settings, Copy Statistics, Guide tabs in one page)
- Inline code (`<code>` tag) support with copy button
- New application mode: "Inline code only" for `<code>` tags
- New application mode: "All code" for both `<pre>` and `<code>` tags
- Guide tab with visual examples showing difference between code types
- FAQ section in Guide tab
- Card-style radio buttons for application mode selection
- How-to instructions for CSS class targeting

### Improved
- Application mode selection UI with descriptive cards
- Settings descriptions are now more specific and beginner-friendly
- Removed technical jargon like "code block" in favor of clearer descriptions
- Admin interface responsive design for mobile devices
- CSS class targeting feature explanation with step-by-step instructions
- Inline copy button styling (smaller, non-intrusive design)

### Changed
- Removed separate submenu pages, consolidated into tabbed interface
- Default application mode renamed from "all" to "pre_only" for clarity

### Fixed
- Clearer explanation of which elements get copy buttons in each mode

## [1.0.0] - 2024-12-09

### Added
- Copy button on code blocks (top-right corner with clipboard icon)
- Automatic programming language detection from code content
- Language label display on code blocks (top-left corner)
- Copy tracking analytics with database storage
- Admin settings page for customization
- Copy statistics page in admin menu
- Customizable background and text colors
- Option to apply only to specific CSS classes
- REST API endpoint for copy tracking
- Support for multiple languages: PHP, JavaScript, TypeScript, Python, HTML, CSS, SQL, Bash, JSON, YAML, XML, Ruby, Go, Java, C#, Markdown
- Tooltip on copy button hover
- Visual feedback on successful copy
- Fallback copy method for older browsers

[1.0.1]: https://github.com/tkashiwazaki/wp-plugin-kashiwazaki-seo-code-clipper/releases/tag/v1.0.1
[1.0.0]: https://github.com/tkashiwazaki/wp-plugin-kashiwazaki-seo-code-clipper/releases/tag/v1.0.0
