/**
 * VolunteerParticipationTrigger
 *
 * Fires on Volunteer_Participation__c INSERT and UPDATE.
 *
 * Why both INSERT and UPDATE?
 *   INSERT → Volunteer joins an initiative → award 10 points (Registered)
 *   UPDATE → Officer marks attendance → award remaining points based on
 *            Attendance_Status__c change (Attended = +40, No Show = 0)
 *
 * Best Practice: Trigger contains NO logic — delegates entirely to
 * VolunteerParticipationTriggerHandler. This is the "thin trigger"
 * pattern — easy to test, maintain, and explain in a viva.
 */
trigger VolunteerParticipationTrigger on Volunteer_Participation__c (after insert, after update) {

    if (Trigger.isAfter) {
        if (Trigger.isInsert) {
            VolunteerParticipationTriggerHandler.onAfterInsert(Trigger.new);
        }
        if (Trigger.isUpdate) {
            VolunteerParticipationTriggerHandler.onAfterUpdate(Trigger.new, Trigger.oldMap);
        }
    }
}
