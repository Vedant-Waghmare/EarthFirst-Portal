import { LightningElement, track } from 'lwc';
import getImpactData from '@salesforce/apex/EcoImpactSummaryController.getImpactData';
import getMyCases from '@salesforce/apex/EcoImpactSummaryController.getMyCases';
import getMyInitiatives from '@salesforce/apex/EcoImpactSummaryController.getMyInitiatives';

const TIER_THRESHOLDS = [0, 100, 300, 700];
const TIER_NAMES = ['🌱 Starter', '🧭 Explorer', '🏆 Achiever', '🌟 Legend'];

export default class EcoImpactSummary extends LightningElement {

    @track impactData = {};
    @track isLoading = true;
    @track hasError = false;
    @track errorMessage = '';
    @track showCases = false;
    @track showInitiatives = false;
    @track cases = [];
    @track initiatives = [];
    @track panelLoading = false;

    connectedCallback() { this.loadImpact(); }

    async loadImpact() {
        try {
            this.isLoading = true;
            this.hasError = false;
            this.impactData = await getImpactData();
        } catch (error) {
            this.hasError = true;
            this.errorMessage = error.body ? error.body.message : error.message;
        } finally {
            this.isLoading = false;
        }
    }

    async handleCasesClick() {
        this.showCases = true;
        if (this.cases.length > 0) return;
        this.panelLoading = true;
        try {
            const result = await getMyCases();
            this.cases = result.map(c => ({
                ...c,
                formattedDate: c.CreatedDate
                    ? new Date(c.CreatedDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                    : '',
                statusClass: c.Status === 'Closed'      ? 'pill pill-closed'
                           : c.Status === 'In Progress' ? 'pill pill-progress'
                           : 'pill pill-new'
            }));
        } finally {
            this.panelLoading = false;
        }
    }

    async handleInitiativesClick() {
        this.showInitiatives = true;
        if (this.initiatives.length > 0) return;
        this.panelLoading = true;
        try {
            const result = await getMyInitiatives();
            this.initiatives = result.map(vp => {
                const ini = vp.Initiative__r || {};
                return {
                    ...vp,
                    initiativeName: ini.Name || '—',
                    initiativeStatus: ini.Status__c || '—',
                    startDate: ini.Start_Date__c
                        ? new Date(ini.Start_Date__c).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                        : '—',
                    attendanceClass: vp.Attendance_Status__c === 'Attended' ? 'pill pill-attended'
                                   : vp.Attendance_Status__c === 'No Show'  ? 'pill pill-noshow'
                                   : 'pill pill-registered'
                };
            });
        } finally {
            this.panelLoading = false;
        }
    }

    closeCasesModal()       { this.showCases = false; }
    closeInitiativesModal() { this.showInitiatives = false; }

    get hasCases()       { return this.cases.length > 0; }
    get hasInitiatives() { return this.initiatives.length > 0; }
    get currentPoints()  { return this.impactData?.totalPoints || 0; }
    get badgeEmoji()     { return (this.impactData?.badgeTier || '').split(' ')[0] || '🌱'; }
    get badgeLabel()     { return (this.impactData?.badgeTier || '').split(' ').slice(1).join(' ') || 'Starter'; }
    get isMaxTier()      { return this.currentTierIndex === 3; }
    get nextTierName()   { return this.isMaxTier ? '' : TIER_NAMES[this.currentTierIndex + 1]; }
    get pointsToNextTier() { return this.isMaxTier ? 0 : TIER_THRESHOLDS[this.currentTierIndex + 1] - this.currentPoints; }

    get currentTierIndex() {
        const pts = this.currentPoints;
        if (pts >= 700) return 3;
        if (pts >= 300) return 2;
        if (pts >= 100) return 1;
        return 0;
    }

    get progressFillStyle() {
        let pct = 100;
        if (!this.isMaxTier) {
            const min = TIER_THRESHOLDS[this.currentTierIndex];
            const max = TIER_THRESHOLDS[this.currentTierIndex + 1];
            pct = Math.min(Math.round(((this.currentPoints - min) / (max - min)) * 100), 100);
        }
        return `width:${pct}%; height:100%; background:linear-gradient(90deg,#1a6b52,#34d399); border-radius:99px;`;
    }

    get casesCardClass()       { return this.showCases ? 'stat-card stat-orange stat-card-active' : 'stat-card stat-orange stat-card-clickable'; }
    get initiativesCardClass() { return this.showInitiatives ? 'stat-card stat-green stat-card-active' : 'stat-card stat-green stat-card-clickable'; }

    tierEmojiStyle(i) {
        const base = 'font-size:1.6rem; line-height:1; display:block;';
        return this.currentTierIndex >= i ? base : base + 'opacity:0.25; filter:grayscale(1);';
    }
    tierLabelStyle(i) {
        return this.currentTierIndex >= i
            ? 'font-size:0.65rem; font-weight:600; text-transform:uppercase; color:#0d4a3a;'
            : 'font-size:0.65rem; font-weight:600; text-transform:uppercase; color:#d1d5db;';
    }

        get tier0EmojiStyle() { return this.tierEmojiStyle(0); }
        get tier1EmojiStyle() { return this.tierEmojiStyle(1); }
        get tier2EmojiStyle() { return this.tierEmojiStyle(2); }
        get tier3EmojiStyle() { return this.tierEmojiStyle(3); }
        get tier0LabelStyle() { return this.tierLabelStyle(0); }
        get tier1LabelStyle() { return this.tierLabelStyle(1); }
        get tier2LabelStyle() { return this.tierLabelStyle(2); }
        get tier3LabelStyle() { return this.tierLabelStyle(3); }
    }