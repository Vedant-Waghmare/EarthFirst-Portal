public without sharing class EcoGiveFeedbackController {

    @AuraEnabled(cacheable=false)
    public static Map<String, Object> getFeedbackContext() {
        Map<String, Object> result = new Map<String, Object>();
        try {
            User currentUser = [
                SELECT ContactId
                FROM User
                WHERE Id = :UserInfo.getUserId()
                LIMIT 1
            ];

            if (currentUser.ContactId == null) {
                result.put('error', 'Your profile is not linked to a citizen record.');
                return result;
            }

            result.put('contactId', currentUser.ContactId);

            List<Map<String, String>> caseOptions = new List<Map<String, String>>();
            for (Case c : [
                SELECT Id, Subject, CaseNumber
                FROM Case
                WHERE ContactId = :currentUser.ContactId
                AND Status != 'Closed'
                ORDER BY CreatedDate DESC
                LIMIT 20
            ]) {
                caseOptions.add(new Map<String, String>{
                    'value' => c.Id,
                    'label' => c.Subject != null ? c.Subject : c.CaseNumber
                });
            }
            result.put('cases', caseOptions);
            List<Map<String, String>> initiativeOptions = new List<Map<String, String>>();
            List<Volunteer__c> vols = [
                SELECT Id FROM Volunteer__c
                WHERE Citizen__c = :currentUser.ContactId
                LIMIT 1
            ];

            Set<Id> addedInitIds = new Set<Id>();

            if (!vols.isEmpty()) {
                for (Volunteer_Participation__c vp : [
                    SELECT Initiative__c, Initiative__r.Name, Initiative__r.Initiative_Name__c
                    FROM Volunteer_Participation__c
                    WHERE Volunteer__c = :vols[0].Id
                    AND Initiative__r.Status__c != 'Cancelled'
                    ORDER BY Registration_Date__c DESC
                    LIMIT 50
                ]) {
                    if (vp.Initiative__c != null && !addedInitIds.contains(vp.Initiative__c)) {
                        addedInitIds.add(vp.Initiative__c);
                        String initName = vp.Initiative__r.Initiative_Name__c != null
                            ? vp.Initiative__r.Initiative_Name__c
                            : vp.Initiative__r.Name;
                        initiativeOptions.add(new Map<String, String>{
                            'value' => vp.Initiative__c,
                            'label' => initName
                        });
                    }
                }
            }

            if (initiativeOptions.isEmpty()) {
                for (Initiative__c ini : [
                    SELECT Id, Name, Initiative_Name__c
                    FROM Initiative__c
                    WHERE Status__c IN ('Planning', 'Active', 'Ongoing')
                    ORDER BY Start_Date__c DESC
                    LIMIT 20
                ]) {
                    String initName = ini.Initiative_Name__c != null
                        ? ini.Initiative_Name__c
                        : ini.Name;
                    initiativeOptions.add(new Map<String, String>{
                        'value' => ini.Id,
                        'label' => initName
                    });
                }
            }
            result.put('initiatives', initiativeOptions);

        } catch (Exception e) {
            result.put('error', e.getMessage());
        }
        return result;
    }

    @AuraEnabled
    public static String createFeedback(
        String rating,
        String comments,
        String caseId,
        String initiativeId
    ) {
        try {
            User currentUser = [
                SELECT ContactId
                FROM User
                WHERE Id = :UserInfo.getUserId()
                LIMIT 1
            ];

            if (currentUser.ContactId == null) {
                throw new AuraHandledException(
                    'Your profile is not linked to a citizen record. Please contact support.'
                );
            }

            Feedback__c newFeedback = new Feedback__c(
                Submitted_By_Citizen__c = currentUser.ContactId,
                Rating__c               = rating,
                Comments__c             = comments,
                Feedback_Date__c        = Date.today()
            );

            if (String.isNotBlank(caseId)) {
                newFeedback.Related_to_Case__c = caseId;
            }
            if (String.isNotBlank(initiativeId)) {
                newFeedback.Related_to_Initiative__c = initiativeId;
            }

            insert newFeedback;
            return newFeedback.Id;

        } catch (AuraHandledException e) {
            throw e;
        } catch (Exception e) {
            throw new AuraHandledException(
                'Unable to submit feedback: ' + e.getMessage()
            );
        }
    }
}