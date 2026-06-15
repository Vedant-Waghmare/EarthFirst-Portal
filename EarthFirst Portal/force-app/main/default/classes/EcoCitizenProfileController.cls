public without sharing class EcoCitizenProfileController {

    @AuraEnabled(cacheable=true)
    public static Id getCurrentContactId() {
        User currentUser = [
            SELECT ContactId
            FROM   User
            WHERE  Id = :UserInfo.getUserId()
            LIMIT  1
        ];
        return currentUser.ContactId;
    }

    @AuraEnabled(cacheable=true)
    public static Volunteer__c getVolunteerDetails(Id contactId) {
        if (contactId == null) return null;

        List<Volunteer__c> volunteers = [
            SELECT  Id,
                    Name,
                    Skills__c,
                    Availability__c,
                    Status__c,
                    Registration_Date__c,
                    Total_Campaigns__c,
                    Last_Campaign_Date__c,
                    Total_Points__c,
                    Badge_Tier__c
            FROM    Volunteer__c
            WHERE   Citizen__c = :contactId
            LIMIT   1
        ];

        return volunteers.isEmpty() ? null : volunteers[0];
    }
}