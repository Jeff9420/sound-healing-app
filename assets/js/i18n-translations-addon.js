/**
 * i18n Translation Add-ons
 * Cookie consent, Social sharing, and other missing translations
 * This file extends the base i18n system with additional translations
 */

// Wait for i18n system to be ready
document.addEventListener('DOMContentLoaded', () => {
    if (window.i18n) {
        // Add Cookie consent translations
        const cookieTranslations = {
            'zh-CN': {
                'cookie.title': '🍪 Cookie 偏好设置',
                'cookie.description': '我们使用 Cookie 来增强您的体验并分析网站流量。点击"接受全部"，即表示您同意我们使用 Cookie。',
                'cookie.acceptAll': '接受全部',
                'cookie.acceptAllDesc': '启用分析功能以获得更好的体验',
                'cookie.necessaryOnly': '仅必要',
                'cookie.necessaryOnlyDesc': '仅使用必要的 Cookie',
                'cookie.denyAll': '拒绝全部',
                'cookie.denyAllDesc': '除必要 Cookie 外不使用其他 Cookie',
                'cookie.preferences': '偏好设置',
                'cookie.acceptSelected': '接受选中',
                'cookie.privacyPolicy': '隐私政策',

                // Social sharing
                'share.title': '分享到社交媒体',
                'share.facebook': '分享到 Facebook',
                'share.twitter': '分享到 Twitter',
                'share.linkedin': '分享到 LinkedIn',
                'share.whatsapp': '分享到 WhatsApp',
                'share.email': '通过邮件分享',
                'share.copyLink': '复制链接',
                'share.linkCopied': '链接已复制到剪贴板',
                'share.close': '关闭',

                // GDPR/CCPA compliance
                'compliance.gdpr': '符合GDPR规定',
                'compliance.ccpa': '符合CCPA规定',
                'compliance.dataRights': '数据权利请求',
                'compliance.deleteData': '删除我的数据',
                'compliance.exportData': '导出我的数据',
                'compliance.optOut': '选择退出',
            },

            'en-US': {
                'cookie.title': '🍪 Cookie Preferences',
                'cookie.description': 'We use cookies to enhance your experience and analyze our traffic. By clicking "Accept All", you consent to our use of cookies.',
                'cookie.acceptAll': 'Accept All',
                'cookie.acceptAllDesc': 'Enables analytics for better experience',
                'cookie.necessaryOnly': 'Necessary Only',
                'cookie.necessaryOnlyDesc': 'Essential cookies only',
                'cookie.denyAll': 'Deny All',
                'cookie.denyAllDesc': 'No cookies except essentials',
                'cookie.preferences': 'Preferences',
                'cookie.acceptSelected': 'Accept Selected',
                'cookie.privacyPolicy': 'Privacy Policy',

                // Social sharing
                'share.title': 'Share to Social Media',
                'share.facebook': 'Share on Facebook',
                'share.twitter': 'Share on Twitter',
                'share.linkedin': 'Share on LinkedIn',
                'share.whatsapp': 'Share on WhatsApp',
                'share.email': 'Share via Email',
                'share.copyLink': 'Copy Link',
                'share.linkCopied': 'Link copied to clipboard',
                'share.close': 'Close',

                // GDPR/CCPA compliance
                'compliance.gdpr': 'GDPR Compliant',
                'compliance.ccpa': 'CCPA Compliant',
                'compliance.dataRights': 'Data Rights Request',
                'compliance.deleteData': 'Delete My Data',
                'compliance.exportData': 'Export My Data',
                'compliance.optOut': 'Opt Out',
            },

            'ja-JP': {
                'cookie.title': '🍪 Cookie設定',
                'cookie.description': 'ユーザー体験を向上させ、トラフィックを分析するためにCookieを使用しています。「すべて許可」をクリックすると、Cookieの使用に同意したことになります。',
                'cookie.acceptAll': 'すべて許可',
                'cookie.acceptAllDesc': 'より良い体験のために分析を有効にする',
                'cookie.necessaryOnly': '必要なもののみ',
                'cookie.necessaryOnlyDesc': '必須のCookieのみ',
                'cookie.denyAll': 'すべて拒否',
                'cookie.denyAllDesc': '必須Cookie以外は使用しない',
                'cookie.preferences': '設定',
                'cookie.acceptSelected': '選択したものを許可',
                'cookie.privacyPolicy': 'プライバシーポリシー',

                // Social sharing
                'share.title': 'ソーシャルメディアで共有',
                'share.facebook': 'Facebookで共有',
                'share.twitter': 'Twitterで共有',
                'share.linkedin': 'LinkedInで共有',
                'share.whatsapp': 'WhatsAppで共有',
                'share.email': 'メールで共有',
                'share.copyLink': 'リンクをコピー',
                'share.linkCopied': 'リンクをコピーしました',
                'share.close': '閉じる',

                // GDPR/CCPA compliance
                'compliance.gdpr': 'GDPR準拠',
                'compliance.ccpa': 'CCPA準拠',
                'compliance.dataRights': 'データ権限リクエスト',
                'compliance.deleteData': 'データを削除',
                'compliance.exportData': 'データをエクスポート',
                'compliance.optOut': 'オプトアウト',
            },

            'ko-KR': {
                'cookie.title': '🍪 쿠키 설정',
                'cookie.description': '사용자 경험을 향상시키고 트래픽을 분석하기 위해 쿠키를 사용합니다. "모두 허용"을 클릭하면 쿠키 사용에 동의하게 됩니다.',
                'cookie.acceptAll': '모두 허용',
                'cookie.acceptAllDesc': '더 나은 경험을 위한 분석 활성화',
                'cookie.necessaryOnly': '필수만 허용',
                'cookie.necessaryOnlyDesc': '필수 쿠키만 사용',
                'cookie.denyAll': '모두 거부',
                'cookie.denyAllDesc': '필수 쿠키 외에는 사용 안 함',
                'cookie.preferences': '설정',
                'cookie.acceptSelected': '선택 항목 허용',
                'cookie.privacyPolicy': '개인정보 처리방침',

                // Social sharing
                'share.title': '소셜 미디어 공유',
                'share.facebook': 'Facebook에 공유',
                'share.twitter': 'Twitter에 공유',
                'share.linkedin': 'LinkedIn에 공유',
                'share.whatsapp': 'WhatsApp으로 공유',
                'share.email': '이메일로 공유',
                'share.copyLink': '링크 복사',
                'share.linkCopied': '링크가 복사되었습니다',
                'share.close': '닫기',

                // GDPR/CCPA compliance
                'compliance.gdpr': 'GDPR 준수',
                'compliance.ccpa': 'CCPA 준수',
                'compliance.dataRights': '데이터 권한 요청',
                'compliance.deleteData': '내 데이터 삭제',
                'compliance.exportData': '내 데이터 내보내기',
                'compliance.optOut': '수신 거부',
            },

            'es-ES': {
                'cookie.title': '🍪 Preferencias de Cookies',
                'cookie.description': 'Utilizamos cookies para mejorar su experiencia y analizar nuestro tráfico. Al hacer clic en "Aceptar todo", usted consiente el uso de cookies.',
                'cookie.acceptAll': 'Aceptar todo',
                'cookie.acceptAllDesc': 'Habilita análisis para una mejor experiencia',
                'cookie.necessaryOnly': 'Solo necesarias',
                'cookie.necessaryOnlyDesc': 'Solo cookies esenciales',
                'cookie.denyAll': 'Rechazar todo',
                'cookie.denyAllDesc': 'Sin cookies excepto las esenciales',
                'cookie.preferences': 'Preferencias',
                'cookie.acceptSelected': 'Aceptar selección',
                'cookie.privacyPolicy': 'Política de privacidad',

                // Social sharing
                'share.title': 'Compartir en redes sociales',
                'share.facebook': 'Compartir en Facebook',
                'share.twitter': 'Compartir en Twitter',
                'share.linkedin': 'Compartir en LinkedIn',
                'share.whatsapp': 'Compartir en WhatsApp',
                'share.email': 'Compartir por correo',
                'share.copyLink': 'Copiar enlace',
                'share.linkCopied': 'Enlace copiado al portapapeles',
                'share.close': 'Cerrar',

                // GDPR/CCPA compliance
                'compliance.gdpr': 'Cumple con GDPR',
                'compliance.ccpa': 'Cumple con CCPA',
                'compliance.dataRights': 'Solicitud de derechos de datos',
                'compliance.deleteData': 'Eliminar mis datos',
                'compliance.exportData': 'Exportar mis datos',
                'compliance.optOut': 'Darse de baja',
            }
        };

        // Extend existing translations
        Object.keys(cookieTranslations).forEach(lang => {
            const existingTranslations = window.i18n.translations.get(lang) || {};
            const mergedTranslations = {...existingTranslations, ...cookieTranslations[lang]};
            window.i18n.translations.set(lang, mergedTranslations);
        });

        // Re-apply current language to update Cookie banner
        if (window.i18n.currentLanguage) {
            window.i18n.updateDOM();
        }

        console.log('✅ Cookie & Social sharing translations loaded');
    }
});
