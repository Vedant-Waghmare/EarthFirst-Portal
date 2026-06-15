trigger EcoVolunteerNotificationTrigger on Volunteer__c (after update) {
    EcoNotificationService.onPointsEarned(Trigger.new, Trigger.oldMap);
}
