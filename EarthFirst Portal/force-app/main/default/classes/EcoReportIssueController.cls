public without sharing class EcoReportIssueController {

    @AuraEnabled
    public static String createCase(
        String subject,
        String description,
        String issueCategory,
        String severityLevel
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

            Case newCase = new Case(
                Subject           = subject,
                Description       = description,
                Issue_Category__c = issueCategory,
                Severity_Level__c = severityLevel,
                ContactId         = currentUser.ContactId,
                Origin            = 'Web',
                Status            = 'New'
            );

            insert newCase;

            return newCase.Id;

        } catch (AuraHandledException e) {
            throw e;
        } catch (Exception e) {
            throw new AuraHandledException(
                'Unable to submit your report: ' + e.getMessage()
            );
        }
    }
}