(function() {
    'use strict';

    /**
     * Kashiwazaki SEO Code Clipper - Frontend JavaScript
     * コードブロックにコピーボタンと言語ラベルを追加
     */

    document.addEventListener('DOMContentLoaded', function() {
        initCodeClipper();
    });

    /**
     * コピー機能を初期化
     */
    function initCodeClipper() {
        var codeBlocks = getTargetCodeBlocks();

        codeBlocks.forEach(function(codeBlock) {
            wrapCodeBlock(codeBlock);
        });
    }

    /**
     * 対象のコードブロックを取得
     */
    function getTargetCodeBlocks() {
        var settings = window.ksccSettings || {};
        var targetMode = settings.targetMode || 'all';
        var targetClass = settings.targetClass || '';
        var codeBlocks = [];

        if (targetMode === 'all') {
            // すべてのpreタグを取得（WordPress標準のコードブロック）
            codeBlocks = Array.prototype.slice.call(document.querySelectorAll('pre.wp-block-code, pre.wp-block-preformatted, .wp-block-code pre'));
        } else if (targetMode === 'class' && targetClass) {
            // 指定されたクラスを持つpreタグのみを取得
            var classes = targetClass.split(',').map(function(cls) {
                return cls.trim();
            }).filter(function(cls) {
                return cls.length > 0;
            });

            classes.forEach(function(cls) {
                var elements = document.querySelectorAll('pre.' + cls + ', .' + cls + ' pre');
                Array.prototype.slice.call(elements).forEach(function(el) {
                    if (codeBlocks.indexOf(el) === -1) {
                        codeBlocks.push(el);
                    }
                });
            });
        }

        return codeBlocks;
    }

    /**
     * コードブロックをラッパーで囲み、コピーボタンと言語ラベルを追加
     */
    function wrapCodeBlock(preElement) {
        // 既にラップされている場合はスキップ
        if (preElement.parentNode.classList.contains('kscc-code-wrapper')) {
            return;
        }

        var settings = window.ksccSettings || {};

        // コード内容を取得
        var codeElement = preElement.querySelector('code');
        var codeText = codeElement ? codeElement.textContent : preElement.textContent;

        // 言語を判別
        var language = detectLanguage(preElement, codeText);

        // ラッパー要素を作成
        var wrapper = document.createElement('div');
        wrapper.className = 'kscc-code-wrapper';

        // 言語ラベルを追加（設定で有効な場合）
        if (settings.showLanguageLabel && language) {
            var languageLabel = document.createElement('span');
            languageLabel.className = 'kscc-language-label';
            languageLabel.textContent = language;
            wrapper.appendChild(languageLabel);
        }

        // コピーボタンを作成
        var copyButton = document.createElement('button');
        copyButton.className = 'kscc-copy-button';
        copyButton.type = 'button';
        copyButton.setAttribute('aria-label', settings.copyText || 'コピー');
        copyButton.innerHTML = createCopyIcon();

        // ツールチップを作成
        var tooltip = document.createElement('span');
        tooltip.className = 'kscc-tooltip';
        tooltip.textContent = settings.copyText || 'コピー';
        copyButton.appendChild(tooltip);

        // コピーイベントを設定
        copyButton.addEventListener('click', function(e) {
            e.preventDefault();
            copyToClipboard(preElement, copyButton, tooltip, language);
        });

        // 要素を配置
        preElement.parentNode.insertBefore(wrapper, preElement);
        wrapper.appendChild(copyButton);
        wrapper.appendChild(preElement);
    }

    /**
     * 言語を判別
     */
    function detectLanguage(preElement, codeText) {
        // 1. CSSクラスから言語を取得
        var codeElement = preElement.querySelector('code');
        var classLanguage = getLanguageFromClass(preElement) || (codeElement ? getLanguageFromClass(codeElement) : null);

        if (classLanguage) {
            return classLanguage;
        }

        // 2. コード内容から言語を推測
        return detectLanguageFromContent(codeText);
    }

    /**
     * CSSクラスから言語を取得
     */
    function getLanguageFromClass(element) {
        var classes = element.className.split(' ');

        for (var i = 0; i < classes.length; i++) {
            var cls = classes[i];

            // language-xxx または lang-xxx パターン
            if (cls.indexOf('language-') === 0) {
                return formatLanguageName(cls.substring(9));
            }
            if (cls.indexOf('lang-') === 0) {
                return formatLanguageName(cls.substring(5));
            }
        }

        return null;
    }

    /**
     * コード内容から言語を推測
     */
    function detectLanguageFromContent(code) {
        if (!code || code.trim().length === 0) {
            return null;
        }

        code = code.trim();

        // 言語判別パターン（優先順位順）
        var patterns = [
            // PHP
            {
                name: 'PHP',
                patterns: [/^<\?php/i, /^<\?=/],
                weight: 100
            },
            {
                name: 'PHP',
                patterns: [/\$[a-zA-Z_]\w*/, /->/, /::/],
                minMatches: 2,
                weight: 70
            },
            {
                name: 'PHP',
                patterns: [/function\s+\w+\s*\([^)]*\)\s*\{/, /echo\s+/, /\$this->/],
                weight: 80
            },

            // HTML
            {
                name: 'HTML',
                patterns: [/^<!DOCTYPE\s+html/i, /^<html/i],
                weight: 100
            },
            {
                name: 'HTML',
                patterns: [/<\/?(div|span|p|a|ul|li|table|tr|td|th|form|input|button|header|footer|nav|section|article|aside|main)\b[^>]*>/i],
                weight: 80
            },

            // CSS
            {
                name: 'CSS',
                patterns: [/^@(import|media|keyframes|font-face)\b/, /\{[\s\S]*?[\w-]+\s*:\s*[^;]+;[\s\S]*?\}/],
                weight: 90
            },
            {
                name: 'CSS',
                patterns: [/[\.\#][\w-]+\s*\{/, /:\s*(flex|grid|block|inline|none|absolute|relative|fixed)\s*;/],
                minMatches: 2,
                weight: 70
            },

            // JavaScript / TypeScript
            {
                name: 'TypeScript',
                patterns: [/:\s*(string|number|boolean|any|void|never)\b/, /interface\s+\w+\s*\{/, /<[A-Z]\w*>/],
                minMatches: 1,
                weight: 90
            },
            {
                name: 'JavaScript',
                patterns: [/^(import|export)\s+/, /^const\s+\w+\s*=\s*require\(/m],
                weight: 85
            },
            {
                name: 'JavaScript',
                patterns: [/(const|let|var)\s+\w+\s*=/, /=>\s*\{?/, /function\s*\w*\s*\([^)]*\)\s*\{/],
                minMatches: 2,
                weight: 70
            },
            {
                name: 'JavaScript',
                patterns: [/console\.(log|error|warn|info)\(/, /document\.(getElementById|querySelector|createElement)\(/, /window\./],
                weight: 80
            },

            // Python
            {
                name: 'Python',
                patterns: [/^(from|import)\s+\w+/, /^def\s+\w+\s*\([^)]*\)\s*:/m, /^class\s+\w+.*:/m],
                weight: 90
            },
            {
                name: 'Python',
                patterns: [/if\s+__name__\s*==\s*['"]__main__['"]/, /print\s*\(/, /:\s*$/m],
                minMatches: 2,
                weight: 75
            },

            // SQL
            {
                name: 'SQL',
                patterns: [/^(SELECT|INSERT|UPDATE|DELETE|CREATE|ALTER|DROP)\s+/im],
                weight: 95
            },
            {
                name: 'SQL',
                patterns: [/\bFROM\s+\w+/i, /\bWHERE\s+/i, /\bJOIN\s+/i, /\bGROUP\s+BY\b/i],
                minMatches: 2,
                weight: 80
            },

            // Bash / Shell
            {
                name: 'Bash',
                patterns: [/^#!\/bin\/(bash|sh|zsh)/, /^#!\/usr\/bin\/env\s+(bash|sh|zsh)/],
                weight: 100
            },
            {
                name: 'Bash',
                patterns: [/^\s*\$\s+\w+/, /^(echo|cd|ls|mkdir|rm|cp|mv|chmod|chown|grep|find|cat)\s+/m, /\|\s*(grep|awk|sed|sort|uniq)\b/],
                minMatches: 1,
                weight: 75
            },

            // JSON
            {
                name: 'JSON',
                patterns: [/^\s*\{[\s\S]*"[\w-]+":\s*[\[\{"\d]/],
                weight: 85
            },

            // YAML
            {
                name: 'YAML',
                patterns: [/^[\w-]+:\s*$/m, /^[\w-]+:\s+[\w"'\[{]/m, /^\s+-\s+\w+/m],
                minMatches: 2,
                weight: 70
            },

            // XML
            {
                name: 'XML',
                patterns: [/^<\?xml\s+version/i, /<\/[\w:]+>/],
                weight: 85
            },

            // Ruby
            {
                name: 'Ruby',
                patterns: [/^require\s+['"]/, /^def\s+\w+/, /\bend\s*$/m, /\.each\s+do\s*\|/],
                minMatches: 2,
                weight: 75
            },

            // Go
            {
                name: 'Go',
                patterns: [/^package\s+\w+/, /^import\s+\(/, /^func\s+\w+\s*\(/, /:=\s*/],
                minMatches: 2,
                weight: 80
            },

            // Java
            {
                name: 'Java',
                patterns: [/^(public|private|protected)\s+(class|interface|enum)\s+/, /^import\s+java\./m, /System\.(out|err)\.(println|print)\(/],
                weight: 85
            },

            // C#
            {
                name: 'C#',
                patterns: [/^using\s+System/, /^namespace\s+\w+/, /(public|private|protected)\s+(class|interface|struct)\s+/],
                minMatches: 2,
                weight: 80
            },

            // Markdown
            {
                name: 'Markdown',
                patterns: [/^#{1,6}\s+/, /^\*{3,}$|^-{3,}$/m, /\[.+\]\(.+\)/, /^>\s+/m],
                minMatches: 2,
                weight: 60
            }
        ];

        var bestMatch = null;
        var bestScore = 0;

        for (var i = 0; i < patterns.length; i++) {
            var lang = patterns[i];
            var matchCount = 0;
            var minMatches = lang.minMatches || 1;

            for (var j = 0; j < lang.patterns.length; j++) {
                if (lang.patterns[j].test(code)) {
                    matchCount++;
                }
            }

            if (matchCount >= minMatches) {
                var score = lang.weight * (matchCount / lang.patterns.length);
                if (score > bestScore) {
                    bestScore = score;
                    bestMatch = lang.name;
                }
            }
        }

        return bestMatch;
    }

    /**
     * 言語名をフォーマット
     */
    function formatLanguageName(name) {
        var nameMap = {
            'js': 'JavaScript',
            'javascript': 'JavaScript',
            'ts': 'TypeScript',
            'typescript': 'TypeScript',
            'py': 'Python',
            'python': 'Python',
            'rb': 'Ruby',
            'ruby': 'Ruby',
            'php': 'PHP',
            'html': 'HTML',
            'css': 'CSS',
            'scss': 'SCSS',
            'sass': 'Sass',
            'less': 'Less',
            'json': 'JSON',
            'xml': 'XML',
            'yaml': 'YAML',
            'yml': 'YAML',
            'md': 'Markdown',
            'markdown': 'Markdown',
            'sql': 'SQL',
            'bash': 'Bash',
            'sh': 'Bash',
            'shell': 'Shell',
            'zsh': 'Zsh',
            'go': 'Go',
            'golang': 'Go',
            'java': 'Java',
            'c': 'C',
            'cpp': 'C++',
            'csharp': 'C#',
            'cs': 'C#',
            'swift': 'Swift',
            'kotlin': 'Kotlin',
            'rust': 'Rust',
            'r': 'R',
            'perl': 'Perl',
            'lua': 'Lua',
            'dockerfile': 'Dockerfile',
            'docker': 'Dockerfile',
            'nginx': 'Nginx',
            'apache': 'Apache',
            'vim': 'Vim',
            'powershell': 'PowerShell',
            'ps1': 'PowerShell'
        };

        var lowerName = name.toLowerCase();
        return nameMap[lowerName] || name.charAt(0).toUpperCase() + name.slice(1);
    }

    /**
     * コピーアイコンSVGを作成
     */
    function createCopyIcon() {
        return '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>';
    }

    /**
     * チェックアイコンSVGを作成
     */
    function createCheckIcon() {
        return '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>';
    }

    /**
     * 文字列のMD5ハッシュを計算（簡易版）
     */
    function simpleHash(str) {
        var hash = 0;
        if (str.length === 0) return hash.toString(16);

        for (var i = 0; i < str.length; i++) {
            var char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }

        return Math.abs(hash).toString(16).padStart(8, '0');
    }

    /**
     * クリップボードにコピー
     */
    function copyToClipboard(preElement, button, tooltip, language) {
        // codeタグがある場合はその内容を、なければpreタグの内容を取得
        var codeElement = preElement.querySelector('code');
        var textToCopy = codeElement ? codeElement.textContent : preElement.textContent;

        // Clipboard APIを使用
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(textToCopy).then(function() {
                showCopiedFeedback(button, tooltip);
                trackCopy(textToCopy, language);
            }).catch(function() {
                fallbackCopy(textToCopy, button, tooltip, language);
            });
        } else {
            fallbackCopy(textToCopy, button, tooltip, language);
        }
    }

    /**
     * フォールバックコピー（古いブラウザ用）
     */
    function fallbackCopy(text, button, tooltip, language) {
        var textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-9999px';
        textArea.style.top = '0';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        try {
            document.execCommand('copy');
            showCopiedFeedback(button, tooltip);
            trackCopy(text, language);
        } catch (err) {
            console.error('コピーに失敗しました:', err);
        }

        document.body.removeChild(textArea);
    }

    /**
     * コピー完了フィードバックを表示
     */
    function showCopiedFeedback(button, tooltip) {
        var settings = window.ksccSettings || {};

        // ボタンをコピー完了状態に
        button.classList.add('kscc-copied');
        button.innerHTML = createCheckIcon();
        tooltip.textContent = settings.copiedText || 'コピーしました！';
        button.appendChild(tooltip);

        // 2秒後に元に戻す
        setTimeout(function() {
            button.classList.remove('kscc-copied');
            button.innerHTML = createCopyIcon();
            tooltip.textContent = settings.copyText || 'コピー';
            button.appendChild(tooltip);
        }, 2000);
    }

    /**
     * コピーをトラッキング
     */
    function trackCopy(codeText, language) {
        var settings = window.ksccSettings || {};

        if (!settings.enableCopyTracking || !settings.restUrl || !settings.postId) {
            return;
        }

        var codeHash = simpleHash(codeText);
        var codePreview = codeText.substring(0, 100).replace(/\s+/g, ' ').trim();

        fetch(settings.restUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-WP-Nonce': settings.nonce
            },
            body: JSON.stringify({
                post_id: settings.postId,
                code_hash: codeHash,
                code_preview: codePreview,
                language: language || ''
            })
        }).catch(function(err) {
            // エラーは静かに無視（ユーザー体験に影響しないように）
        });
    }
})();
