=== Kashiwazaki SEO Code Clipper ===
Contributors: tkashiwazaki
Tags: code, clipboard, copy, syntax, gutenberg, inline-code
Requires at least: 5.0
Tested up to: 6.7
Requires PHP: 7.4
Stable tag: 1.0.1
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

Adds a copy-to-clipboard button to code blocks and inline code in WordPress with automatic language detection and copy tracking analytics.

== Description ==

Kashiwazaki SEO Code Clipper adds a convenient copy button to code blocks and inline code in WordPress. It automatically detects programming languages and displays labels, while tracking copy statistics for SEO optimization insights.

= Features =

* **Copy button for code blocks** - Adds a copy button to `<pre>` code blocks (top-right corner)
* **Copy button for inline code** - Adds a copy button to `<code>` inline code elements
* **Automatic language detection** - Detects programming languages and displays labels
* **Copy tracking analytics** - Track which code is copied most frequently
* **Tabbed admin interface** - Settings, Copy Statistics, and Guide tabs in one page
* **Customizable colors** - Set background and text colors for code blocks
* **Flexible targeting** - Apply to all code, specific types, or custom CSS classes

= Application Modes =

Choose which elements get copy buttons:

1. **Multi-line code only (`<pre>` tag)** - WordPress "Code" blocks and "Preformatted" blocks
2. **Inline code only (`<code>` tag)** - Short code snippets within text
3. **All code (`<pre>` + `<code>` tags)** - Both multi-line and inline code
4. **Specific CSS classes only** - Only elements with specified class names

= Supported Languages =

PHP, JavaScript, TypeScript, Python, HTML, CSS, SQL, Bash, JSON, YAML, XML, Ruby, Go, Java, C#, Markdown, and more.

== Installation ==

1. Upload the plugin folder to `/wp-content/plugins/`
2. Activate the plugin through the 'Plugins' menu in WordPress
3. Go to 'Kashiwazaki SEO Code Clipper' in the admin menu to configure settings

== Frequently Asked Questions ==

= Copy button is not showing on my inline code =

Check the Application Mode setting. If set to "Multi-line code only", inline code won't have copy buttons. Change to "Inline code only" or "All code" mode.

= How do I add copy buttons to specific code blocks only? =

1. Select "Specific CSS classes only" in the Application Mode setting
2. Enter a class name (e.g., `copy-me`)
3. In the block editor, select your code block
4. Open "Advanced" settings in the right sidebar
5. Add the same class name to "Additional CSS class(es)"

= How does language detection work? =

The plugin first checks for CSS classes like `language-php` or `lang-js`. If not found, it analyzes the code content to detect the programming language based on common patterns.

= Where can I see copy statistics? =

Go to 'Kashiwazaki SEO Code Clipper' > 'Copy Statistics' tab in the WordPress admin menu.

== Screenshots ==

1. Code block with copy button and language label
2. Inline code with copy button
3. Settings tab with application modes
4. Copy statistics tab
5. Guide tab with usage instructions

== Changelog ==

= 1.0.1 =
* Added: Tabbed admin interface (Settings, Copy Statistics, Guide)
* Added: Inline code (`<code>` tag) support with copy button
* Added: New application modes - "Inline code only" and "All code"
* Added: Guide tab with visual examples and FAQ
* Improved: Application mode selection with card-style radio buttons
* Improved: Settings descriptions are now more specific and user-friendly
* Improved: Responsive design for admin interface
* Fixed: Clearer explanation of CSS class targeting feature

= 1.0.0 =
* Initial release
* Copy button functionality for code blocks
* Automatic language detection
* Copy tracking analytics
* Admin settings page

== Upgrade Notice ==

= 1.0.1 =
New features: Inline code support, tabbed admin interface, and improved settings. Upgrade recommended for all users.

= 1.0.0 =
Initial release.
