<?php
/**
 * Plugin Name: Kashiwazaki SEO Code Clipper
 * Plugin URI: https://www.tsuyoshikashiwazaki.jp
 * Description: Adds a copy-to-clipboard button to WordPress Gutenberg code blocks. Features automatic programming language detection with labels and copy tracking analytics for SEO optimization.
 * Version: 1.0.0
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
define('KSCC_VERSION', '1.0.0');
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
        'target_mode' => 'all',
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
     * 管理メニューを追加
     */
    public function add_admin_menu() {
        add_menu_page(
            'Kashiwazaki SEO Code Clipper',
            'Kashiwazaki SEO Code Clipper',
            'manage_options',
            'kashiwazaki-seo-code-clipper',
            array($this, 'render_settings_page'),
            'dashicons-clipboard',
            81
        );

        add_submenu_page(
            'kashiwazaki-seo-code-clipper',
            '設定 - Kashiwazaki SEO Code Clipper',
            '設定',
            'manage_options',
            'kashiwazaki-seo-code-clipper',
            array($this, 'render_settings_page')
        );

        add_submenu_page(
            'kashiwazaki-seo-code-clipper',
            'コピー統計 - Kashiwazaki SEO Code Clipper',
            'コピー統計',
            'manage_options',
            'kashiwazaki-seo-code-clipper-stats',
            array($this, 'render_stats_page')
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

        add_settings_section(
            'kscc_main_section',
            '表示設定',
            array($this, 'render_section_description'),
            'kashiwazaki-seo-code-clipper'
        );

        add_settings_field(
            'background_color',
            '背景色',
            array($this, 'render_background_color_field'),
            'kashiwazaki-seo-code-clipper',
            'kscc_main_section'
        );

        add_settings_field(
            'text_color',
            'テキスト色',
            array($this, 'render_text_color_field'),
            'kashiwazaki-seo-code-clipper',
            'kscc_main_section'
        );

        add_settings_section(
            'kscc_target_section',
            'コピーボタンの適用範囲',
            array($this, 'render_target_section_description'),
            'kashiwazaki-seo-code-clipper'
        );

        add_settings_field(
            'target_mode',
            '適用モード',
            array($this, 'render_target_mode_field'),
            'kashiwazaki-seo-code-clipper',
            'kscc_target_section'
        );

        add_settings_field(
            'target_class',
            '対象クラス名',
            array($this, 'render_target_class_field'),
            'kashiwazaki-seo-code-clipper',
            'kscc_target_section'
        );

        add_settings_section(
            'kscc_feature_section',
            '追加機能',
            array($this, 'render_feature_section_description'),
            'kashiwazaki-seo-code-clipper'
        );

        add_settings_field(
            'show_language_label',
            '言語ラベル表示',
            array($this, 'render_language_label_field'),
            'kashiwazaki-seo-code-clipper',
            'kscc_feature_section'
        );

        add_settings_field(
            'enable_copy_tracking',
            'コピー統計記録',
            array($this, 'render_copy_tracking_field'),
            'kashiwazaki-seo-code-clipper',
            'kscc_feature_section'
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

        $sanitized['target_mode'] = isset($input['target_mode']) && in_array($input['target_mode'], array('all', 'class'))
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
     * セクション説明を表示
     */
    public function render_section_description() {
        echo '<p>コードブロックの表示スタイルを設定します。</p>';
    }

    /**
     * ターゲットセクション説明を表示
     */
    public function render_target_section_description() {
        echo '<p>コピーボタンを表示するコードブロックの範囲を設定します。</p>';
    }

    /**
     * 追加機能セクション説明を表示
     */
    public function render_feature_section_description() {
        echo '<p>SEO強化のための追加機能を設定します。</p>';
    }

    /**
     * 背景色フィールドを表示
     */
    public function render_background_color_field() {
        $options = $this->get_options();
        ?>
        <input type="text"
               name="kscc_options[background_color]"
               value="<?php echo esc_attr($options['background_color']); ?>"
               class="kscc-color-picker"
               data-default-color="<?php echo esc_attr($this->default_options['background_color']); ?>" />
        <p class="description">コードブロックの背景色を選択してください。</p>
        <?php
    }

    /**
     * テキスト色フィールドを表示
     */
    public function render_text_color_field() {
        $options = $this->get_options();
        ?>
        <input type="text"
               name="kscc_options[text_color]"
               value="<?php echo esc_attr($options['text_color']); ?>"
               class="kscc-color-picker"
               data-default-color="<?php echo esc_attr($this->default_options['text_color']); ?>" />
        <p class="description">コードブロックのテキスト色を選択してください。</p>
        <?php
    }

    /**
     * ターゲットモードフィールドを表示
     */
    public function render_target_mode_field() {
        $options = $this->get_options();
        ?>
        <fieldset>
            <label>
                <input type="radio"
                       name="kscc_options[target_mode]"
                       value="all"
                       <?php checked($options['target_mode'], 'all'); ?> />
                すべてのコードブロックにコピーボタンを表示
            </label>
            <br />
            <label>
                <input type="radio"
                       name="kscc_options[target_mode]"
                       value="class"
                       <?php checked($options['target_mode'], 'class'); ?> />
                指定したクラスを持つコードブロックのみにコピーボタンを表示
            </label>
        </fieldset>
        <?php
    }

    /**
     * ターゲットクラスフィールドを表示
     */
    public function render_target_class_field() {
        $options = $this->get_options();
        ?>
        <input type="text"
               name="kscc_options[target_class]"
               value="<?php echo esc_attr($options['target_class']); ?>"
               class="regular-text"
               placeholder="例: code-copyable" />
        <p class="description">「指定したクラスのみ」を選択した場合、ここに指定したクラス名を持つコードブロックにのみコピーボタンが表示されます。<br />複数のクラスを指定する場合は、カンマ区切りで入力してください（例: class1, class2）</p>
        <?php
    }

    /**
     * 言語ラベルフィールドを表示
     */
    public function render_language_label_field() {
        $options = $this->get_options();
        ?>
        <label>
            <input type="checkbox"
                   name="kscc_options[show_language_label]"
                   value="1"
                   <?php checked($options['show_language_label'], true); ?> />
            コードブロックの左上に言語名を自動表示する
        </label>
        <p class="description">コードの内容から言語（PHP, JavaScript, Python等）を自動判別し、ラベルとして表示します。</p>
        <?php
    }

    /**
     * コピー統計フィールドを表示
     */
    public function render_copy_tracking_field() {
        $options = $this->get_options();
        ?>
        <label>
            <input type="checkbox"
                   name="kscc_options[enable_copy_tracking]"
                   value="1"
                   <?php checked($options['enable_copy_tracking'], true); ?> />
            コピーボタンのクリック回数を記録する
        </label>
        <p class="description">どのコードがよくコピーされているかを「コピー統計」で確認できます。</p>
        <?php
    }

    /**
     * 設定ページを表示
     */
    public function render_settings_page() {
        if (!current_user_can('manage_options')) {
            return;
        }

        if (isset($_GET['settings-updated'])) {
            add_settings_error(
                'kscc_messages',
                'kscc_message',
                '設定を保存しました。',
                'updated'
            );
        }

        settings_errors('kscc_messages');
        ?>
        <div class="wrap">
            <h1><?php echo esc_html(get_admin_page_title()); ?></h1>
            <form action="options.php" method="post">
                <?php
                settings_fields('kscc_settings_group');
                do_settings_sections('kashiwazaki-seo-code-clipper');
                submit_button('設定を保存');
                ?>
            </form>
        </div>
        <?php
    }

    /**
     * 統計ページを表示
     */
    public function render_stats_page() {
        if (!current_user_can('manage_options')) {
            return;
        }

        global $wpdb;
        $table_name = $wpdb->prefix . 'kscc_copy_stats';

        // テーブルが存在するか確認
        $table_exists = $wpdb->get_var($wpdb->prepare("SHOW TABLES LIKE %s", $table_name)) === $table_name;

        if (!$table_exists) {
            ?>
            <div class="wrap">
                <h1>コピー統計 - Kashiwazaki SEO Code Clipper</h1>
                <div class="notice notice-info">
                    <p>まだコピー統計データがありません。コピーボタンが使用されると、ここに統計が表示されます。</p>
                </div>
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
        <div class="wrap">
            <h1>コピー統計 - Kashiwazaki SEO Code Clipper</h1>

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
                <div class="notice notice-info">
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
            <?php endif; ?>
        </div>
        <?php
    }

    /**
     * 管理画面用アセットを読み込み
     */
    public function enqueue_admin_assets($hook) {
        if (!in_array($hook, array('toplevel_page_kashiwazaki-seo-code-clipper', 'kashiwazaki-seo-code-clipper_page_kashiwazaki-seo-code-clipper-stats'))) {
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
            '.kscc-code-wrapper pre {
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
        'target_mode' => 'all',
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
