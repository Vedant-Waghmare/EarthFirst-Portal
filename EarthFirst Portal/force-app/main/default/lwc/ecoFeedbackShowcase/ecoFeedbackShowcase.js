import { LightningElement, track } from 'lwc';
import getFeedbackData from '@salesforce/apex/EcoFeedbackShowcaseController.getFeedbackData';

const STARS = {
    '5': '★★★★★',
    '4': '★★★★☆',
    '3': '★★★☆☆',
    '2': '★★☆☆☆',
    '1': '★☆☆☆☆',
    '0': '☆☆☆☆☆'
};

export default class EcoFeedbackShowcase extends LightningElement {

    @track isLoading = true;
    @track activeFilter = 'All';
    @track allFeedbacks = [];
    @track totalCount = 0;
    @track averageRating = '0.0';
    @track ratingCounts = {};

    connectedCallback() {
        this.loadData();
    }

    async loadData() {
        try {
            this.isLoading = true;
            const result = await getFeedbackData({ filterType: this.activeFilter });

            this.totalCount = result.total;
            this.averageRating = String(result.average);
            this.ratingCounts = result.ratingCounts;

            this.allFeedbacks = (result.feedbacks || []).map(fb => ({
                ...fb,
                stars: STARS[fb.rating] || STARS['0'],
                formattedDate: fb.date
                    ? new Date(fb.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                    : ''
            }));
        } catch (e) {
            this.allFeedbacks = [];
        } finally {
            this.isLoading = false;
        }
    }

    handleFilterChange(event) {
        const val = event.currentTarget.dataset.value;
        if (val === this.activeFilter) return;
        this.activeFilter = val;
        this.loadData();
    }

    get isEmpty() { return !this.isLoading && this.allFeedbacks.length === 0; }

    get averageStars() {
        const n = Math.round(parseFloat(this.averageRating));
        return '★'.repeat(n) + '☆'.repeat(5 - n);
    }

    get ratingBreakdown() {
        return ['5', '4', '3', '2', '1'].map(star => {
            const count = this.ratingCounts[star] || 0;
            const pct = this.totalCount > 0 ? Math.round((count / this.totalCount) * 100) : 0;
            return {
                star,
                count,
                barStyle: `width:${pct}%; height:100%; background:#34d399; border-radius:99px;`
            };
        });
    }

    // tab active class helpers
    get tabAllClass()        { return this.activeFilter === 'All'         ? 'tab tab-active' : 'tab'; }
    get tabInitiativeClass() { return this.activeFilter === 'Initiative'  ? 'tab tab-active' : 'tab'; }
    get tabCaseClass()       { return this.activeFilter === 'Case'        ? 'tab tab-active' : 'tab'; }
}