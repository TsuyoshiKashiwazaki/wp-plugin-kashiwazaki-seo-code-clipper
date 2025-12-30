(function() {
    'use strict';

    /**
     * Kashiwazaki SEO Code Clipper - Frontend JavaScript
     * コードブロックとインラインコードにコピーボタンと言語ラベルを追加
     */

    document.addEventListener('DOMContentLoaded', function() {
        initCodeClipper();
    });

    /**
     * コピー機能を初期化
     */
    function initCodeClipper() {
        var settings = window.ksccSettings || {};
        var targetMode = settings.targetMode || 'pre_only';

        // preタグ（複数行コード）の処理
        if (targetMode === 'pre_only' || targetMode === 'pre_and_code') {
            var preBlocks = getPreBlocks();
            preBlocks.forEach(function(preBlock) {
                wrapPreBlock(preBlock);
            });
        }

        // codeタグ（インラインコード）の処理
        if (targetMode === 'code_only' || targetMode === 'pre_and_code') {
            var inlineCodes = getInlineCodes();
            inlineCodes.forEach(function(codeElement) {
                wrapInlineCode(codeElement);
            });
        }

        // クラス指定モードの処理
        if (targetMode === 'class_only') {
            var targetClass = settings.targetClass || '';
            if (targetClass) {
                var classElements = getElementsByClass(targetClass);
                classElements.forEach(function(element) {
                    if (element.tagName.toLowerCase() === 'pre') {
                        wrapPreBlock(element);
                    } else if (element.tagName.toLowerCase() === 'code' && !isInsidePre(element)) {
                        wrapInlineCode(element);
                    } else if (element.querySelector('pre')) {
                        // 指定クラスを持つ要素内のpreを処理
                        var preElements = element.querySelectorAll('pre');
                        preElements.forEach(function(pre) {
                            wrapPreBlock(pre);
                        });
                    } else if (element.querySelector('code')) {
                        // 指定クラスを持つ要素内のcodeを処理
                        var codeElements = element.querySelectorAll('code');
                        codeElements.forEach(function(code) {
                            if (!isInsidePre(code)) {
                                wrapInlineCode(code);
                            }
                        });
                    }
                });
            }
        }
    }

    /**
     * preタグを取得
     */
    function getPreBlocks() {
        return Array.prototype.slice.call(
            document.querySelectorAll('pre.wp-block-code, pre.wp-block-preformatted, .wp-block-code pre, pre:not(.kscc-processed)')
        ).filter(function(pre) {
            // 既にラップされている場合はスキップ
            return !pre.parentNode.classList.contains('kscc-code-wrapper');
        });
    }

    /**
     * インラインのcodeタグを取得（pre内のcodeは除外）
     */
    function getInlineCodes() {
        return Array.prototype.slice.call(
            document.querySelectorAll('code')
        ).filter(function(code) {
            // pre内のcodeは除外
            if (isInsidePre(code)) {
                return false;
            }
            // 既にラップされている場合はスキップ
            if (code.parentNode.classList.contains('kscc-inline-code-wrapper')) {
                return false;
            }
            return true;
        });
    }

    /**
     * 指定クラスを持つ要素を取得
     */
    function getElementsByClass(classNames) {
        var classes = classNames.split(',').map(function(cls) {
            return cls.trim();
        }).filter(function(cls) {
            return cls.length > 0;
        });

        var elements = [];
        classes.forEach(function(cls) {
            var found = document.querySelectorAll('.' + cls);
            Array.prototype.slice.call(found).forEach(function(el) {
                if (elements.indexOf(el) === -1) {
                    elements.push(el);
                }
            });
        });

        return elements;
    }

    /**
     * 要素がpre内にあるかチェック
     */
    function isInsidePre(element) {
        var parent = element.parentNode;
        while (parent) {
            if (parent.tagName && parent.tagName.toLowerCase() === 'pre') {
                return true;
            }
            parent = parent.parentNode;
        }
        return false;
    }

    /**
     * preブロックをラッパーで囲み、コピーボタンと言語ラベルを追加
     */
    function wrapPreBlock(preElement) {
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
            copyToClipboard(codeText, copyButton, tooltip, language);
        });

        // 要素を配置
        preElement.parentNode.insertBefore(wrapper, preElement);
        wrapper.appendChild(copyButton);
        wrapper.appendChild(preElement);
    }

    /**
     * インラインコードをラッパーで囲み、コピー機能を追加
     */
    function wrapInlineCode(codeElement) {
        // 既にラップされている場合はスキップ
        if (codeElement.parentNode.classList.contains('kscc-inline-code-wrapper')) {
            return;
        }

        var settings = window.ksccSettings || {};
        var codeText = codeElement.textContent;

        // ラッパー要素を作成
        var wrapper = document.createElement('span');
        wrapper.className = 'kscc-inline-code-wrapper';

        // コピーボタンを作成
        var copyButton = document.createElement('button');
        copyButton.className = 'kscc-inline-copy-button';
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
            e.stopPropagation();
            copyToClipboard(codeText, copyButton, tooltip, null);
        });

        // 要素を配置
        codeElement.parentNode.insertBefore(wrapper, codeElement);
        wrapper.appendChild(codeElement);
        wrapper.appendChild(copyButton);
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
            // ===== 最高優先度: Shebang・宣言 (weight 100) =====
            { name: 'PHP', patterns: [/^<\?php/i, /^<\?=/], weight: 100 },
            { name: 'HTML', patterns: [/^<!DOCTYPE\s+html/i], weight: 100 },
            { name: 'XML', patterns: [/^<\?xml\s+version/i], weight: 100 },
            { name: 'Bash', patterns: [/^#!\/bin\/(ba)?sh/, /^#!\/usr\/bin\/env\s+(ba)?sh/], weight: 100 },
            { name: 'Zsh', patterns: [/^#!\/bin\/zsh/, /^#!\/usr\/bin\/env\s+zsh/], weight: 100 },
            { name: 'Python', patterns: [/^#!.*\bpython[23]?\b/], weight: 100 },
            { name: 'Perl', patterns: [/^#!.*\bperl\b/], weight: 100 },
            { name: 'Ruby', patterns: [/^#!.*\bruby\b/], weight: 100 },
            { name: 'Node.js', patterns: [/^#!.*\bnode\b/], weight: 100 },
            { name: 'Lua', patterns: [/^#!.*\blua\b/], weight: 100 },

            // ===== JSON-LD・構造化データ (weight 98-100) =====
            { name: 'JSON', patterns: [/<script[^>]*type\s*=\s*["']application\/ld\+json["'][^>]*>/i], weight: 100 },
            { name: 'JSON', patterns: [/"@context"\s*:/, /"@type"\s*:/], minMatches: 1, weight: 98 },

            // ===== 設定ファイル系 (weight 95-98) =====
            { name: 'Apache', patterns: [/<IfModule[\s>]/, /<\/IfModule>/, /<Directory[\s>]/, /<\/Directory>/, /<Location[\s>]/, /<\/Location>/, /<VirtualHost[\s>]/, /<\/VirtualHost>/, /<Files[\s>]/, /<\/Files>/], minMatches: 1, weight: 98 },
            { name: 'Apache', patterns: [/^\s*RewriteEngine\s+(On|Off)/im, /^\s*RewriteCond\s+/m, /^\s*RewriteRule\s+/m], minMatches: 1, weight: 98 },
            { name: 'Apache', patterns: [/%\{(HTTP_[A-Z_]+|REQUEST_URI|REQUEST_FILENAME|DOCUMENT_ROOT|QUERY_STRING|HTTPS)\}/, /^\s*(Header|SetEnvIf|AddType|Options|AllowOverride|Require)\s+/m], minMatches: 1, weight: 95 },
            { name: 'Nginx', patterns: [/^\s*server\s*\{/m, /^\s*location\s+[~^=]?\s*[\/"']/m, /^\s*upstream\s+\w+\s*\{/m], minMatches: 1, weight: 95 },
            { name: 'Nginx', patterns: [/^\s*(listen|server_name|root|proxy_pass|fastcgi_pass|try_files)\s+/m], minMatches: 2, weight: 90 },
            { name: 'Dockerfile', patterns: [/^FROM\s+[\w.:\/-]+/m, /^(RUN|CMD|ENTRYPOINT|COPY|ADD|WORKDIR|ENV|EXPOSE)\s+/m], minMatches: 2, weight: 98 },
            { name: 'Makefile', patterns: [/^[\w.-]+\s*:\s*[\w\s.-]*$/m, /^\t[\w\$\(\)@-]/, /^\.(PHONY|SUFFIXES)\s*:/m], minMatches: 2, weight: 95 },
            { name: 'Terraform', patterns: [/^\s*(resource|data|variable|output|provider|module)\s+"[\w-]+"/m], minMatches: 1, weight: 95 },
            { name: 'INI', patterns: [/^\s*\[[\w\s.-]+\]\s*$/m, /^\s*[\w.-]+\s*=\s*.+$/m, /^\s*;.*$/m], minMatches: 2, weight: 85 },
            { name: 'TOML', patterns: [/^\s*\[\[?[\w.-]+\]\]?\s*$/m, /^\s*[\w-]+\s*=\s*["'\[\{]/m], minMatches: 2, weight: 85 },
            { name: 'Crontab', patterns: [/^(\*|[\d,\/-]+)\s+(\*|[\d,\/-]+)\s+(\*|[\d,\/-]+)\s+(\*|[\d,\/-]+)\s+(\*|[\d,\/-]+)\s+/m, /^@(reboot|yearly|monthly|weekly|daily|hourly)\s+/m], minMatches: 1, weight: 95 },
            { name: 'Systemd', patterns: [/^\s*\[(Unit|Service|Install|Timer)\]\s*$/m, /^\s*(Description|ExecStart|WantedBy|After|Type)\s*=/m], minMatches: 2, weight: 95 },

            // ===== プログラミング言語 (weight 85-95) =====
            { name: 'PHP', patterns: [/\$[a-zA-Z_]\w*\s*=/, /\$this->/, /self::/, /parent::/], minMatches: 2, weight: 90 },
            { name: 'PHP', patterns: [/function\s+\w+\s*\([^)]*\)(\s*:\s*\??\w+)?\s*\{/, /(public|private|protected)\s+(static\s+)?function\s+/, /namespace\s+[\w\\]+\s*;/, /use\s+[\w\\]+/], minMatches: 1, weight: 90 },
            { name: 'PHP', patterns: [/\becho\s+/, /\barray\s*\(/, /->\w+\s*\(/, /\bnew\s+\w+\s*\(/], minMatches: 2, weight: 80 },

            { name: 'JavaScript', patterns: [/^import\s+.*\s+from\s+['"]/, /^export\s+(default\s+)?(function|class|const|let|var)\s+/m], minMatches: 1, weight: 95 },
            { name: 'JavaScript', patterns: [/\bconst\s+\w+\s*=\s*require\s*\(/, /module\.exports\s*=/], minMatches: 1, weight: 95 },
            { name: 'JavaScript', patterns: [/\bconsole\.(log|error|warn|info)\s*\(/, /\bdocument\.(getElementById|querySelector|querySelectorAll)\b/, /\bwindow\.(location|localStorage)\b/], minMatches: 1, weight: 90 },
            { name: 'JavaScript', patterns: [/(const|let|var)\s+\w+\s*=/, /=>\s*[\{\(]?/, /function\s*\w*\s*\([^)]*\)\s*\{/], minMatches: 2, weight: 80 },

            { name: 'TypeScript', patterns: [/:\s*(string|number|boolean|any|void|never|unknown)(\[\])?\s*[;,=\)]/, /interface\s+\w+\s*(\<[\w,\s]+\>)?\s*\{/, /type\s+\w+\s*=/, /as\s+(string|number|boolean|any|const)\b/], minMatches: 1, weight: 92 },

            { name: 'Python', patterns: [/^(from|import)\s+[\w.]+(\s+import\s+)?/m, /^def\s+\w+\s*\([^)]*\)\s*(->\s*[\w\[\],\s]+)?\s*:/m, /^class\s+\w+(\([^)]*\))?\s*:/m], minMatches: 1, weight: 92 },
            { name: 'Python', patterns: [/if\s+__name__\s*==\s*["']__main__["']\s*:/, /\bself\.\w+/, /\bprint\s*\(/], minMatches: 2, weight: 85 },

            { name: 'Ruby', patterns: [/^require\s+['"][\w\/.-]+['"]/, /^class\s+\w+(\s*<\s*\w+)?$/m, /^def\s+\w+/m, /\bend\s*$/m], minMatches: 2, weight: 88 },
            { name: 'Ruby', patterns: [/\bdo\s*\|[^|]*\|/, /\.each\s+(do|\{)/, /\bputs\s+/, /\bnil\b/], minMatches: 2, weight: 80 },

            { name: 'Perl', patterns: [/^use\s+(strict|warnings|v?\d|utf8|constant|lib|feature)\b/m, /^package\s+[\w:]+\s*;/m], weight: 95 },
            { name: 'Perl', patterns: [/\bmy\s+[\$@%][\w]+/, /\bour\s+[\$@%]/, /\blocal\s+[\$@%]/], minMatches: 1, weight: 90 },
            { name: 'Perl', patterns: [/\bsub\s+\w+\s*\{/, /=~\s*[sm]?\//, /\bqw\s*[\(\[\{<\/]/, /\$_\b/, /@_\b/], minMatches: 2, weight: 85 },

            { name: 'Go', patterns: [/^package\s+(main|\w+)\s*$/m, /^import\s+(\(|")/m, /^func\s+(\(\w+\s+\*?\w+\)\s+)?\w+\s*\(/m], minMatches: 2, weight: 92 },
            { name: 'Go', patterns: [/:=\s*/, /\bfunc\s*\(/, /\bdefer\s+/, /\bfmt\.(Print|Sprintf)/], minMatches: 2, weight: 85 },

            { name: 'Rust', patterns: [/^(pub\s+)?fn\s+\w+/m, /^(pub\s+)?(struct|enum|trait|impl|mod|use)\s+/m], minMatches: 1, weight: 92 },
            { name: 'Rust', patterns: [/let\s+(mut\s+)?\w+\s*[=:]/, /\bSome\s*\(/, /\bNone\b/, /\bOk\s*\(/, /\bErr\s*\(/], minMatches: 2, weight: 85 },

            { name: 'Java', patterns: [/^package\s+[\w.]+\s*;/m, /^import\s+[\w.]+(\.\*)?\s*;/m, /^(public|private|protected)\s+(abstract\s+)?(class|interface|enum)\s+\w+/m], minMatches: 2, weight: 92 },
            { name: 'Java', patterns: [/\bSystem\.(out|err)\.(println?|printf)\s*\(/, /\bpublic\s+static\s+void\s+main\s*\(/], minMatches: 1, weight: 88 },

            { name: 'Kotlin', patterns: [/^package\s+[\w.]+$/m, /^(fun|val|var|class|object|interface)\s+/m], minMatches: 2, weight: 92 },
            { name: 'Swift', patterns: [/^import\s+(Foundation|UIKit|SwiftUI)\s*$/m, /^(class|struct|enum|protocol|extension|func)\s+\w+/m], minMatches: 1, weight: 92 },
            { name: 'Scala', patterns: [/^package\s+[\w.]+$/m, /^(object|class|trait|case\s+class)\s+\w+/m], minMatches: 2, weight: 92 },

            { name: 'C', patterns: [/^#include\s*<[\w.\/]+>/m, /^#include\s*"[\w.\/]+"/m, /^#(define|ifdef|ifndef|endif|pragma)\b/m], minMatches: 1, weight: 90 },
            { name: 'C', patterns: [/\b(int|char|float|double|void|long|short|unsigned|struct|typedef)\s+\w+/, /\bprintf\s*\(/, /\bmalloc\s*\(/], minMatches: 2, weight: 85 },

            { name: 'C++', patterns: [/^#include\s*<(iostream|string|vector|map|algorithm|memory)>/m, /\bstd::\w+/, /\bcout\s*<</, /\bcin\s*>>/], minMatches: 1, weight: 92 },
            { name: 'C++', patterns: [/\btemplate\s*</, /\bclass\s+\w+\s*(:\s*(public|private|protected)\s+\w+)?\s*\{/, /\bnullptr\b/, /\bauto\s+\w+\s*=/], minMatches: 2, weight: 88 },

            { name: 'C#', patterns: [/^using\s+(System|Microsoft)[\w.]*\s*;/m, /^namespace\s+[\w.]+\s*\{?/m, /^(public|private|protected|internal)\s+(partial\s+)?(class|interface|struct|enum)\s+\w+/m], minMatches: 2, weight: 92 },
            { name: 'C#', patterns: [/\bConsole\.(WriteLine?|ReadLine?)\s*\(/, /\bvar\s+\w+\s*=/, /\basync\s+Task/], minMatches: 2, weight: 85 },

            { name: 'PowerShell', patterns: [/^\s*\$\w+\s*=/, /\$(PSVersionTable|env|true|false|null)\b/, /\b(Get|Set|New|Remove|Write|Invoke)-\w+\b/i], minMatches: 1, weight: 92 },
            { name: 'Batch', patterns: [/^@echo\s+(on|off)/im, /^(set|setlocal|call|goto|if|for)\s+/im, /^:\w+\s*$/m, /%\w+%/], minMatches: 2, weight: 90 },

            { name: 'R', patterns: [/^library\s*\(\w+\)/m, /^\w+\s*<-\s*/m, /\bfunction\s*\([^)]*\)\s*\{/], minMatches: 2, weight: 90 },
            { name: 'Lua', patterns: [/^local\s+\w+\s*=/m, /^function\s+[\w.:]+\s*\(/m, /\brequire\s*[(\["']/], minMatches: 1, weight: 90 },
            { name: 'Haskell', patterns: [/^module\s+[\w.]+\s+(where|\()/m, /^import\s+(qualified\s+)?[\w.]+/m, /^(data|newtype|type|class)\s+\w+/m], minMatches: 1, weight: 92 },
            { name: 'Elixir', patterns: [/^defmodule\s+[\w.]+\s+do/m, /^def\s+\w+[\(\s]/m, /\|>\s*/], minMatches: 2, weight: 92 },

            { name: 'GraphQL', patterns: [/^\s*(query|mutation|subscription|fragment|type|input|interface|enum)\s+\w+/m], minMatches: 1, weight: 92 },

            // ===== データ形式 (weight 85-95) =====
            { name: 'JSON', patterns: [/^\s*\{[\s\S]*"[\w@$.-]+":\s*[\[\{"\d]/, /^\s*\[[\s\S]*\{[\s\S]*"[\w@$.-]+":/], minMatches: 1, weight: 92 },
            { name: 'JSON', patterns: [/^\s*[\[\{]/, /"[\w@$.-]+":\s*("[^"]*"|\d+(\.\d+)?|true|false|null|\[|\{)/, /,\s*"[\w@$.-]+":/], minMatches: 2, weight: 88 },

            { name: 'YAML', patterns: [/^---\s*$/m, /^[\w-]+:\s*$/m, /^[\w-]+:\s+[\w"'\[{|>]/m, /^\s+-\s+[\w"'{]/m], minMatches: 2, weight: 85 },

            { name: 'XML', patterns: [/<[\w]+:[\w]+[\s\/>]/, /xmlns(:\w+)?\s*=\s*["'][^"']+["']/, /<!\[CDATA\[/], minMatches: 1, weight: 88 },

            { name: 'CSV', patterns: [/^"[^"]*"(,"[^"]*")+\s*$/m, /^[\w\s]+,[\w\s]+(,[\w\s]+)+$/m], minMatches: 1, weight: 75 },

            // ===== マークアップ (weight 80-95) =====
            { name: 'HTML', patterns: [/^<html[\s>]/im, /^<head[\s>]/im, /^<body[\s>]/im], minMatches: 1, weight: 95 },
            { name: 'HTML', patterns: [/<\/?(html|head|body|title|meta|link|style|script|div|span|p|a|ul|li|ol|table|tr|td|th|form|input|button|select|textarea|label|header|footer|nav|section|article|aside|main|h[1-6]|img|br|hr)\b[^>]*>/i], weight: 90 },
            { name: 'HTML', patterns: [/\bclass\s*=\s*["'][^"']+["']/, /\bid\s*=\s*["'][^"']+["']/, /\bhref\s*=\s*["']/, /\bsrc\s*=\s*["']/, /\bname\s*=\s*["']/, /\bcontent\s*=\s*["']/, /\bproperty\s*=\s*["']/], minMatches: 2, weight: 85 },

            { name: 'Markdown', patterns: [/^#{1,6}\s+\S/m, /^\*{3,}$|^-{3,}$|^_{3,}$/m, /\[.+\]\([^)]+\)/, /^>\s+\S/m, /^```[\w]*\n/m], minMatches: 2, weight: 80 },

            { name: 'LaTeX', patterns: [/\\documentclass[\[\{]/, /\\begin\{(document|equation|align|figure|table)\}/, /\\usepackage[\[\{]/], minMatches: 1, weight: 95 },

            // ===== CSS系 (weight 82-92) =====
            { name: 'SCSS', patterns: [/^\s*\$[\w-]+\s*:/, /^\s*@(mixin|include|extend|import|use)\s+/m, /&:[\w-]+\s*\{/], minMatches: 2, weight: 92 },
            { name: 'Less', patterns: [/^\s*@[\w-]+\s*:/, /^\s*\.[\w-]+\s*\([^)]*\)\s*\{/], minMatches: 2, weight: 90 },
            { name: 'CSS', patterns: [/^@(import|media|keyframes|font-face|supports)\b/m, /^\s*[\.\#]?[\w-]+\s*\{[^}]*[\w-]+\s*:\s*[^;]+;/m], minMatches: 1, weight: 88 },
            { name: 'CSS', patterns: [/[\.\#][\w-]+\s*\{/, /\b(color|background|margin|padding|border|font|display|position|width|height)\s*:\s*/], minMatches: 2, weight: 82 },

            // ===== SQL系 (weight 85-95) =====
            { name: 'SQL', patterns: [/^\s*(SELECT|INSERT\s+INTO|UPDATE|DELETE\s+FROM|CREATE\s+(TABLE|DATABASE|INDEX|VIEW)|ALTER\s+TABLE|DROP\s+(TABLE|DATABASE))\s+/im], weight: 95 },
            { name: 'SQL', patterns: [/\bFROM\s+[\w.`"[\]]+/i, /\bWHERE\s+/i, /\b(INNER|LEFT|RIGHT|FULL)\s+JOIN\b/i, /\bGROUP\s+BY\b/i, /\bORDER\s+BY\b/i], minMatches: 2, weight: 88 },

            // ===== シェル系 (weight 78-85) =====
            { name: 'Bash', patterns: [/^\s*\$\s+\w+/, /^(echo|cd|ls|mkdir|rm|cp|mv|chmod|grep|find|cat|sed|awk|curl|wget)\s+/m, /\|\s*(grep|awk|sed|sort|uniq)\b/], minMatches: 2, weight: 85 },
            { name: 'Bash', patterns: [/\$\{[\w_]+[\}:\-+?#%\/]/, /\$\([^)]+\)/, /\[\[\s+.*\s+\]\]/, /\bfi\b/, /\bdone\b/], minMatches: 2, weight: 82 },

            // ===== その他 (weight 85-90) =====
            { name: 'Diff', patterns: [/^(---|\+\+\+)\s+\S/m, /^@@\s+-\d+,\d+\s+\+\d+,\d+\s+@@/m], minMatches: 2, weight: 90 }
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
            // JavaScript系
            'js': 'JavaScript', 'javascript': 'JavaScript', 'jsx': 'JSX',
            'ts': 'TypeScript', 'typescript': 'TypeScript', 'tsx': 'TSX',
            'node': 'Node.js', 'nodejs': 'Node.js', 'vue': 'Vue', 'svelte': 'Svelte',
            // Web系
            'html': 'HTML', 'htm': 'HTML', 'xhtml': 'XHTML',
            'css': 'CSS', 'scss': 'SCSS', 'sass': 'Sass', 'less': 'Less',
            // スクリプト言語
            'py': 'Python', 'python': 'Python', 'python3': 'Python',
            'rb': 'Ruby', 'ruby': 'Ruby', 'php': 'PHP',
            'perl': 'Perl', 'pl': 'Perl', 'pm': 'Perl',
            'lua': 'Lua', 'r': 'R', 'rscript': 'R',
            // シェル系
            'bash': 'Bash', 'sh': 'Shell', 'shell': 'Shell', 'zsh': 'Zsh', 'fish': 'Fish',
            'powershell': 'PowerShell', 'ps1': 'PowerShell', 'pwsh': 'PowerShell',
            'bat': 'Batch', 'batch': 'Batch', 'cmd': 'Batch', 'awk': 'AWK',
            // コンパイル言語
            'c': 'C', 'h': 'C', 'cpp': 'C++', 'c++': 'C++', 'cxx': 'C++', 'cc': 'C++', 'hpp': 'C++',
            'csharp': 'C#', 'cs': 'C#', 'java': 'Java',
            'kotlin': 'Kotlin', 'kt': 'Kotlin', 'scala': 'Scala',
            'go': 'Go', 'golang': 'Go', 'rust': 'Rust', 'rs': 'Rust',
            'swift': 'Swift', 'objectivec': 'Objective-C', 'objc': 'Objective-C', 'm': 'Objective-C',
            'dart': 'Dart',
            // 関数型言語
            'haskell': 'Haskell', 'hs': 'Haskell', 'elixir': 'Elixir', 'ex': 'Elixir',
            'erlang': 'Erlang', 'erl': 'Erlang', 'clojure': 'Clojure', 'clj': 'Clojure',
            'fsharp': 'F#', 'fs': 'F#', 'ocaml': 'OCaml', 'ml': 'OCaml', 'elm': 'Elm',
            // データ形式
            'json': 'JSON', 'jsonc': 'JSON', 'xml': 'XML', 'xsl': 'XSL',
            'yaml': 'YAML', 'yml': 'YAML', 'toml': 'TOML', 'ini': 'INI',
            'csv': 'CSV', 'tsv': 'TSV',
            // マークアップ・ドキュメント
            'md': 'Markdown', 'markdown': 'Markdown', 'rst': 'reStructuredText',
            'tex': 'LaTeX', 'latex': 'LaTeX', 'asciidoc': 'AsciiDoc',
            // データベース
            'sql': 'SQL', 'mysql': 'MySQL', 'pgsql': 'PostgreSQL', 'postgresql': 'PostgreSQL',
            'plsql': 'PL/SQL', 'tsql': 'T-SQL', 'sqlite': 'SQLite',
            // 設定・インフラ
            'dockerfile': 'Dockerfile', 'docker': 'Dockerfile',
            'nginx': 'Nginx', 'apache': 'Apache', 'htaccess': 'Apache',
            'terraform': 'Terraform', 'tf': 'Terraform', 'hcl': 'HCL',
            'makefile': 'Makefile', 'make': 'Makefile', 'cmake': 'CMake',
            'systemd': 'Systemd', 'crontab': 'Crontab', 'cron': 'Crontab',
            // API・スキーマ
            'graphql': 'GraphQL', 'gql': 'GraphQL', 'proto': 'Protocol Buffers', 'protobuf': 'Protocol Buffers',
            // その他
            'vim': 'Vim', 'viml': 'Vim', 'diff': 'Diff', 'patch': 'Diff',
            'regex': 'Regex', 'regexp': 'Regex',
            'asm': 'Assembly', 'assembly': 'Assembly',
            'solidity': 'Solidity', 'sol': 'Solidity',
            'matlab': 'MATLAB', 'julia': 'Julia',
            'groovy': 'Groovy', 'tcl': 'Tcl', 'lisp': 'Lisp', 'scheme': 'Scheme', 'prolog': 'Prolog'
        };

        var lowerName = name.toLowerCase();
        return nameMap[lowerName] || name.charAt(0).toUpperCase() + name.slice(1);
    }

    /**
     * コピーアイコンSVGを作成
     */
    function createCopyIcon() {
        return '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>';
    }

    /**
     * チェックアイコンSVGを作成
     */
    function createCheckIcon() {
        return '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>';
    }

    /**
     * 文字列のハッシュを計算（簡易版）
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
    function copyToClipboard(textToCopy, button, tooltip, language) {
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
