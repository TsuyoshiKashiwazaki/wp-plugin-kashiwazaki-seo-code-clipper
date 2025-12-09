=== Kashiwazaki SEO Code Clipper ===
Contributors: tashiwazaki
Tags: code, clipboard, copy, syntax, gutenberg
Requires at least: 5.0
Tested up to: 6.4
Requires PHP: 7.4
Stable tag: 1.0.0
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

Adds a copy-to-clipboard button to WordPress Gutenberg code blocks with automatic language detection and copy tracking analytics.

== Description ==

Kashiwazaki SEO Code Clipper adds a convenient copy button to code blocks in WordPress Gutenberg editor. It automatically detects programming languages and displays labels, while tracking copy statistics for SEO optimization insights.

**Features:**

* Copy button on code blocks (top-right corner)
* Automatic programming language detection and labeling
* Copy tracking analytics for SEO insights
* Customizable background and text colors
* Option to apply only to specific CSS classes

**Supported Languages:**

PHP, JavaScript, TypeScript, Python, HTML, CSS, SQL, Bash, JSON, YAML, XML, Ruby, Go, Java, C#, Markdown, and more.

== Installation ==

1. Upload the plugin folder to `/wp-content/plugins/`
2. Activate the plugin through the 'Plugins' menu in WordPress
3. Go to 'Kashiwazaki SEO Code Clipper' in the admin menu to configure settings

== Frequently Asked Questions ==

= How does language detection work? =

The plugin first checks for CSS classes like `language-php` or `lang-js`. If not found, it analyzes the code content to detect the programming language based on common patterns.

= Can I disable the copy button for specific code blocks? =

Yes. In settings, choose "Specific classes only" mode and specify which CSS classes should have the copy button.

= Where can I see copy statistics? =

Go to 'Kashiwazaki SEO Code Clipper' > 'Copy Statistics' in the WordPress admin menu.

== Screenshots ==

1. Code block with copy button and language label
2. Settings page
3. Copy statistics page

== Changelog ==

= 1.0.0 =
* Initial release
* Copy button functionality
* Automatic language detection
* Copy tracking analytics
* Admin settings page

== Upgrade Notice ==

= 1.0.0 =
Initial release.
