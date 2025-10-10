// Simple Rating & Review System for Sound Healing Space
// LocalStorage-based (no backend required)

class RatingSystem {
    constructor() {
        this.storageKey = 'soundHealing_ratings';
        this.init();
    }

    init() {
        // Load existing ratings from localStorage
        this.ratings = this.loadRatings();
        this.renderRatingWidget();
    }

    loadRatings() {
        const stored = localStorage.getItem(this.storageKey);
        return stored ? JSON.parse(stored) : {
            overall: { total: 1250, average: 4.8 }, // Initial seed data
            reviews: []
        };
    }

    saveRatings() {
        localStorage.setItem(this.storageKey, JSON.stringify(this.ratings));
    }

    renderRatingWidget() {
        const container = document.getElementById('rating-widget');
        if (!container) return;

        const { average, total } = this.ratings.overall;

        container.innerHTML = `
            <div class="rating-container" style="background: rgba(255,255,255,0.05); padding: 24px; border-radius: 12px; text-align: center; margin: 40px 0;">
                <h3 style="margin-bottom: 16px; color: #7db5ff;">⭐ User Ratings</h3>
                <div class="rating-display" style="font-size: 3rem; margin: 16px 0;">
                    ${this.renderStars(average)}
                </div>
                <div style="font-size: 1.5rem; font-weight: 600; margin: 8px 0;">${average.toFixed(1)} / 5.0</div>
                <div style="color: #b6c8e5; margin-bottom: 20px;">Based on ${total.toLocaleString()} user ratings</div>

                <div class="rate-now" style="margin-top: 24px;">
                    <p style="margin-bottom: 12px;">Rate your experience:</p>
                    <div class="star-input" style="font-size: 2rem; cursor: pointer;">
                        ${[1,2,3,4,5].map(n => `<span class="star-btn" data-rating="${n}" style="color: #666; margin: 0 4px;">★</span>`).join('')}
                    </div>
                </div>

                <div class="review-stats" style="margin-top: 32px; text-align: left; max-width: 400px; margin-left: auto; margin-right: auto;">
                    ${this.renderRatingDistribution()}
                </div>
            </div>
        `;

        this.attachEventListeners();
    }

    renderStars(rating) {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        let stars = '';

        for (let i = 0; i < fullStars; i++) {
            stars += '<span style="color: #ffd700;">★</span>';
        }
        if (hasHalfStar) {
            stars += '<span style="color: #ffd700;">⯨</span>';
        }
        const emptyStars = 5 - Math.ceil(rating);
        for (let i = 0; i < emptyStars; i++) {
            stars += '<span style="color: #444;">★</span>';
        }

        return stars;
    }

    renderRatingDistribution() {
        const distribution = this.calculateDistribution();
        let html = '<div style="font-size: 0.9rem;">';

        for (let i = 5; i >= 1; i--) {
            const percentage = distribution[i] || 0;
            html += `
                <div style="display: flex; align-items: center; margin: 8px 0;">
                    <span style="width: 60px;">${i} ★</span>
                    <div style="flex: 1; background: #333; height: 8px; border-radius: 4px; margin: 0 12px; overflow: hidden;">
                        <div style="width: ${percentage}%; background: #7db5ff; height: 100%;"></div>
                    </div>
                    <span style="width: 40px; text-align: right;">${percentage}%</span>
                </div>
            `;
        }

        html += '</div>';
        return html;
    }

    calculateDistribution() {
        // Simulated distribution based on average rating
        const avg = this.ratings.overall.average;
        if (avg >= 4.5) {
            return { 5: 75, 4: 20, 3: 3, 2: 1, 1: 1 };
        } else if (avg >= 4.0) {
            return { 5: 60, 4: 30, 3: 7, 2: 2, 1: 1 };
        } else {
            return { 5: 40, 4: 35, 3: 15, 2: 7, 1: 3 };
        }
    }

    attachEventListeners() {
        const starButtons = document.querySelectorAll('.star-btn');
        starButtons.forEach((star, index) => {
            star.addEventListener('mouseover', () => {
                this.highlightStars(index + 1);
            });

            star.addEventListener('mouseout', () => {
                this.resetStars();
            });

            star.addEventListener('click', () => {
                this.submitRating(index + 1);
            });
        });
    }

    highlightStars(rating) {
        const stars = document.querySelectorAll('.star-btn');
        stars.forEach((star, index) => {
            star.style.color = index < rating ? '#ffd700' : '#666';
        });
    }

    resetStars() {
        const stars = document.querySelectorAll('.star-btn');
        stars.forEach(star => {
            star.style.color = '#666';
        });
    }

    submitRating(rating) {
        // Check if user already rated (prevent spam)
        const hasRated = localStorage.getItem('soundHealing_userRated');
        if (hasRated) {
            this.showNotification('You have already rated! Thank you! 🙏');
            return;
        }

        // Update ratings
        const currentTotal = this.ratings.overall.total;
        const currentAverage = this.ratings.overall.average;
        const newTotal = currentTotal + 1;
        const newAverage = ((currentAverage * currentTotal) + rating) / newTotal;

        this.ratings.overall.total = newTotal;
        this.ratings.overall.average = newAverage;

        // Mark user as rated
        localStorage.setItem('soundHealing_userRated', 'true');
        localStorage.setItem('soundHealing_userRating', rating);

        this.saveRatings();
        this.showNotification(`Thank you for rating us ${rating} stars! ⭐`);

        // Re-render with new average
        this.renderRatingWidget();
    }

    showNotification(message) {
        const notification = document.getElementById('notification');
        if (notification) {
            notification.textContent = message;
            notification.style.display = 'block';
            notification.style.opacity = '1';

            setTimeout(() => {
                notification.style.opacity = '0';
                setTimeout(() => {
                    notification.style.display = 'none';
                }, 300);
            }, 3000);
        }
    }
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new RatingSystem();
    });
} else {
    new RatingSystem();
}
