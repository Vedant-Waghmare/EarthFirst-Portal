import { LightningElement, track } from 'lwc';
import getCommunityStats from '@salesforce/apex/EcoStatsDashboardController.getCommunityStats';

export default class EcoStatsDashboard extends LightningElement {

    @track stats = {};
    @track isLoading = true;
    @track hasError = false;
    @track errorMessage = '';

    connectedCallback() {
        this.loadStats();
    }

    async loadStats() {
        try {
            this.isLoading = true;
            this.hasError = false;
            this.stats = await getCommunityStats();
        } catch (error) {
            this.hasError = true;
            this.errorMessage = error.body ? error.body.message : error.message;
        } finally {
            this.isLoading = false;
        }
    }

    // helper to format numbers and percentages
    fmt(val)    { return (val ?? 0) + '+'; }
    fmtPct(val) { return (val ?? 0) + '%'; }

    get statCards() {
        const s = this.stats;
        return [
            { key: 'totalIssues',        emoji: '🌍', label: 'Issues Reported',       displayValue: this.fmt(s.totalIssues) },
            { key: 'resolvedIssues',     emoji: '✅', label: 'Cases Resolved',         displayValue: this.fmt(s.resolvedIssues) },
            { key: 'resolutionRate',     emoji: '📊', label: 'Resolution Rate',        displayValue: this.fmtPct(s.resolutionRate) },
            { key: 'totalInitiatives',   emoji: '🌿', label: 'Total Green Initiatives',displayValue: this.fmt(s.totalInitiatives) },
            { key: 'activeInitiatives',  emoji: '🏃', label: 'Active Initiatives',     displayValue: this.fmt(s.activeInitiatives) },
            { key: 'upcomingInitiatives',emoji: '📅', label: 'Upcoming Initiatives',   displayValue: this.fmt(s.upcomingInitiatives) },
            { key: 'totalVolunteers',    emoji: '👥', label: 'Total Volunteers',       displayValue: this.fmt(s.totalVolunteers) },
            { key: 'activeVolunteers',   emoji: '🙋', label: 'Active Volunteers',      displayValue: this.fmt(s.activeVolunteers) },
            { key: 'feedbacksReceived',  emoji: '💬', label: 'Feedbacks Received',     displayValue: this.fmt(s.feedbacksReceived) }
        ];
    }
}