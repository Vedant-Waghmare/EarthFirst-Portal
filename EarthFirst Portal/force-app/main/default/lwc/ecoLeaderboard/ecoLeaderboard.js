import { LightningElement, track } from 'lwc';
import getLeaderboard from '@salesforce/apex/EcoLeaderboardController.getLeaderboard';

export default class EcoLeaderboard extends LightningElement {

    @track entries = [];
    @track isLoading = true;
    @track hasError = false;
    @track errorMessage = '';

    connectedCallback() {
        this.loadLeaderboard();
    }

    async loadLeaderboard() {
        try {
            this.isLoading = true;
            this.hasError = false;
            this.entries = await getLeaderboard();
        } catch (error) {
            this.hasError = true;
            this.errorMessage = error.body ? error.body.message : error.message;
        } finally {
            this.isLoading = false;
        }
    }

    // podium getters for top 3
    get first()  { return this.entries[0] || null; }
    get second() { return this.entries[1] || null; }
    get third()  { return this.entries[2] || null; }

    get restEntries() { return this.entries.slice(3); }

    get hasTopThree() { return this.entries.length > 0; }
    get hasRest()     { return this.entries.length > 3; }
    get isEmpty()     { return !this.isLoading && !this.hasError && this.entries.length === 0; }
}