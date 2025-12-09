# Kashiwazaki SEO Code Clipper

![WordPress](https://img.shields.io/badge/WordPress-5.0%2B-blue.svg)
![PHP](https://img.shields.io/badge/PHP-7.4%2B-purple.svg)
![License](https://img.shields.io/badge/license-GPLv2%2B-green.svg)
![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)

Adds a copy-to-clipboard button to WordPress Gutenberg code blocks. Features automatic programming language detection with labels and copy tracking analytics for SEO optimization.

## Features

- Copy button on code blocks (top-right corner)
- Automatic programming language detection and labeling
- Copy tracking analytics for SEO insights
- Customizable background and text colors
- Option to apply only to specific CSS classes

## Supported Languages

PHP, JavaScript, TypeScript, Python, HTML, CSS, SQL, Bash, JSON, YAML, XML, Ruby, Go, Java, C#, Markdown, and more.

## Installation

1. Upload the plugin folder to `/wp-content/plugins/`
2. Activate the plugin through the 'Plugins' menu in WordPress
3. Go to 'Kashiwazaki SEO Code Clipper' in the admin menu to configure settings

## Settings

### Display Settings
- **Background Color**: Default is black (#000000)
- **Text Color**: Default is white (#ffffff)

### Copy Button Scope
- **All code blocks**: Apply to all code blocks
- **Specific classes only**: Apply only to code blocks with specified CSS classes

### Additional Features
- **Language Label**: Show/hide auto-detected language label
- **Copy Tracking**: Enable/disable copy statistics recording

## Copy Statistics

View copy statistics in the admin menu under 'Kashiwazaki SEO Code Clipper' > 'Copy Statistics'.

Statistics include:
- Total copy count
- Number of tracked code blocks
- Per-page and per-code copy counts
- Detected language
- Last copied timestamp

## Requirements

- WordPress 5.0 or higher
- PHP 7.4 or higher

## Changelog

### [1.0.0] - 2025-12-09
- Initial release
- Copy button functionality
- Automatic language detection
- Copy tracking analytics
- Admin settings page

## License

This plugin is licensed under the GPL v2 or later.

## Author

Tsuyoshi Kashiwazaki
- Website: https://www.tsuyoshikashiwazaki.jp
- Profile: https://www.tsuyoshikashiwazaki.jp/profile/
