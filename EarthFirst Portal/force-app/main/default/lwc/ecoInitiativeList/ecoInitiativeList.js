import { LightningElement, track } from 'lwc';
import getInitiatives from '@salesforce/apex/EcoInitiativeListController.getInitiatives';
import joinInitiative from '@salesforce/apex/EcoInitiativeListController.joinInitiative';

const TYPE_BADGE_MAP = {
    'Clean-up Drive':      'badge badge-orange',
    'Tree Planting':       'badge badge-green',
    'Water Conservation':  'badge badge-blue',
    'Wildlife Protection': 'badge badge-teal',
    'Awareness':           'badge badge-purple',
    'Other':               'badge badge-gray'
};

const STATUS_BADGE_MAP = {
    'Active':    'badge badge-status-active',
    'Planning':  'badge badge-status-planning',
    'Ongoing':   'badge badge-status-ongoing',
    'Completed': 'badge badge-status-completed',
    'Cancelled': 'badge badge-status-cancelled'
};

export default class EcoInitiativeList extends LightningElement {

    @track initiatives = [];
    @track isLoading = true;
    @track hasError = false;
    @track errorMessage = '';
    @track activeFilter = 'All';
    @track activeStatusFilter = '';
    @track showModal = false;
    @track showJoinModal = false;
    @track selectedInitiative = null;

    @track isJoining = false;
    @track joinResult = null;
    @track joinErrorMessage = '';

    connectedCallback() {
        this.loadInitiatives();
    }

    async loadInitiatives() {
        try {
            this.isLoading = true;
            this.hasError = false;
            const result = await getInitiatives({
                typeFilter: this.activeFilter,
                statusFilter: this.activeStatusFilter
            });
            this.initiatives = result.map(rec => ({ ...rec }));
        } catch (error) {
            this.hasError = true;
            this.errorMessage = error.body ? error.body.message : error.message;
        } finally {
            this.isLoading = false;
        }
    }

    handleFilterClick(event) {
        const val = event.currentTarget.dataset.value;
        if (val === this.activeFilter) return;
        this.activeFilter = val;
        this.loadInitiatives();
    }

    // toggle off if same status clicked again
    handleStatusFilterClick(event) {
        const val = event.currentTarget.dataset.value;
        this.activeStatusFilter = val === this.activeStatusFilter ? '' : val;
        this.loadInitiatives();
    }

    handleCardSelect(event) {
        this.selectedInitiative = event.detail.initiative;
        this.showModal = true;
    }

    closeModal() {
        this.showModal = false;
        this.selectedInitiative = null;
    }

    openJoinModal() {
        this.showModal = false;
        this.joinResult = null;
        this.joinErrorMessage = '';
        this.showJoinModal = true;
    }

    closeJoinModal() {
        this.showJoinModal = false;
        this.joinResult = null;
    }

    async handleJoinInitiative() {
        if (!this.selectedInitiative) return;
        this.isJoining = true;
        this.joinResult = null;

        try {
            const result = await joinInitiative({ initiativeId: this.selectedInitiative.Id });
            this.joinResult = result;
            if (result === 'success') this.loadInitiatives();
        } catch (error) {
            this.joinResult = 'error';
            this.joinErrorMessage = error.body ? error.body.message : 'Something went wrong. Please try again.';
        } finally {
            this.isJoining = false;
        }
    }

    get isEmpty() {
        return !this.isLoading && !this.hasError && this.initiatives.length === 0;
    }

    get filterOptions() {
        const options = ['All', 'Clean-up Drive', 'Tree Planting', 'Water Conservation', 'Wildlife Protection', 'Awareness'];
        return options.map(opt => ({
            value: opt,
            label: opt,
            cssClass: opt === this.activeFilter ? 'filter-btn filter-btn-active' : 'filter-btn'
        }));
    }

    get statusFilterOptions() {
        return ['Active', 'Planning', 'Completed'].map(s => ({
            value: s,
            label: s,
            cssClass: s === this.activeStatusFilter ? 'filter-btn filter-btn-active' : 'filter-btn'
        }));
    }

    // join state getters
    get showJoinButton()    { return !this.joinResult && !this.isJoining; }
    get showJoinComponent() { return this.showJoinModal && !!this.selectedInitiative; }
    get isJoinSuccess()     { return this.joinResult === 'success'; }
    get isAlreadyJoined()   { return this.joinResult === 'already_registered'; }
    get isNotVolunteer()    { return this.joinResult === 'not_volunteer'; }
    get isInitCompleted()   { return this.joinResult === 'completed'; }
    get isJoinError()       { return this.joinResult === 'error'; }

    get modalTypeBadge() {
        return TYPE_BADGE_MAP[this.selectedInitiative?.Initiative_Type__c] || 'badge badge-gray';
    }

    get modalStatusBadge() {
        return STATUS_BADGE_MAP[this.selectedInitiative?.Status__c] || 'badge badge-gray';
    }

    get modalSlotsLeft() {
        const req = this.selectedInitiative?.Volunteers_Required__c || 0;
        const reg = this.selectedInitiative?.Volunteers_Registered__c || 0;
        return Math.max(req - reg, 0);
    }

    get modalSlotStyle() {
        const req = this.selectedInitiative?.Volunteers_Required__c || 1;
        const reg = this.selectedInitiative?.Volunteers_Registered__c || 0;
        const pct = Math.min(Math.round((reg / req) * 100), 100);
        return 'width:' + pct + '%;';
    }

    formatDate(dateStr) {
        if (!dateStr) return 'TBD';
        return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    }

    get modalStartDate() { return this.formatDate(this.selectedInitiative?.Start_Date__c); }
    get modalEndDate()   { return this.formatDate(this.selectedInitiative?.End_Date__c); }
    get modalOrganiser() { return this.selectedInitiative?.Account__r?.Name || 'EcoConnect'; }

    get modalMinAge() {
        const age = this.selectedInitiative?.Minimum_Age__c;
        return age ? age + ' years' : 'No restriction';
    }

    get modalBudget() {
        if (!this.selectedInitiative?.Budget__c) return 'Not specified';
        return '₹ ' + Number(this.selectedInitiative.Budget__c).toLocaleString('en-IN');
    }
}