public without sharing class EcoImpactSummaryController {

    public class ImpactData {
        @AuraEnabled public Integer issuesReported { get; set; }
        @AuraEnabled public Integer initiativesJoined { get; set; }
        @AuraEnabled public Integer totalPoints { get; set; }
        @AuraEnabled public String badgeTier { get; set; }
        @AuraEnabled public String volunteerName { get; set; }
        @AuraEnabled public Boolean isVolunteer { get; set; }
    }

    @AuraEnabled(cacheable=true)
    public static ImpactData getImpactData() {
        ImpactData data = new ImpactData();
        data.isVolunteer = false;
        data.totalPoints = 0;
        data.badgeTier = '';
        data.volunteerName = '';

        User u = [SELECT ContactId FROM User WHERE Id = :UserInfo.getUserId() LIMIT 1];
        Id contactId = u.ContactId;
        if (contactId == null) return data;

        // count number of cases reported by this citizen
        AggregateResult[] caseResult = [SELECT COUNT(Id) total FROM Case WHERE ContactId = :contactId];
        data.issuesReported = (Integer) caseResult[0].get('total');

        List<Volunteer__c> vols = [
            SELECT Id, Name, Total_Points__c, Badge_Tier__c
            FROM Volunteer__c WHERE Citizen__c = :contactId LIMIT 1
        ];

        if (!vols.isEmpty()) {
            Volunteer__c vol = vols[0];
            data.isVolunteer = true;
            data.volunteerName = vol.Name;
            data.totalPoints = (Integer)(vol.Total_Points__c != null ? vol.Total_Points__c : 0);
            data.badgeTier = vol.Badge_Tier__c != null ? vol.Badge_Tier__c : '🌱 Starter';

            AggregateResult[] partResult = [
                SELECT COUNT(Id) total FROM Volunteer_Participation__c WHERE Volunteer__c = :vol.Id
            ];
            data.initiativesJoined = (Integer) partResult[0].get('total');
        } else {
            data.initiativesJoined = 0;
        }

        return data;
    }

    // returns cases reported by the logged in citizen
    @AuraEnabled(cacheable=false)
    public static List<Case> getMyCases() {
        User u = [SELECT ContactId FROM User WHERE Id = :UserInfo.getUserId() LIMIT 1];
        if (u.ContactId == null) return new List<Case>();

        return [
            SELECT Id, CaseNumber, Subject, Status, Severity_Level__c, Issue_Category__c, CreatedDate
            FROM Case
            WHERE ContactId = :u.ContactId
            ORDER BY CreatedDate DESC LIMIT 50
        ];
    }

    // returns initiatives the volunteer has joined
    @AuraEnabled(cacheable=false)
    public static List<Volunteer_Participation__c> getMyInitiatives() {
        User u = [SELECT ContactId FROM User WHERE Id = :UserInfo.getUserId() LIMIT 1];
        if (u.ContactId == null) return new List<Volunteer_Participation__c>();

        List<Volunteer__c> vols = [SELECT Id FROM Volunteer__c WHERE Citizen__c = :u.ContactId LIMIT 1];
        if (vols.isEmpty()) return new List<Volunteer_Participation__c>();

        return [
            SELECT Id, Initiative__r.Name, Initiative__r.Status__c,
                    Initiative__r.Start_Date__c, Attendance_Status__c, Registration_Date__c
            FROM Volunteer_Participation__c
            WHERE Volunteer__c = :vols[0].Id
            ORDER BY Registration_Date__c DESC LIMIT 50
        ];
    }
}