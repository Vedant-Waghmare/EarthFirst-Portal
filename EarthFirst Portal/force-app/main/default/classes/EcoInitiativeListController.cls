public without sharing class EcoInitiativeListController {

    @AuraEnabled(cacheable=false)
    public static List<Initiative__c> getInitiatives(String typeFilter, String statusFilter) {

        String query = 'SELECT Id, Name, Initiative_Type__c, Status__c, Start_Date__c, End_Date__c, ' +
                       'Volunteers_Required__c, Volunteers_Registered__c, Budget__c, ' +
                       'Account__r.Name, Minimum_Age__c FROM Initiative__c WHERE Id != null';

        if (String.isNotBlank(typeFilter) && typeFilter != 'All') {
            query += ' AND Initiative_Type__c = :typeFilter';
        }
        if (String.isNotBlank(statusFilter) && statusFilter != 'All') {
            query += ' AND Status__c = :statusFilter';
        }

        query += ' ORDER BY Start_Date__c ASC NULLS LAST LIMIT 50';

        return Database.query(query);
    }

    @AuraEnabled
    public static String joinInitiative(Id initiativeId) {

        User u = [SELECT ContactId FROM User WHERE Id = :UserInfo.getUserId() LIMIT 1];
        if (u.ContactId == null) {
            throw new AuraHandledException('No contact linked to your account.');
        }

        Initiative__c ini = [SELECT Id, Status__c FROM Initiative__c WHERE Id = :initiativeId LIMIT 1];
        if (ini.Status__c == 'Completed') return 'completed';

        List<Volunteer__c> vols = [
            SELECT Id FROM Volunteer__c
            WHERE Citizen__c = :u.ContactId AND Status__c = 'Active' LIMIT 1
        ];
        if (vols.isEmpty()) return 'not_volunteer';

        List<Volunteer_Participation__c> existing = [
            SELECT Id FROM Volunteer_Participation__c
            WHERE Volunteer__c = :vols[0].Id AND Initiative__c = :initiativeId LIMIT 1
        ];
        if (!existing.isEmpty()) return 'already_registered';

        try {
            insert new Volunteer_Participation__c(
                Volunteer__c = vols[0].Id,
                Initiative__c = initiativeId,
                Attendance_Status__c = 'Registered',
                Registration_Date__c = Date.today()
            );
            return 'success';
        } catch (DmlException e) {
            throw new AuraHandledException(e.getDmlMessage(0));
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
}