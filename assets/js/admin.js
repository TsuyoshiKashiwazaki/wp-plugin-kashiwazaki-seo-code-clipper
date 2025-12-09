(function($) {
    'use strict';

    /**
     * Kashiwazaki SEO Code Clipper - Admin JavaScript
     */

    $(document).ready(function() {
        // カラーピッカーを初期化
        $('.kscc-color-picker').wpColorPicker();

        // ターゲットモードの切り替え時にクラス入力フィールドの表示を制御
        var targetModeRadios = $('input[name="kscc_options[target_mode]"]');
        var targetClassField = $('input[name="kscc_options[target_class]"]').closest('tr');

        function toggleTargetClassField() {
            var selectedMode = $('input[name="kscc_options[target_mode]"]:checked').val();
            if (selectedMode === 'class') {
                targetClassField.show();
            } else {
                targetClassField.hide();
            }
        }

        // 初期状態を設定
        toggleTargetClassField();

        // ラジオボタンの変更時に切り替え
        targetModeRadios.on('change', toggleTargetClassField);
    });

})(jQuery);
