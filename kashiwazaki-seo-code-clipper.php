<?php
/**
 * Plugin Name: Kashiwazaki SEO Code Clipper
 * Plugin URI: https://www.tsuyoshikashiwazaki.jp
 * Description: Adds a copy-to-clipboard button to WordPress Gutenberg code blocks. Features automatic programming language detection with labels and copy tracking analytics for SEO optimization.
 * Version: 1.0.1
 * Author: 柏崎剛 (Tsuyoshi Kashiwazaki)
 * Author URI: https://www.tsuyoshikashiwazaki.jp/profile/
 * License: GPL v2 or later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain: kashiwazaki-seo-code-clipper
 */

// 直接アクセスを防止
if (!defined('ABSPATH')) {
    exit;
}

// プラグインの定数
define('KSCC_VERSION', '1.0.1');
define('KSCC_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('KSCC_PLUGIN_URL', plugin_dir_url(__FILE__));
define('KSCC_PLUGIN_BASENAME', plugin_basename(__FILE__));
define('KSCC_DB_VERSION', '1.0');

/**
 * プラグインのメインクラス
 */
class Kashiwazaki_SEO_Code_Clipper {

    /**
     * シングルトンインスタンス
     */
    private static $instance = null;

    /**
     * デフォルト設定
     */
    private $default_options = array(
        'background_color' => '#000000',
        'text_color' => '#ffffff',
        'target_mode' => 'pre_only',
        'target_class' => '',
        'show_language_label' => true,
        'enable_copy_tracking' => true,
    );

    /**
     * シングルトンインスタンスを取得
     */
    public static function get_instance() {
        if (null === self::$instance) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    /**
     * コンストラクタ
     */
    private function __construct() {
        add_action('admin_menu', array($this, 'add_admin_menu'));
        add_action('admin_init', array($this, 'register_settings'));
        add_action('wp_enqueue_scripts', array($this, 'enqueue_frontend_assets'));
        add_action('admin_enqueue_scripts', array($this, 'enqueue_admin_assets'));
        add_filter('plugin_action_links_' . KSCC_PLUGIN_BASENAME, array($this, 'add_settings_link'));
        add_action('rest_api_init', array($this, 'register_rest_routes'));
    }

    /**
     * プラグイン一覧に設定リンクを追加
     */
    public function add_settings_link($links) {
        $settings_link = '<a href="' . admin_url('admin.php?page=kashiwazaki-seo-code-clipper') . '">設定</a>';
        array_unshift($links, $settings_link);
        return $links;
    }

    /**
     * 管理メニューを追加（サブメニューなし、1ページにタブで統合）
     */
    public function add_admin_menu() {
        add_menu_page(
            'Kashiwazaki SEO Code Clipper',
            'Kashiwazaki SEO Code Clipper',
            'manage_options',
            'kashiwazaki-seo-code-clipper',
            array($this, 'render_admin_page'),
            'dashicons-clipboard',
            81
        );
    }

    /**
     * 設定を登録
     */
    public function register_settings() {
        register_setting(
            'kscc_settings_group',
            'kscc_options',
            array($this, 'sanitize_options')
        );
    }

    /**
     * オプションのサニタイズ
     */
    public function sanitize_options($input) {
        $sanitized = array();

        $sanitized['background_color'] = isset($input['background_color'])
            ? sanitize_hex_color($input['background_color'])
            : $this->default_options['background_color'];

        $sanitized['text_color'] = isset($input['text_color'])
            ? sanitize_hex_color($input['text_color'])
            : $this->default_options['text_color'];

        $valid_modes = array('pre_only', 'code_only', 'pre_and_code', 'class_only');
        $sanitized['target_mode'] = isset($input['target_mode']) && in_array($input['target_mode'], $valid_modes)
            ? $input['target_mode']
            : $this->default_options['target_mode'];

        $sanitized['target_class'] = isset($input['target_class'])
            ? sanitize_text_field($input['target_class'])
            : '';

        $sanitized['show_language_label'] = isset($input['show_language_label']) ? (bool) $input['show_language_label'] : false;

        $sanitized['enable_copy_tracking'] = isset($input['enable_copy_tracking']) ? (bool) $input['enable_copy_tracking'] : false;

        return $sanitized;
    }

    /**
     * オプションを取得
     */
    public function get_options() {
        $options = get_option('kscc_options', $this->default_options);
        return wp_parse_args($options, $this->default_options);
    }

    /**
     * 現在のタブを取得
     */
    private function get_current_tab() {
        return isset($_GET['tab']) ? sanitize_text_field($_GET['tab']) : 'settings';
    }

    /**
     * 管理ページを表示（タブ切り替え式）
     */
    public function render_admin_page() {
        if (!current_user_can('manage_options')) {
            return;
        }

        $current_tab = $this->get_current_tab();

        if (isset($_GET['settings-updated']) && $current_tab === 'settings') {
            add_settings_error(
                'kscc_messages',
                'kscc_message',
                '設定を保存しました。',
                'updated'
            );
        }
        ?>
        <div class="wrap kscc-admin-wrap">
            <h1>Kashiwazaki SEO Code Clipper</h1>

            <nav class="nav-tab-wrapper kscc-nav-tabs">
                <a href="<?php echo admin_url('admin.php?page=kashiwazaki-seo-code-clipper&tab=settings'); ?>"
                   class="nav-tab <?php echo $current_tab === 'settings' ? 'nav-tab-active' : ''; ?>">
                    設定
                </a>
                <a href="<?php echo admin_url('admin.php?page=kashiwazaki-seo-code-clipper&tab=stats'); ?>"
                   class="nav-tab <?php echo $current_tab === 'stats' ? 'nav-tab-active' : ''; ?>">
                    コピー統計
                </a>
                <a href="<?php echo admin_url('admin.php?page=kashiwazaki-seo-code-clipper&tab=guide'); ?>"
                   class="nav-tab <?php echo $current_tab === 'guide' ? 'nav-tab-active' : ''; ?>">
                    使い方
                </a>
            </nav>

            <div class="kscc-tab-content">
                <?php
                switch ($current_tab) {
                    case 'stats':
                        $this->render_stats_tab();
                        break;
                    case 'guide':
                        $this->render_guide_tab();
                        break;
                    default:
                        $this->render_settings_tab();
                        break;
                }
                ?>
            </div>
        </div>
        <?php
    }

    /**
     * 設定タブを表示
     */
    private function render_settings_tab() {
        settings_errors('kscc_messages');
        $options = $this->get_options();
        ?>
        <form action="options.php" method="post">
            <?php settings_fields('kscc_settings_group'); ?>

            <div class="kscc-settings-section">
                <h2>コピーボタンの適用範囲</h2>
                <p class="kscc-section-desc">どの要素にコピーボタンを表示するか選択してください。</p>

                <table class="form-table">
                    <tr>
                        <th scope="row">適用モード</th>
                        <td>
                            <fieldset class="kscc-target-mode-options">
                                <label class="kscc-radio-card <?php echo $options['target_mode'] === 'pre_only' ? 'selected' : ''; ?>">
                                    <input type="radio"
                                           name="kscc_options[target_mode]"
                                           value="pre_only"
                                           <?php checked($options['target_mode'], 'pre_only'); ?> />
                                    <span class="kscc-radio-card-content">
                                        <strong>複数行コード（&lt;pre&gt;タグ）のみ</strong>
                                        <span class="kscc-radio-desc">WordPress標準の「コード」ブロックや「整形済みテキスト」ブロックに適用されます。</span>
                                        <span class="kscc-radio-example">
                                            <span class="kscc-example-label">対象になるもの：</span>
                                            投稿編集画面で「+」→「コード」で追加した、背景色付きの複数行表示のコード
                                        </span>
                                    </span>
                                </label>

                                <label class="kscc-radio-card <?php echo $options['target_mode'] === 'code_only' ? 'selected' : ''; ?>">
                                    <input type="radio"
                                           name="kscc_options[target_mode]"
                                           value="code_only"
                                           <?php checked($options['target_mode'], 'code_only'); ?> />
                                    <span class="kscc-radio-card-content">
                                        <strong>インラインコード（&lt;code&gt;タグ）のみ</strong>
                                        <span class="kscc-radio-desc">文章中の短いコードにのみ適用されます。複数行コードには適用されません。</span>
                                        <span class="kscc-radio-example">
                                            <span class="kscc-example-label">対象になるもの：</span>
                                            文章中で<code>このように</code>装飾された短いコード
                                        </span>
                                    </span>
                                </label>

                                <label class="kscc-radio-card <?php echo $options['target_mode'] === 'pre_and_code' ? 'selected' : ''; ?>">
                                    <input type="radio"
                                           name="kscc_options[target_mode]"
                                           value="pre_and_code"
                                           <?php checked($options['target_mode'], 'pre_and_code'); ?> />
                                    <span class="kscc-radio-card-content">
                                        <strong>すべてのコード（&lt;pre&gt; + &lt;code&gt;タグ）</strong>
                                        <span class="kscc-radio-desc">複数行コードとインラインコードの両方に適用されます。</span>
                                        <span class="kscc-radio-example">
                                            <span class="kscc-example-label">対象になるもの：</span>
                                            上記2つの両方
                                        </span>
                                    </span>
                                </label>

                                <label class="kscc-radio-card <?php echo $options['target_mode'] === 'class_only' ? 'selected' : ''; ?>">
                                    <input type="radio"
                                           name="kscc_options[target_mode]"
                                           value="class_only"
                                           <?php checked($options['target_mode'], 'class_only'); ?> />
                                    <span class="kscc-radio-card-content">
                                        <strong>指定したCSSクラスを持つ要素のみ</strong>
                                        <span class="kscc-radio-desc">特定の要素だけにコピーボタンを表示したい場合に選択してください。</span>
                                    </span>
                                </label>
                            </fieldset>
                        </td>
                    </tr>
                    <tr class="kscc-class-input-row" style="<?php echo $options['target_mode'] !== 'class_only' ? 'display:none;' : ''; ?>">
                        <th scope="row">対象のCSSクラス名</th>
                        <td>
                            <input type="text"
                                   name="kscc_options[target_class]"
                                   value="<?php echo esc_attr($options['target_class']); ?>"
                                   class="regular-text"
                                   placeholder="例: my-copyable-code" />
                            <p class="description">
                                ここに入力したクラス名を持つ要素にのみコピーボタンが表示されます。<br>
                                複数指定する場合はカンマ区切りで入力してください（例: class1, class2）
                            </p>
                            <div class="kscc-howto-box">
                                <p><strong>設定方法：</strong></p>
                                <ol>
                                    <li>投稿編集画面で対象のブロックを選択</li>
                                    <li>右サイドバーの「ブロック」タブを開く</li>
                                    <li>「高度な設定」を開く</li>
                                    <li>「追加CSSクラス」欄に上記で指定したクラス名を入力</li>
                                </ol>
                            </div>
                        </td>
                    </tr>
                </table>
            </div>

            <div class="kscc-settings-section">
                <h2>表示スタイル</h2>
                <p class="kscc-section-desc">コピーボタン付きコードの見た目を設定します。</p>

                <table class="form-table">
                    <tr>
                        <th scope="row">背景色</th>
                        <td>
                            <input type="text"
                                   name="kscc_options[background_color]"
                                   value="<?php echo esc_attr($options['background_color']); ?>"
                                   class="kscc-color-picker"
                                   data-default-color="<?php echo esc_attr($this->default_options['background_color']); ?>" />
                        </td>
                    </tr>
                    <tr>
                        <th scope="row">テキスト色</th>
                        <td>
                            <input type="text"
                                   name="kscc_options[text_color]"
                                   value="<?php echo esc_attr($options['text_color']); ?>"
                                   class="kscc-color-picker"
                                   data-default-color="<?php echo esc_attr($this->default_options['text_color']); ?>" />
                        </td>
                    </tr>
                </table>
            </div>

            <div class="kscc-settings-section">
                <h2>追加機能</h2>

                <table class="form-table">
                    <tr>
                        <th scope="row">言語ラベル</th>
                        <td>
                            <label>
                                <input type="checkbox"
                                       name="kscc_options[show_language_label]"
                                       value="1"
                                       <?php checked($options['show_language_label'], true); ?> />
                                コードの言語名を自動表示する（PHP, JavaScript, Python など）
                            </label>
                            <p class="description">コードの内容から言語を自動判別して、左上にラベル表示します。</p>
                        </td>
                    </tr>
                    <tr>
                        <th scope="row">コピー統計</th>
                        <td>
                            <label>
                                <input type="checkbox"
                                       name="kscc_options[enable_copy_tracking]"
                                       value="1"
                                       <?php checked($options['enable_copy_tracking'], true); ?> />
                                コピーボタンのクリック回数を記録する
                            </label>
                            <p class="description">どのコードがよくコピーされているかを「コピー統計」タブで確認できます。</p>
                        </td>
                    </tr>
                </table>
            </div>

            <?php submit_button('設定を保存'); ?>
        </form>
        <?php
    }

    /**
     * 統計タブを表示
     */
    private function render_stats_tab() {
        global $wpdb;
        $table_name = $wpdb->prefix . 'kscc_copy_stats';

        // テーブルが存在するか確認
        $table_exists = $wpdb->get_var($wpdb->prepare("SHOW TABLES LIKE %s", $table_name)) === $table_name;

        if (!$table_exists) {
            ?>
            <div class="kscc-empty-state">
                <div class="kscc-empty-icon">📊</div>
                <h2>まだ統計データがありません</h2>
                <p>コピーボタンが使用されると、ここに統計が表示されます。</p>
            </div>
            <?php
            return;
        }

        // 統計データを取得
        $stats = $wpdb->get_results("
            SELECT s.*, p.post_title
            FROM {$table_name} s
            LEFT JOIN {$wpdb->posts} p ON s.post_id = p.ID
            ORDER BY s.copy_count DESC
            LIMIT 100
        ");

        // 合計コピー回数
        $total_copies = $wpdb->get_var("SELECT SUM(copy_count) FROM {$table_name}");
        $total_codes = $wpdb->get_var("SELECT COUNT(*) FROM {$table_name}");

        ?>
        <div class="kscc-stats-summary">
            <div class="kscc-stat-box">
                <span class="kscc-stat-number"><?php echo number_format($total_copies ?: 0); ?></span>
                <span class="kscc-stat-label">総コピー回数</span>
            </div>
            <div class="kscc-stat-box">
                <span class="kscc-stat-number"><?php echo number_format($total_codes ?: 0); ?></span>
                <span class="kscc-stat-label">トラッキング中のコード</span>
            </div>
        </div>

        <?php if (empty($stats)) : ?>
            <div class="kscc-empty-state">
                <p>まだコピー統計データがありません。</p>
            </div>
        <?php else : ?>
            <table class="wp-list-table widefat fixed striped">
                <thead>
                    <tr>
                        <th style="width: 25%;">ページ</th>
                        <th style="width: 35%;">コードプレビュー</th>
                        <th style="width: 10%;">言語</th>
                        <th style="width: 10%;">コピー回数</th>
                        <th style="width: 20%;">最終コピー日時</th>
                    </tr>
                </thead>
                <tbody>
                    <?php foreach ($stats as $stat) : ?>
                        <tr>
                            <td>
                                <?php if ($stat->post_title) : ?>
                                    <a href="<?php echo get_permalink($stat->post_id); ?>" target="_blank">
                                        <?php echo esc_html($stat->post_title); ?>
                                    </a>
                                <?php else : ?>
                                    <span class="kscc-deleted-post">（削除済み）</span>
                                <?php endif; ?>
                            </td>
                            <td>
                                <code class="kscc-code-preview"><?php echo esc_html($stat->code_preview); ?></code>
                            </td>
                            <td>
                                <?php if ($stat->language) : ?>
                                    <span class="kscc-language-badge"><?php echo esc_html($stat->language); ?></span>
                                <?php else : ?>
                                    <span class="kscc-no-language">-</span>
                                <?php endif; ?>
                            </td>
                            <td>
                                <strong><?php echo number_format($stat->copy_count); ?></strong>
                            </td>
                            <td>
                                <?php echo esc_html($stat->last_copied_at); ?>
                            </td>
                        </tr>
                    <?php endforeach; ?>
                </tbody>
            </table>
        <?php endif;
    }

    /**
     * 使い方タブを表示
     */
    private function render_guide_tab() {
        ?>
        <div class="kscc-guide-content">
            <div class="kscc-guide-section">
                <h2>このプラグインでできること</h2>
                <ul class="kscc-feature-list">
                    <li><strong>コピーボタン自動追加</strong> - 指定した要素にワンクリックでコピーできるボタンを表示</li>
                    <li><strong>言語の自動判別</strong> - コードの内容からPHP、JavaScript、Pythonなどの言語を判別してラベル表示</li>
                    <li><strong>コピー統計</strong> - どのコードがよくコピーされているか分析可能</li>
                </ul>
            </div>

            <div class="kscc-guide-section kscc-guide-important">
                <h2>適用モードの違い</h2>

                <div class="kscc-mode-cards">
                    <div class="kscc-mode-card">
                        <h3>複数行コード（&lt;pre&gt;タグ）のみ</h3>
                        <div class="kscc-mode-example">
                            <p><strong>対象になるもの：</strong></p>
                            <div class="kscc-visual-example kscc-pre-example">
                                <div class="kscc-example-header">
                                    <span class="kscc-example-badge">コピーボタンが付く</span>
                                </div>
                                <pre><code>&lt;?php
echo "Hello World";
?&gt;</code></pre>
                            </div>
                            <p class="kscc-howto">
                                <strong>作り方：</strong>投稿編集画面 → 「+」ボタン → 「コード」を検索して追加
                            </p>
                        </div>
                    </div>

                    <div class="kscc-mode-card">
                        <h3>インラインコード（&lt;code&gt;タグ）のみ</h3>
                        <div class="kscc-mode-example">
                            <p><strong>対象になるもの：</strong></p>
                            <p class="kscc-inline-example">
                                文章の中で <code class="kscc-inline-code-example">site:example.com</code> のように
                                装飾された短いコード
                            </p>
                            <p class="kscc-howto">
                                <strong>作り方：</strong>段落内でテキストを選択 → ツールバーの「∨」→「インラインコード」
                            </p>
                        </div>
                    </div>

                    <div class="kscc-mode-card">
                        <h3>すべてのコード（&lt;pre&gt; + &lt;code&gt;タグ）</h3>
                        <div class="kscc-mode-example">
                            <p><strong>対象になるもの：</strong></p>
                            <p>上記2つの両方にコピーボタンが付きます。</p>
                        </div>
                    </div>

                    <div class="kscc-mode-card">
                        <h3>指定したCSSクラスを持つ要素のみ</h3>
                        <div class="kscc-mode-example">
                            <p>特定のコードにだけコピーボタンを付けたい場合に使います。</p>
                            <p class="kscc-howto">
                                <strong>設定方法：</strong><br>
                                1. 設定タブで適用モードを選択し、クラス名を入力（例: <code>copy-me</code>）<br>
                                2. 投稿編集画面で対象ブロックを選択<br>
                                3. 右サイドバー「ブロック」→「高度な設定」→「追加CSSクラス」に同じクラス名を入力
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div class="kscc-guide-section">
                <h2>よくある質問</h2>

                <div class="kscc-faq">
                    <div class="kscc-faq-item">
                        <h4>Q: コピーボタンが表示されません</h4>
                        <p>A: 適用モードを確認してください。「複数行コードのみ」の場合、文章中の短いインラインコードには表示されません。「すべてのコード」を選択すると表示されます。</p>
                    </div>

                    <div class="kscc-faq-item">
                        <h4>Q: 特定のコードにだけコピーボタンを付けたい</h4>
                        <p>A: 「指定したCSSクラスを持つ要素のみ」を選択し、クラス名を設定してください。そのクラスを付けたブロックにのみコピーボタンが表示されます。</p>
                    </div>

                    <div class="kscc-faq-item">
                        <h4>Q: 言語ラベルが正しく表示されません</h4>
                        <p>A: 言語はコードの内容から自動判別しています。短いコードや一般的でない言語は判別できない場合があります。</p>
                    </div>
                </div>
            </div>
        </div>
        <?php
    }

    /**
     * 管理画面用アセットを読み込み
     */
    public function enqueue_admin_assets($hook) {
        if ($hook !== 'toplevel_page_kashiwazaki-seo-code-clipper') {
            return;
        }

        wp_enqueue_style('wp-color-picker');
        wp_enqueue_script('wp-color-picker');

        wp_enqueue_style(
            'kscc-admin-style',
            KSCC_PLUGIN_URL . 'assets/css/admin.css',
            array(),
            KSCC_VERSION
        );

        wp_enqueue_script(
            'kscc-admin-script',
            KSCC_PLUGIN_URL . 'assets/js/admin.js',
            array('jquery', 'wp-color-picker'),
            KSCC_VERSION,
            true
        );
    }

    /**
     * フロントエンド用アセットを読み込み
     */
    public function enqueue_frontend_assets() {
        $options = $this->get_options();

        wp_enqueue_style(
            'kscc-frontend-style',
            KSCC_PLUGIN_URL . 'assets/css/frontend.css',
            array(),
            KSCC_VERSION
        );

        // カスタムCSSを追加
        $custom_css = sprintf(
            '.kscc-code-wrapper pre,
            .kscc-inline-code-wrapper code {
                background-color: %s !important;
                color: %s !important;
            }',
            esc_attr($options['background_color']),
            esc_attr($options['text_color'])
        );
        wp_add_inline_style('kscc-frontend-style', $custom_css);

        wp_enqueue_script(
            'kscc-frontend-script',
            KSCC_PLUGIN_URL . 'assets/js/frontend.js',
            array(),
            KSCC_VERSION,
            true
        );

        wp_localize_script('kscc-frontend-script', 'ksccSettings', array(
            'targetMode' => $options['target_mode'],
            'targetClass' => $options['target_class'],
            'showLanguageLabel' => $options['show_language_label'],
            'enableCopyTracking' => $options['enable_copy_tracking'],
            'copyText' => 'コピー',
            'copiedText' => 'コピーしました！',
            'restUrl' => rest_url('kscc/v1/track-copy'),
            'nonce' => wp_create_nonce('wp_rest'),
            'postId' => get_the_ID(),
        ));
    }

    /**
     * REST APIルートを登録
     */
    public function register_rest_routes() {
        register_rest_route('kscc/v1', '/track-copy', array(
            'methods' => 'POST',
            'callback' => array($this, 'handle_track_copy'),
            'permission_callback' => '__return_true',
        ));
    }

    /**
     * コピートラッキングを処理
     */
    public function handle_track_copy($request) {
        $options = $this->get_options();

        if (!$options['enable_copy_tracking']) {
            return new WP_REST_Response(array('success' => false, 'message' => 'Tracking disabled'), 200);
        }

        $post_id = absint($request->get_param('post_id'));
        $code_hash = sanitize_text_field($request->get_param('code_hash'));
        $code_preview = sanitize_text_field($request->get_param('code_preview'));
        $language = sanitize_text_field($request->get_param('language'));

        if (!$post_id || !$code_hash) {
            return new WP_REST_Response(array('success' => false, 'message' => 'Invalid parameters'), 400);
        }

        global $wpdb;
        $table_name = $wpdb->prefix . 'kscc_copy_stats';

        // テーブルが存在しない場合は作成
        $this->maybe_create_table();

        // 既存レコードを確認
        $existing = $wpdb->get_row($wpdb->prepare(
            "SELECT id, copy_count FROM {$table_name} WHERE post_id = %d AND code_hash = %s",
            $post_id,
            $code_hash
        ));

        $now = current_time('mysql');

        if ($existing) {
            // 既存レコードを更新
            $wpdb->update(
                $table_name,
                array(
                    'copy_count' => $existing->copy_count + 1,
                    'last_copied_at' => $now,
                ),
                array('id' => $existing->id),
                array('%d', '%s'),
                array('%d')
            );
        } else {
            // 新規レコードを挿入
            $wpdb->insert(
                $table_name,
                array(
                    'post_id' => $post_id,
                    'code_hash' => $code_hash,
                    'code_preview' => mb_substr($code_preview, 0, 100),
                    'language' => $language,
                    'copy_count' => 1,
                    'first_copied_at' => $now,
                    'last_copied_at' => $now,
                ),
                array('%d', '%s', '%s', '%s', '%d', '%s', '%s')
            );
        }

        return new WP_REST_Response(array('success' => true), 200);
    }

    /**
     * データベーステーブルを作成（必要な場合）
     */
    public function maybe_create_table() {
        global $wpdb;
        $table_name = $wpdb->prefix . 'kscc_copy_stats';

        if ($wpdb->get_var($wpdb->prepare("SHOW TABLES LIKE %s", $table_name)) === $table_name) {
            return;
        }

        $charset_collate = $wpdb->get_charset_collate();

        $sql = "CREATE TABLE {$table_name} (
            id BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT,
            post_id BIGINT(20) UNSIGNED NOT NULL,
            code_hash VARCHAR(32) NOT NULL,
            code_preview VARCHAR(100) DEFAULT '',
            language VARCHAR(20) DEFAULT '',
            copy_count INT(11) UNSIGNED NOT NULL DEFAULT 0,
            first_copied_at DATETIME DEFAULT NULL,
            last_copied_at DATETIME DEFAULT NULL,
            PRIMARY KEY (id),
            UNIQUE KEY unique_code (post_id, code_hash),
            KEY post_id (post_id),
            KEY copy_count (copy_count)
        ) {$charset_collate};";

        require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
        dbDelta($sql);
    }
}

// プラグインを初期化
function kscc_init() {
    return Kashiwazaki_SEO_Code_Clipper::get_instance();
}
add_action('plugins_loaded', 'kscc_init');

// アクティベーション時のデフォルト設定
register_activation_hook(__FILE__, 'kscc_activate');
function kscc_activate() {
    $default_options = array(
        'background_color' => '#000000',
        'text_color' => '#ffffff',
        'target_mode' => 'pre_only',
        'target_class' => '',
        'show_language_label' => true,
        'enable_copy_tracking' => true,
    );

    if (!get_option('kscc_options')) {
        add_option('kscc_options', $default_options);
    }

    // テーブルを作成
    $instance = Kashiwazaki_SEO_Code_Clipper::get_instance();
    $instance->maybe_create_table();
}
