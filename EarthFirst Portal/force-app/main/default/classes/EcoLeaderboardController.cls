public without sharing class EcoLeaderboardController {

    public class LeaderboardEntry {
        @AuraEnabled public Integer rank { get; set; }
        @AuraEnabled public String volunteerId { get; set; }
        @AuraEnabled public String volunteerName { get; set; }
        @AuraEnabled public String contactName { get; set; }
        @AuraEnabled public Integer totalPoints { get; set; }
        @AuraEnabled public String badgeTier { get; set; }
        @AuraEnabled public Integer totalCampaigns { get; set; }
    }

    @AuraEnabled(cacheable=true)
    public static List<LeaderboardEntry> getLeaderboard() {

        List<Volunteer__c> vols = [
            SELECT Id, Name, Total_Points__c, Badge_Tier__c, Total_Campaigns__c,
                   Citizen__r.FirstName, Citizen__r.LastName
            FROM Volunteer__c
            WHERE Total_Points__c > 0
            ORDER BY Total_Points__c DESC NULLS LAST
            LIMIT 10
        ];

        List<LeaderboardEntry> entries = new List<LeaderboardEntry>();
        Integer rank = 1;

        for (Volunteer__c vol : vols) {
            LeaderboardEntry entry = new LeaderboardEntry();
            entry.rank = rank;
            entry.volunteerId = vol.Id;
            entry.volunteerName = vol.Name;

            if (vol.Citizen__r != null) {
                entry.contactName = vol.Citizen__r.FirstName + ' ' + vol.Citizen__r.LastName;
            } else {
                entry.contactName = vol.Name;
            }

            entry.totalPoints = (Integer)(vol.Total_Points__c != null ? vol.Total_Points__c : 0);
            entry.badgeTier = vol.Badge_Tier__c != null ? vol.Badge_Tier__c : '🌱 Starter';
            entry.totalCampaigns = (Integer)(vol.Total_Campaigns__c != null ? vol.Total_Campaigns__c : 0);

            entries.add(entry);
            rank++;
        }

        return entries;
    }
}