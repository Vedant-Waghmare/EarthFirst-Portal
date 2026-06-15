import { LightningElement, track } from 'lwc';
import checkVolunteerStatus from '@salesforce/apex/EcoJoinVolunteerController.checkVolunteerStatus';
import createVolunteer from '@salesforce/apex/EcoJoinVolunteerController.createVolunteer';

const SKILL_OPTIONS = [
    { value: 'Tree Planting', label: 'Tree Planting', icon: '🌳' },
    { value: 'Waste Mgmt',    label: 'Waste Mgmt',    icon: '♻️' },
    { value: 'Awareness',     label: 'Awareness',     icon: '📢' },
    { value: 'First Aid',     label: 'First Aid',     icon: '🏥' },
    { value: 'Recycling',     label: 'Recycling',     icon: '🔄' }
];

const AVAIL_OPTIONS = [
    { value: 'Weekdays', label: 'Weekdays', icon: '💼', desc: 'Mon – Fri'     },
    { value: 'Weekends', label: 'Weekends', icon: '🌅', desc: 'Sat & Sun'     },
    { value: 'Both',     label: 'Both',     icon: '📅', desc: 'Anytime works' }
];

export default class EcoJoinVolunteer extends LightningElement {

    @track currentStep = 1;
    @track isChecking = true;
    @track isAlreadyVolunteer = false;
    @track isSubmitted = false;
    @track isSubmitting = false;
    @track hasError = false;
    @track hasLoadError = false;
    @track errorMessage = '';
    @track loadErrorMessage = '';
    @track volunteerStatus = '';
    @track submittedVolunteerId = '';

    @track selectedSkills = [];
    @track availability = '';
    @track tShirtSize = '';
    @track emergencyName = '';
    @track emergencyPhone = '';

    @track skillsError = '';
    @track availabilityError = '';
    @track emergencyPhoneError = '';

    connectedCallback() {
        this.checkStatus();
    }

    async checkStatus() {
        try {
            const result = await checkVolunteerStatus();
            if (result.error) {
                this.hasLoadError = true;
                this.loadErrorMessage = result.error;
            } else if (result.isVolunteer) {
                this.isAlreadyVolunteer = true;
                this.volunteerStatus = result.status;
            }
        } catch (e) {
            this.hasLoadError = true;
            this.loadErrorMessage = 'Unable to check volunteer status. Please try again.';
        } finally {
            this.isChecking = false;
        }
    }

    get skillOptions() {
        return SKILL_OPTIONS.map(s => ({
            ...s,
            cssClass: this.selectedSkills.includes(s.value) ? 'skill-btn skill-btn-active' : 'skill-btn'
        }));
    }

    get availabilityOptions() {
        return AVAIL_OPTIONS.map(o => ({
            ...o,
            cssClass: o.value === this.availability ? 'avail-btn avail-btn-active' : 'avail-btn'
        }));
    }

    get tshirtOptions() {
        return ['XS', 'S', 'M', 'L', 'XL', 'XXL'].map(size => ({
            value: size,
            label: size,
            cssClass: size === this.tShirtSize ? 'tshirt-btn tshirt-btn-active' : 'tshirt-btn'
        }));
    }

    get isStep1() { return this.currentStep === 1; }
    get isStep2() { return this.currentStep === 2; }
    get isActiveVolunteer() { return this.volunteerStatus === 'Active'; }

    get showForm() {
        return !this.isChecking && !this.hasLoadError && !this.isAlreadyVolunteer && !this.isSubmitted;
    }

    get stepCircle1() { return this.currentStep >= 1 ? 'step-circle step-circle-active' : 'step-circle'; }
    get stepCircle2() { return this.currentStep >= 2 ? 'step-circle step-circle-active' : 'step-circle'; }
    get progressLine() { return this.currentStep >= 2 ? 'progress-line progress-line-active' : 'progress-line'; }

    get selectedSkillsDisplay() {
        return this.selectedSkills.length > 0 ? this.selectedSkills.join(', ') : 'None selected';
    }

    get emergencyPhoneClass() {
        return this.emergencyPhoneError ? 'field-input field-input-error' : 'field-input';
    }

    handleSkillClick(event) {
        const val = event.currentTarget.dataset.value;
        const idx = this.selectedSkills.indexOf(val);
        // toggle — add if not present, remove if already selected
        this.selectedSkills = idx === -1
            ? [...this.selectedSkills, val]
            : this.selectedSkills.filter(s => s !== val);
        this.skillsError = '';
    }

    handleAvailabilityClick(event) {
        this.availability = event.currentTarget.dataset.value;
        this.availabilityError = '';
    }

    handleTshirtClick(event) { this.tShirtSize = event.currentTarget.dataset.value; }

    handleEmergencyNameChange(event)  { this.emergencyName = event.target.value; }
    handleEmergencyPhoneChange(event) {
        this.emergencyPhone = event.target.value;
        this.emergencyPhoneError = '';
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
        if (this.selectedSkills.length === 0) {
            this.skillsError = 'Please select at least one skill.';
            valid = false;
        }
        if (!this.availability) {
            this.availabilityError = 'Please select your availability.';
            valid = false;
        }
        return valid;
    }

    validateStep2() {
        if (this.emergencyPhone && !/^\d{10}$/.test(this.emergencyPhone)) {
            this.emergencyPhoneError = 'Please enter a valid 10-digit phone number.';
            return false;
        }
        return true;
    }

    async handleSubmit() {
        if (!this.validateStep2()) return;

        this.isSubmitting = true;
        this.hasError = false;

        try {
            const volunteerId = await createVolunteer({
                skills: this.selectedSkills.join(';'),
                availability: this.availability,
                tShirtSize: this.tShirtSize,
                emergencyName: this.emergencyName.trim(),
                emergencyPhone: this.emergencyPhone.trim()
            });

            this.submittedVolunteerId = volunteerId
                ? 'VOL-' + volunteerId.substring(0, 6).toUpperCase()
                : 'Registered';
            this.isSubmitted = true;

        } catch (error) {
            this.hasError = true;
            this.errorMessage = error.body ? error.body.message : 'Something went wrong. Please try again.';
        } finally {
            this.isSubmitting = false;
        }
    }
}