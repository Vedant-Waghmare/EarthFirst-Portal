trigger EcoCaseNotificationTrigger on Case (after update) {
    EcoNotificationService.onCaseResolved(Trigger.new, Trigger.oldMap);
}
