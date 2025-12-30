# Kashiwazaki SEO Code Clipper

![WordPress](https://img.shields.io/badge/WordPress-5.0%2B-blue.svg)
![PHP](https://img.shields.io/badge/PHP-7.4%2B-purple.svg)
![License](https://img.shields.io/badge/license-GPLv2%2B-green.svg)
![Version](https://img.shields.io/badge/version-1.0.1-blue.svg)

WordPress のコードブロックとインラインコードにコピーボタンを追加するプラグインです。プログラミング言語を自動判別してラベル表示し、コピー統計も記録できます。

Adds a copy-to-clipboard button to WordPress code blocks and inline code with automatic language detection and copy tracking analytics.

## Features / 機能

- **コードブロック対応** - `<pre>` タグのコードブロックにコピーボタンを追加
- **インラインコード対応** - 文章中の `<code>` タグにもコピーボタンを追加
- **言語自動判別** - コードの内容から言語を自動判別してラベル表示
- **コピー統計** - どのコードがよくコピーされているか記録・分析
- **タブ式管理画面** - 設定・コピー統計・使い方を1ページで管理
- **カスタマイズ可能** - 背景色・テキスト色を自由に設定
- **柔軟な適用範囲** - 全コード、特定タイプ、CSSクラス指定に対応

## Application Modes / 適用モード

コピーボタンを表示する対象を選択できます：

| モード | 説明 |
|--------|------|
| **複数行コード（`<pre>`タグ）のみ** | WordPress標準の「コード」ブロック等 |
| **インラインコード（`<code>`タグ）のみ** | 文章中の短いコードのみ |
| **すべてのコード（`<pre>` + `<code>`タグ）** | 上記2つの両方 |
| **指定したCSSクラスを持つ要素のみ** | 特定の要素だけに適用 |

## Supported Languages / 対応言語

PHP, JavaScript, TypeScript, Python, HTML, CSS, SQL, Bash, JSON, YAML, XML, Ruby, Go, Java, C#, Markdown, and more.

## Installation / インストール

1. プラグインフォルダを `/wp-content/plugins/` にアップロード
2. WordPress管理画面の「プラグイン」メニューから有効化
3. 「Kashiwazaki SEO Code Clipper」メニューで設定

## Settings / 設定

### 適用モード
- 複数行コードのみ / インラインコードのみ / すべてのコード / CSSクラス指定

### 表示スタイル
- **背景色**: デフォルトは黒（#000000）
- **テキスト色**: デフォルトは白（#ffffff）

### 追加機能
- **言語ラベル**: 自動判別した言語名を表示/非表示
- **コピー統計**: コピー回数の記録を有効/無効

## Admin Interface / 管理画面

タブ切り替え式の管理画面：

1. **設定タブ** - 適用モード、表示スタイル、追加機能の設定
2. **コピー統計タブ** - コピー回数のランキング、ページ別・言語別の統計
3. **使い方タブ** - 各モードの説明、設定方法、FAQ

## Requirements / 動作環境

- WordPress 5.0 以上
- PHP 7.4 以上

## Changelog / 更新履歴

### [1.0.1] - 2025-12-30

#### Added / 追加
- タブ式管理画面（設定・コピー統計・使い方）
- インラインコード（`<code>`タグ）のコピーボタン対応
- 新しい適用モード「インラインコードのみ」「すべてのコード」
- 使い方タブ（ビジュアル例とFAQ付き）

#### Improved / 改善
- 適用モード選択をカード形式のラジオボタンに変更
- 設定の説明文をより具体的でわかりやすく改善
- 管理画面のレスポンシブデザイン対応
- CSSクラス指定機能の説明を改善

### [1.0.0] - 2024-12-09
- 初回リリース
- コードブロックへのコピーボタン機能
- 言語自動判別
- コピー統計機能
- 管理画面設定ページ

## License / ライセンス

GPL v2 or later

## Author / 作者

柏崎剛 (Tsuyoshi Kashiwazaki)
- Website: https://www.tsuyoshikashiwazaki.jp
- Profile: https://www.tsuyoshikashiwazaki.jp/profile/
