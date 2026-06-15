public without sharing class VolunteerParticipationTriggerHandler {

    private static final Integer POINTS_JOIN = 10;
    private static final Integer POINTS_ATTEND = 40;

    public static void onAfterInsert(List<Volunteer_Participation__c> newList) {
        Map<Id, Integer> pointsMap = new Map<Id, Integer>();

        for (Volunteer_Participation__c vp : newList) {
            if (vp.Volunteer__c == null) continue;
            Integer pts = pointsMap.containsKey(vp.Volunteer__c) ? pointsMap.get(vp.Volunteer__c) : 0;
            pointsMap.put(vp.Volunteer__c, pts + POINTS_JOIN);
        }

        if (!pointsMap.isEmpty()) {
            awardPoints(pointsMap);
        }
    }

    public static void onAfterUpdate(List<Volunteer_Participation__c> newList, Map<Id, Volunteer_Participation__c> oldMap) {
        Map<Id, Integer> pointsMap = new Map<Id, Integer>();

        for (Volunteer_Participation__c vp : newList) {
            if (vp.Volunteer__c == null) continue;

            String oldStatus = oldMap.get(vp.Id).Attendance_Status__c;
            String newStatus = vp.Attendance_Status__c;

            // only give points when status actually changed to Attended
            if (oldStatus == newStatus) continue;

            if (newStatus == 'Attended' && oldStatus != 'Attended') {
                Integer pts = pointsMap.containsKey(vp.Volunteer__c) ? pointsMap.get(vp.Volunteer__c) : 0;
                pointsMap.put(vp.Volunteer__c, pts + POINTS_ATTEND);
            }
        }

        if (!pointsMap.isEmpty()) {
            awardPoints(pointsMap);
        }
    }

    private static void awardPoints(Map<Id, Integer> pointsMap) {
        List<Volunteer__c> vols = [
            SELECT Id, Total_Points__c FROM Volunteer__c WHERE Id IN :pointsMap.keySet()
        ];

        List<Volunteer__c> toUpdate = new List<Volunteer__c>();
        for (Volunteer__c vol : vols) {
            Integer current = (Integer)(vol.Total_Points__c != null ? vol.Total_Points__c : 0);
            toUpdate.add(new Volunteer__c(
                Id = vol.Id,
                Total_Points__c = current + pointsMap.get(vol.Id)
            ));
        }

        if (!toUpdate.isEmpty()) update toUpdate;
    }
}