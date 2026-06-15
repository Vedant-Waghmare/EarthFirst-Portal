import { LightningElement, track } from 'lwc';
import getFeedbackContext from '@salesforce/apex/EcoGiveFeedbackController.getFeedbackContext';
import createFeedback from '@salesforce/apex/EcoGiveFeedbackController.createFeedback';

// maps numeric rating to picklist value stored in Salesforce
const RATING_MAP = {
    1: '1-Very Poor',
    2: '2-Poor',
    3: '3-Average',
    4: '4-Good',
    5: '5-Excellent'
};

const RATING_LABELS = {
    1: '😞 Very Poor',
    2: '😕 Poor',
    3: '😐 Average',
    4: '😊 Good',
    5: '🤩 Excellent'
};

export default class EcoGiveFeedback extends LightningElement {

    @track isLoading = true;
    @track isSubmitting = false;
    @track isSubmitted = false;
    @track hasError = false;
    @track hasLoadError = false;
    @track errorMessage = '';

    @track caseOptions = [];
    @track initiativeOptions = [];

    @track feedbackType = '';
    @track selectedRating = 0;
    @track hoveredRating = 0;
    @track comments = '';
    @track selectedCase = '';
    @track selectedInit = '';

    @track ratingError = '';
    @track commentsError = '';

    @track submittedStars = '';
    @track submittedRatingLabel = '';

    connectedCallback() {
        this.loadContext();
    }

    async loadContext() {
        try {
            const result = await getFeedbackContext();
            if (result.error) {
                this.hasLoadError = true;
                this.errorMessage = result.error;
            } else {
                this.caseOptions = result.cases || [];
                this.initiativeOptions = result.initiatives || [];
            }
        } catch (e) {
            this.hasLoadError = true;
            this.errorMessage = 'Unable to load feedback form. Please try again.';
        } finally {
            this.isLoading = false;
        }
    }

    get feedbackTypeOptions() {
        const types = [
            { value: 'Initiative', label: 'Initiative', icon: '🌿' },
            { value: 'Case Resolution', label: 'Case Resolution', icon: '📋' }
        ];
        return types.map(t => ({
            ...t,
            cssClass: t.value === this.feedbackType ? 'type-btn type-btn-active' : 'type-btn'
        }));
    }

    get starOptions() {
        const active = this.hoveredRating || this.selectedRating;
        return [1, 2, 3, 4, 5].map(n => ({
            value: n,
            cssClass: n <= active ? 'star-btn star-filled' : 'star-btn'
        }));
    }

    get showCaseDropdown() { return this.feedbackType === 'Case Resolution' && this.caseOptions.length > 0; }
    get showInitDropdown() { return this.feedbackType === 'Initiative' && this.initiativeOptions.length > 0; }
    get noCases()          { return this.feedbackType === 'Case Resolution' && this.caseOptions.length === 0; }
    get noInitiatives()    { return this.feedbackType === 'Initiative' && this.initiativeOptions.length === 0; }
    get showForm()         { return !this.isLoading && !this.hasLoadError && !this.isSubmitted; }

    get selectedRatingLabel() {
        const active = this.hoveredRating || this.selectedRating;
        return active ? RATING_LABELS[active] : '';
    }

    get commentsRequired() { return this.selectedRating > 0 && this.selectedRating <= 2; }
    get commentsLength()   { return this.comments ? this.comments.length : 0; }
    get commentsClass()    { return this.commentsError ? 'field-textarea field-textarea-error' : 'field-textarea'; }

    handleTypeClick(event) {
        this.feedbackType = event.currentTarget.dataset.value;
        this.selectedCase = '';
        this.selectedInit = '';
    }

    handleStarHover(event) { this.hoveredRating = parseInt(event.currentTarget.dataset.value, 10); }
    handleStarLeave()      { this.hoveredRating = 0; }

    handleStarClick(event) {
        this.selectedRating = parseInt(event.currentTarget.dataset.value, 10);
        this.ratingError = '';
        this.commentsError = '';
    }

    handleCommentsChange(event) {
        this.comments = event.target.value;
        this.commentsError = '';
    }

    handleCaseChange(event) { this.selectedCase = event.target.value; }
    handleInitChange(event) { this.selectedInit = event.target.value; }

    validate() {
        let valid = true;
        if (!this.selectedRating) {
            this.ratingError = 'Please select a star rating.';
            valid = false;
        }
        if (this.commentsRequired && !this.comments.trim()) {
            this.commentsError = 'Comments are required for ratings of 2 or below.';
            valid = false;
        }
        return valid;
    }

    async handleSubmit() {
        if (!this.validate()) return;

        this.isSubmitting = true;
        this.hasError = false;

        try {
            await createFeedback({
                rating: RATING_MAP[this.selectedRating],
                comments: this.comments.trim(),
                caseId: this.selectedCase,
                initiativeId: this.selectedInit
            });

            this.submittedStars = '★'.repeat(this.selectedRating) + '☆'.repeat(5 - this.selectedRating);
            this.submittedRatingLabel = RATING_LABELS[this.selectedRating];
            this.isSubmitted = true;

        } catch (error) {
            this.hasError = true;
            this.errorMessage = error.body ? error.body.message : 'Something went wrong. Please try again.';
        } finally {
            this.isSubmitting = false;
        }
    }

    // reset everything so user can submit again
    handleSubmitAnother() {
        this.isSubmitted = false;
        this.feedbackType = '';
        this.selectedRating = 0;
        this.hoveredRating = 0;
        this.comments = '';
        this.selectedCase = '';
        this.selectedInit = '';
        this.ratingError = '';
        this.commentsError = '';
        this.hasError = false;
        this.errorMessage = '';
    }
}