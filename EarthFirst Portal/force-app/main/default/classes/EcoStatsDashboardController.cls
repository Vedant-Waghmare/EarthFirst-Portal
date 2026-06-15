public with sharing class EcoStatsDashboardController {

    public class CommunityStats {
        @AuraEnabled public Integer totalIssues { get; set; }
        @AuraEnabled public Integer resolvedIssues { get; set; }
        @AuraEnabled public Integer resolutionRate { get; set; }
        @AuraEnabled public Integer totalInitiatives { get; set; }
        @AuraEnabled public Integer activeInitiatives { get; set; }
        @AuraEnabled public Integer upcomingInitiatives { get; set; }
        @AuraEnabled public Integer totalVolunteers { get; set; }
        @AuraEnabled public Integer activeVolunteers { get; set; }
        @AuraEnabled public Integer feedbacksReceived { get; set; }
    }

    @AuraEnabled(cacheable=false)
    public static CommunityStats getCommunityStats() {
        CommunityStats stats = new CommunityStats();

        stats.totalIssues = (Integer)[SELECT COUNT() FROM Case];
        stats.resolvedIssues = (Integer)[SELECT COUNT() FROM Case WHERE Status = 'Closed'];

        stats.resolutionRate = stats.totalIssues > 0
            ? (Integer)((stats.resolvedIssues * 100.0) / stats.totalIssues) : 0;

        stats.totalInitiatives = (Integer)[SELECT COUNT() FROM Initiative__c];
        stats.activeInitiatives = (Integer)[SELECT COUNT() FROM Initiative__c WHERE Status__c = 'Active'];
        stats.upcomingInitiatives = (Integer)[
            SELECT COUNT() FROM Initiative__c WHERE Status__c = 'Planning' AND Start_Date__c > TODAY
        ];

        stats.totalVolunteers = (Integer)[SELECT COUNT() FROM Volunteer__c];
        stats.activeVolunteers = (Integer)[SELECT COUNT() FROM Volunteer__c WHERE Status__c = 'Active'];
        stats.feedbacksReceived = (Integer)[SELECT COUNT() FROM Feedback__c];

        return stats;
    }
}