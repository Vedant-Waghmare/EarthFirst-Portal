import { LightningElement, track } from 'lwc';
import createCase from '@salesforce/apex/EcoReportIssueController.createCase';

const CATEGORIES = [
    { value: 'Illegal Dumping', label: 'Illegal Dumping', icon: '🗑️' },
    { value: 'Water Pollution', label: 'Water Pollution', icon: '💧' },
    { value: 'Air Pollution',   label: 'Air Pollution',   icon: '🏭' },
    { value: 'Noise Pollution', label: 'Noise Pollution', icon: '🔊' },
    { value: 'Deforestation',   label: 'Deforestation',   icon: '🌲' },
    { value: 'Other',           label: 'Other',           icon: '📌' }
];

const SEVERITIES = [
    { value: 'Low',      label: 'Low',      icon: '🟢', desc: 'Minor issue, not urgent'   },
    { value: 'Medium',   label: 'Medium',   icon: '🟡', desc: 'Needs attention soon'      },
    { value: 'High',     label: 'High',     icon: '🟠', desc: 'Affects community daily'   },
    { value: 'Critical', label: 'Critical', icon: '🔴', desc: 'Immediate action required' }
];

export default class EcoReportIssue extends LightningElement {

    @track currentStep = 1;
    @track isSubmitting = false;
    @track isSubmitted = false;
    @track hasError = false;
    @track errorMessage = '';
    @track submittedCaseNumber = '';

    @track subject = '';
    @track description = '';
    @track issueCategory = '';
    @track severityLevel = '';

    @track subjectError = '';
    @track categoryError = '';
    @track severityError = '';

    get categoryOptions() {
        return CATEGORIES.map(cat => ({
            ...cat,
            cssClass: cat.value === this.issueCategory ? 'cat-btn cat-btn-active' : 'cat-btn'
        }));
    }

    get severityOptions() {
        return SEVERITIES.map(sev => ({
            ...sev,
            cssClass: sev.value === this.severityLevel ? 'sev-btn sev-btn-active' : 'sev-btn'
        }));
    }

    get isStep1() { return this.currentStep === 1; }
    get isStep2() { return this.currentStep === 2; }

    get stepCircle1() { return this.currentStep >= 1 ? 'step-circle step-circle-active' : 'step-circle'; }
    get stepCircle2() { return this.currentStep >= 2 ? 'step-circle step-circle-active' : 'step-circle'; }
    get progressLine() { return this.currentStep >= 2 ? 'progress-line progress-line-active' : 'progress-line'; }
    get subjectClass() { return this.subjectError ? 'field-input field-input-error' : 'field-input'; }
    get descriptionLength() { return this.description ? this.description.length : 0; }

    handleSubjectChange(event) {
        this.subject = event.target.value;
        this.subjectError = '';
    }

    handleDescriptionChange(event) { this.description = event.target.value; }

    handleCategoryClick(event) {
        this.issueCategory = event.currentTarget.dataset.value;
        this.categoryError = '';
    }

    handleSeverityClick(event) {
        this.severityLevel = event.currentTarget.dataset.value;
        this.severityError = '';
    }

    handleStep1Next() {
        if (!this.validateStep1()) return;
        this.currentStep = 2;
    }

    handleBack() {
        this.currentStep = 1;
        this.hasError = false;
        this.errorMessage = '';
    }

    validateStep1() {
        let valid = true;
        if (!this.subject || this.subject.trim().length < 5) {
            this.subjectError = 'Please enter a title of at least 5 characters.';
            valid = false;
        }
        if (!this.issueCategory) {
            this.categoryError = 'Please select an issue category.';
            valid = false;
        }
        return valid;
    }

    validateStep2() {
        if (!this.severityLevel) {
            this.severityError = 'Please select a severity level.';
            return false;
        }
        return true;
    }

    async handleSubmit() {
        if (!this.validateStep2()) return;

        this.isSubmitting = true;
        this.hasError = false;

        try {
            const caseId = await createCase({
                subject: this.subject.trim(),
                description: this.description.trim(),
                issueCategory: this.issueCategory,
                severityLevel: this.severityLevel
            });

            this.submittedCaseNumber = caseId
                ? 'ECO-' + caseId.substring(0, 8).toUpperCase()
                : 'Submitted';
            this.isSubmitted = true;

        } catch (error) {
            this.hasError = true;
            this.errorMessage = error.body ? error.body.message : 'Something went wrong. Please try again.';
        } finally {
            this.isSubmitting = false;
        }
    }

    // reset form so user can submit another report
    handleReportAnother() {
        this.currentStep = 1;
        this.isSubmitted = false;
        this.subject = '';
        this.description = '';
        this.issueCategory = '';
        this.severityLevel = '';
        this.subjectError = '';
        this.categoryError = '';
        this.severityError = '';
        this.hasError = false;
        this.errorMessage = '';
    }
}