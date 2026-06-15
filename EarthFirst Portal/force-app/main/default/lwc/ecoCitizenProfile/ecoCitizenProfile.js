import { LightningElement, track, wire } from 'lwc';
import { getRecord, updateRecord } from 'lightning/uiRecordApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

import getCurrentContactId from '@salesforce/apex/EcoCitizenProfileController.getCurrentContactId';
import getVolunteerDetails from '@salesforce/apex/EcoCitizenProfileController.getVolunteerDetails';

import FIRSTNAME_FIELD   from '@salesforce/schema/Contact.FirstName';
import LASTNAME_FIELD    from '@salesforce/schema/Contact.LastName';
import EMAIL_FIELD       from '@salesforce/schema/Contact.Email';
import PHONE_FIELD       from '@salesforce/schema/Contact.Phone';
import MOBILE_FIELD      from '@salesforce/schema/Contact.MobilePhone';
import ISVOLUNTEER_FIELD from '@salesforce/schema/Contact.Is_Volunteer__c';

const CONTACT_FIELDS = [FIRSTNAME_FIELD, LASTNAME_FIELD, EMAIL_FIELD, PHONE_FIELD, MOBILE_FIELD, ISVOLUNTEER_FIELD];

const TIERS = [
    { name: '🌱 Starter',  emoji: '🌱', min: 0   },
    { name: '🧭 Explorer', emoji: '🧭', min: 100  },
    { name: '🏆 Achiever', emoji: '🏆', min: 300  },
    { name: '🌟 Legend',   emoji: '🌟', min: 700  }
];

export default class EcoCitizenProfile extends LightningElement {

    @track contactId = null;
    @track contactRecord = null;
    @track volunteerData = null;
    @track isLoading = true;
    @track hasError = false;
    @track errorMessage = '';
    @track isVolunteerLoading = false;

    connectedCallback() {
        this.loadContactId();
    }

    async loadContactId() {
        try {
            this.contactId = await getCurrentContactId();
            if (!this.contactId) {
                this.hasError = true;
                this.errorMessage = 'No Contact record linked to your user account.';
            }
        } catch (error) {
            this.hasError = true;
            this.errorMessage = error.body ? error.body.message : error.message;
        } finally {
            this.isLoading = false;
        }
    }

    @wire(getRecord, { recordId: '$contactId', fields: CONTACT_FIELDS })
    wiredContact({ data, error }) {
        if (data) {
            this.contactRecord = data;
            if (data.fields.Is_Volunteer__c.value === true) {
                this.loadVolunteerDetails();
            }
        } else if (error) {
            this.hasError = true;
            this.errorMessage = error.body ? error.body.message : 'Failed to load profile.';
        }
    }

    async loadVolunteerDetails() {
        try {
            this.isVolunteerLoading = true;
            this.volunteerData = await getVolunteerDetails({ contactId: this.contactId });
        } catch (error) {
            console.error('Volunteer load error:', error);
        } finally {
            this.isVolunteerLoading = false;
        }
    }

    // basic getters for contact fields
    get firstName()   { return this.contactRecord?.fields?.FirstName?.value   || ''; }
    get lastName()    { return this.contactRecord?.fields?.LastName?.value    || ''; }
    get email()       { return this.contactRecord?.fields?.Email?.value       || ''; }
    get phone()       { return this.contactRecord?.fields?.Phone?.value       || '—'; }
    get isVolunteer() { return this.contactRecord?.fields?.Is_Volunteer__c?.value === true; }
    get fullName()    { return `${this.firstName} ${this.lastName}`.trim() || 'My Profile'; }

    get avatarInitials() {
        const f = this.firstName?.charAt(0)?.toUpperCase() || '';
        const l = this.lastName?.charAt(0)?.toUpperCase() || '';
        return f + l || '?';
    }

    get skillsList() {
        if (!this.volunteerData?.Skills__c) return [];
        return this.volunteerData.Skills__c.split(';').map(s => s.trim()).filter(Boolean);
    }

    get formattedEnrollmentDate() {
        if (!this.volunteerData?.Registration_Date__c) return '—';
        return new Date(this.volunteerData.Registration_Date__c)
            .toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    }

    get formattedLastCampaignDate() {
        if (!this.volunteerData?.Last_Campaign_Date__c) return 'None yet';
        return new Date(this.volunteerData.Last_Campaign_Date__c)
            .toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    }

    get currentPoints() {
        return this.volunteerData?.Total_Points__c || 0;
    }

    get currentTierIndex() {
        const pts = this.currentPoints;
        if (pts >= 700) return 3;
        if (pts >= 300) return 2;
        if (pts >= 100) return 1;
        return 0;
    }

    get isMaxTier() { return this.currentTierIndex === 3; }

    get tierEmoji() { return TIERS[this.currentTierIndex].emoji; }

    get pointsToNextTier() {
        if (this.isMaxTier) return 0;
        return TIERS[this.currentTierIndex + 1].min - this.currentPoints;
    }

    get tierProgressStyle() {
        let pct = 100;
        if (!this.isMaxTier) {
            const cur = TIERS[this.currentTierIndex].min;
            const next = TIERS[this.currentTierIndex + 1].min;
            pct = Math.min(Math.round(((this.currentPoints - cur) / (next - cur)) * 100), 100);
        }
        return `width:${pct}%; height:100%; background:linear-gradient(90deg,#34d399,#86efac); border-radius:99px; transition:width 0.4s ease;`;
    }

    get currentTierLabel() {
        return TIERS[this.currentTierIndex].name.split(' ').slice(1).join(' ');
    }

    get nextTierName() {
        if (this.isMaxTier) return '';
        return TIERS[this.currentTierIndex + 1].name;
    }

    get nextTierLabel() {
        if (this.isMaxTier) return '';
        return TIERS[this.currentTierIndex + 1].name.split(' ').slice(1).join(' ');
    }

    // milestone styles for the 4 tier icons in the progress band
    milestoneStyle(index) {
        const reached = this.currentTierIndex >= index;
        const base = 'width:36px; height:36px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:1.1rem; margin:0 auto;';
        if (reached) {
            return base + 'background:rgba(255,255,255,0.25); border:2px solid rgba(255,255,255,0.6); box-shadow:0 0 12px rgba(134,239,172,0.5);';
        }
        return base + 'background:rgba(255,255,255,0.07); border:2px solid rgba(255,255,255,0.15); opacity:0.5;';
    }

    get milestone0Style() { return this.milestoneStyle(0); }
    get milestone1Style() { return this.milestoneStyle(1); }
    get milestone2Style() { return this.milestoneStyle(2); }
    get milestone3Style() { return this.milestoneStyle(3); }
}