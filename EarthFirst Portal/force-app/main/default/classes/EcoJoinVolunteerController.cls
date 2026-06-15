public without sharing class EcoJoinVolunteerController {

    @AuraEnabled(cacheable=false)
    public static Map<String, Object> checkVolunteerStatus() {
        Map<String, Object> result = new Map<String, Object>();
        try {
            User u = [SELECT ContactId FROM User WHERE Id = :UserInfo.getUserId() LIMIT 1];

            if (u.ContactId == null) {
                result.put('error', 'Your profile is not linked to a citizen record.');
                return result;
            }

            result.put('contactId', u.ContactId);

            List<Volunteer__c> existing = [
                SELECT Id, Status__c, Registration_Date__c
                FROM Volunteer__c WHERE Citizen__c = :u.ContactId LIMIT 1
            ];

            if (!existing.isEmpty()) {
                result.put('isVolunteer', true);
                result.put('status', existing[0].Status__c);
            } else {
                result.put('isVolunteer', false);
            }

        } catch (Exception e) {
            result.put('error', e.getMessage());
        }
        return result;
    }

    @AuraEnabled
    public static String createVolunteer(
        String skills,
        String availability,
        String tShirtSize,
        String emergencyName,
        String emergencyPhone
    ) {
        try {
            User u = [
                SELECT ContactId, Contact.FirstName, Contact.LastName
                FROM User WHERE Id = :UserInfo.getUserId() LIMIT 1
            ];

            if (u.ContactId == null) {
                throw new AuraHandledException('Your profile is not linked to a citizen record. Please contact support.');
            }

            List<Volunteer__c> existing = [
                SELECT Id FROM Volunteer__c WHERE Citizen__c = :u.ContactId LIMIT 1
            ];
            if (!existing.isEmpty()) {
                throw new AuraHandledException('You are already registered as a volunteer.');
            }

            String fullName = (u.Contact.FirstName != null ? u.Contact.FirstName + ' ' : '') + u.Contact.LastName;

            Volunteer__c vol = new Volunteer__c(
                Name = fullName,
                Citizen__c = u.ContactId,
                Skills__c = skills,
                Availability__c = availability,
                T_Shirt_Size__c = tShirtSize,
                Emergency_Contact_Name__c = emergencyName,
                Emergency_Contact_Number__c = emergencyPhone,
                Status__c = 'Inactive',
                Registration_Date__c = Date.today()
            );

            insert vol;
            return vol.Id;

        } catch (AuraHandledException e) {
            throw e;
        } catch (Exception e) {
            throw new AuraHandledException('Unable to register as volunteer: ' + e.getMessage());
        }
    }
}