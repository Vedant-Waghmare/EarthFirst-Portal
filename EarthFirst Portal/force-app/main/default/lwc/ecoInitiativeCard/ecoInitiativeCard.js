import { LightningElement, api } from 'lwc';

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
    'Completed': 'badge badge-status-completed',
    'Cancelled': 'badge badge-status-cancelled'
};

export default class EcoInitiativeCard extends LightningElement {

    @api initiative;
    @api isExpanded = false;

    handleCardClick() {
        this.dispatchEvent(new CustomEvent('cardselect', {
            bubbles: true,
            composed: true,
            detail: { initiative: this.initiative }
        }));
    }

    get cardClass() {
        return 'initiative-card';
    }

    get typeBadgeClass() {
        return TYPE_BADGE_MAP[this.initiative.Initiative_Type__c] || 'badge badge-gray';
    }

    get statusBadgeClass() {
        return STATUS_BADGE_MAP[this.initiative.Status__c] || 'badge badge-gray';
    }

    get formattedStartDate() {
        if (!this.initiative.Start_Date__c) return 'TBD';
        return new Date(this.initiative.Start_Date__c)
            .toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    }

    get formattedEndDate() {
        if (!this.initiative.End_Date__c) return 'TBD';
        return new Date(this.initiative.End_Date__c)
            .toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    }

    get formattedBudget() {
        if (!this.initiative.Budget__c) return 'Not specified';
        return '₹ ' + Number(this.initiative.Budget__c).toLocaleString('en-IN');
    }

    get organiserName() {
        return this.initiative.Account__r ? this.initiative.Account__r.Name : 'EcoConnect';
    }

    get slotsRemaining() {
        const required = this.initiative.Volunteers_Required__c || 0;
        const registered = this.initiative.Volunteers_Registered__c || 0;
        const remaining = required - registered;
        return remaining > 0 ? remaining + ' open' : 'Full';
    }

    get slotFillStyle() {
        const required = this.initiative.Volunteers_Required__c || 1;
        const registered = this.initiative.Volunteers_Registered__c || 0;
        const pct = Math.min(Math.round((registered / required) * 100), 100);
        return 'width: ' + pct + '%;';
    }
}