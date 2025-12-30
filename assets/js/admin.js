(function($) {
    'use strict';

    /**
     * Kashiwazaki SEO Code Clipper - Admin JavaScript
     */

    $(document).ready(function() {
        // カラーピッカーを初期化
        $('.kscc-color-picker').wpColorPicker();

        // ラジオカードの選択状態を制御
        var radioCards = $('.kscc-radio-card');
        var targetModeRadios = $('input[name="kscc_options[target_mode]"]');
        var classInputRow = $('.kscc-class-input-row');

        function updateRadioCardState() {
            radioCards.removeClass('selected');
            radioCards.each(function() {
                var radio = $(this).find('input[type="radio"]');
                if (radio.is(':checked')) {
                    $(this).addClass('selected');
                }
            });
        }

        function toggleClassInputField() {
            var selectedMode = $('input[name="kscc_options[target_mode]"]:checked').val();
            if (selectedMode === 'class_only') {
                classInputRow.slideDown(200);
            } else {
                classInputRow.slideUp(200);
            }
        }

        // 初期状態を設定
        updateRadioCardState();
        // 初期状態では slideDown/Up を使わない
        var initialMode = $('input[name="kscc_options[target_mode]"]:checked').val();
        if (initialMode === 'class_only') {
            classInputRow.show();
        } else {
            classInputRow.hide();
        }

        // ラジオボタンの変更時に切り替え
        targetModeRadios.on('change', function() {
            updateRadioCardState();
            toggleClassInputField();
        });

        // ラジオカード全体をクリック可能に
        radioCards.on('click', function(e) {
            // ラジオボタン自体をクリックした場合は自然に処理される
            if ($(e.target).is('input[type="radio"]')) {
                return;
            }
            // カード内のラジオボタンを選択
            var radio = $(this).find('input[type="radio"]');
            radio.prop('checked', true).trigger('change');
        });
    });

})(jQuery);
