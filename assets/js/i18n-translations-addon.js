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

                // Statistics Dashboard
                'stats.title': '收听统计',
                'stats.totalPlays': '总播放次数',
                'stats.totalTime': '累计收听时长',
                'stats.favorites': '收藏数量',
                'stats.avgPerDay': '日均播放',
                'stats.topCategories': '最常听的分类',
                'stats.last7Days': '最近7天',
                'stats.achievements': '成就系统',
                'stats.visualAnalysis': '可视化分析',
                'stats.categoryDistribution': '分类占比',
                'stats.trendAnalysis': '趋势分析',
                'stats.noData': '暂无分类数据',
                'stats.plays': '次',

                // Achievements
                'achievement.first_play.name': '初次体验',
                'achievement.first_play.desc': '播放第一首音频',
                'achievement.play_10.name': '音乐爱好者',
                'achievement.play_10.desc': '累计播放10次',
                'achievement.play_50.name': '疗愈达人',
                'achievement.play_50.desc': '累计播放50次',
                'achievement.play_100.name': '声音大师',
                'achievement.play_100.desc': '累计播放100次',
                'achievement.hour_1.name': '入门疗愈',
                'achievement.hour_1.desc': '累计收听1小时',
                'achievement.hour_10.name': '疗愈爱好者',
                'achievement.hour_10.desc': '累计收听10小时',
                'achievement.hour_50.name': '疗愈专家',
                'achievement.hour_50.desc': '累计收听50小时',
                'achievement.daily_streak_7.name': '7天坚持',
                'achievement.daily_streak_7.desc': '连续7天收听',
                'achievement.favorite_10.name': '收藏家',
                'achievement.favorite_10.desc': '收藏10个音频',
                'achievement.explorer.name': '探索者',
                'achievement.explorer.desc': '收听所有分类',
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

                // Statistics Dashboard
                'stats.title': 'Listening Statistics',
                'stats.totalPlays': 'Total Plays',
                'stats.totalTime': 'Total Listening Time',
                'stats.favorites': 'Favorites',
                'stats.avgPerDay': 'Daily Average',
                'stats.topCategories': 'Top Categories',
                'stats.last7Days': 'Last 7 Days',
                'stats.achievements': 'Achievements',
                'stats.visualAnalysis': 'Visual Analysis',
                'stats.categoryDistribution': 'Category Distribution',
                'stats.trendAnalysis': 'Trend Analysis',
                'stats.noData': 'No category data yet',
                'stats.plays': 'plays',

                // Achievements
                'achievement.first_play.name': 'First Experience',
                'achievement.first_play.desc': 'Played first audio',
                'achievement.play_10.name': 'Music Lover',
                'achievement.play_10.desc': 'Total 10 plays',
                'achievement.play_50.name': 'Healing Enthusiast',
                'achievement.play_50.desc': 'Total 50 plays',
                'achievement.play_100.name': 'Sound Master',
                'achievement.play_100.desc': 'Total 100 plays',
                'achievement.hour_1.name': 'Getting Started',
                'achievement.hour_1.desc': 'Listened for 1 hour',
                'achievement.hour_10.name': 'Healing Lover',
                'achievement.hour_10.desc': 'Listened for 10 hours',
                'achievement.hour_50.name': 'Healing Expert',
                'achievement.hour_50.desc': 'Listened for 50 hours',
                'achievement.daily_streak_7.name': '7-Day Streak',
                'achievement.daily_streak_7.desc': 'Listened for 7 consecutive days',
                'achievement.favorite_10.name': 'Collector',
                'achievement.favorite_10.desc': 'Favorited 10 audios',
                'achievement.explorer.name': 'Explorer',
                'achievement.explorer.desc': 'Listened to all categories',
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

                // Statistics Dashboard
                'stats.title': '再生統計',
                'stats.totalPlays': '総再生回数',
                'stats.totalTime': '累計再生時間',
                'stats.favorites': 'お気に入り数',
                'stats.avgPerDay': '1日平均',
                'stats.topCategories': 'よく聴くカテゴリー',
                'stats.last7Days': '過去7日間',
                'stats.achievements': '実績システム',
                'stats.visualAnalysis': 'ビジュアル分析',
                'stats.categoryDistribution': 'カテゴリー別分布',
                'stats.trendAnalysis': 'トレンド分析',
                'stats.noData': 'カテゴリーデータがありません',
                'stats.plays': '回',

                // Achievements
                'achievement.first_play.name': '初体験',
                'achievement.first_play.desc': '最初の音声を再生',
                'achievement.play_10.name': '音楽愛好家',
                'achievement.play_10.desc': '累計10回再生',
                'achievement.play_50.name': 'ヒーリング達人',
                'achievement.play_50.desc': '累計50回再生',
                'achievement.play_100.name': 'サウンドマスター',
                'achievement.play_100.desc': '累計100回再生',
                'achievement.hour_1.name': 'ヒーリング入門',
                'achievement.hour_1.desc': '累計1時間再生',
                'achievement.hour_10.name': 'ヒーリング愛好家',
                'achievement.hour_10.desc': '累計10時間再生',
                'achievement.hour_50.name': 'ヒーリング専門家',
                'achievement.hour_50.desc': '累計50時間再生',
                'achievement.daily_streak_7.name': '7日連続',
                'achievement.daily_streak_7.desc': '7日連続で再生',
                'achievement.favorite_10.name': 'コレクター',
                'achievement.favorite_10.desc': '10個の音声をお気に入り',
                'achievement.explorer.name': '探検家',
                'achievement.explorer.desc': 'すべてのカテゴリーを再生',
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

                // Statistics Dashboard
                'stats.title': '청취 통계',
                'stats.totalPlays': '총 재생 횟수',
                'stats.totalTime': '누적 청취 시간',
                'stats.favorites': '즐겨찾기 수',
                'stats.avgPerDay': '일평균 재생',
                'stats.topCategories': '자주 듣는 카테고리',
                'stats.last7Days': '최근 7일',
                'stats.achievements': '업적 시스템',
                'stats.visualAnalysis': '시각적 분석',
                'stats.categoryDistribution': '카테고리별 분포',
                'stats.trendAnalysis': '트렌드 분석',
                'stats.noData': '카테고리 데이터 없음',
                'stats.plays': '회',

                // Achievements
                'achievement.first_play.name': '첫 경험',
                'achievement.first_play.desc': '첫 오디오 재생',
                'achievement.play_10.name': '음악 애호가',
                'achievement.play_10.desc': '총 10회 재생',
                'achievement.play_50.name': '힐링 마니아',
                'achievement.play_50.desc': '총 50회 재생',
                'achievement.play_100.name': '사운드 마스터',
                'achievement.play_100.desc': '총 100회 재생',
                'achievement.hour_1.name': '힐링 입문',
                'achievement.hour_1.desc': '총 1시간 청취',
                'achievement.hour_10.name': '힐링 애호가',
                'achievement.hour_10.desc': '총 10시간 청취',
                'achievement.hour_50.name': '힐링 전문가',
                'achievement.hour_50.desc': '총 50시간 청취',
                'achievement.daily_streak_7.name': '7일 연속',
                'achievement.daily_streak_7.desc': '7일 연속 청취',
                'achievement.favorite_10.name': '컬렉터',
                'achievement.favorite_10.desc': '10개 오디오 즐겨찾기',
                'achievement.explorer.name': '탐험가',
                'achievement.explorer.desc': '모든 카테고리 청취',
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

                // Statistics Dashboard
                'stats.title': 'Estadísticas de Escucha',
                'stats.totalPlays': 'Total de Reproducciones',
                'stats.totalTime': 'Tiempo Total de Escucha',
                'stats.favorites': 'Favoritos',
                'stats.avgPerDay': 'Promedio Diario',
                'stats.topCategories': 'Categorías Principales',
                'stats.last7Days': 'Últimos 7 Días',
                'stats.achievements': 'Logros',
                'stats.visualAnalysis': 'Análisis Visual',
                'stats.categoryDistribution': 'Distribución por Categoría',
                'stats.trendAnalysis': 'Análisis de Tendencias',
                'stats.noData': 'Sin datos de categorías',
                'stats.plays': 'veces',

                // Achievements
                'achievement.first_play.name': 'Primera Experiencia',
                'achievement.first_play.desc': 'Reproducir primer audio',
                'achievement.play_10.name': 'Amante de la Música',
                'achievement.play_10.desc': 'Total 10 reproducciones',
                'achievement.play_50.name': 'Entusiasta de la Sanación',
                'achievement.play_50.desc': 'Total 50 reproducciones',
                'achievement.play_100.name': 'Maestro del Sonido',
                'achievement.play_100.desc': 'Total 100 reproducciones',
                'achievement.hour_1.name': 'Introducción a la Sanación',
                'achievement.hour_1.desc': 'Escuchado durante 1 hora',
                'achievement.hour_10.name': 'Amante de la Sanación',
                'achievement.hour_10.desc': 'Escuchado durante 10 horas',
                'achievement.hour_50.name': 'Experto en Sanación',
                'achievement.hour_50.desc': 'Escuchado durante 50 horas',
                'achievement.daily_streak_7.name': 'Racha de 7 Días',
                'achievement.daily_streak_7.desc': 'Escuchado durante 7 días consecutivos',
                'achievement.favorite_10.name': 'Coleccionista',
                'achievement.favorite_10.desc': '10 audios favoritos',
                'achievement.explorer.name': 'Explorador',
                'achievement.explorer.desc': 'Escuchado todas las categorías',
            }
        };

        // Extend existing translations
        Object.keys(cookieTranslations).forEach(lang => {
            const existingTranslations = window.i18n.translations.get(lang) || {};
            const mergedTranslations = {...existingTranslations, ...cookieTranslations[lang]};
            window.i18n.translations.set(lang, mergedTranslations);
        });

        // Re-apply current language to update Cookie banner
        if (window.i18n.currentLanguage && typeof window.i18n.updateDOM === 'function') {
            window.i18n.updateDOM();
        }

        console.log('✅ Cookie & Social sharing translations loaded');
    }
});
