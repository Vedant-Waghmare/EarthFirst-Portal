public without sharing class EcoFeedbackShowcaseController {

    @AuraEnabled(cacheable=false)
    public static Map<String, Object> getFeedbackData(String filterType) {
        Map<String, Object> result = new Map<String, Object>();

        // Rating summary counts
        Map<String, Integer> ratingCounts = new Map<String, Integer>{
            '5' => 0, '4' => 0, '3' => 0, '2' => 0, '1' => 0
        };

        String whereClause = '';
        if (filterType == 'Initiative') {
            whereClause = 'WHERE Related_to_Initiative__c != null';
        } else if (filterType == 'Case') {
            whereClause = 'WHERE Related_to_Case__c != null';
        }

        // Get all feedbacks for rating counts
        List<Feedback__c> allFeedbacks = Database.query(
            'SELECT Rating__c FROM Feedback__c ' + whereClause
        );

        Integer total = allFeedbacks.size();
        for (Feedback__c fb : allFeedbacks) {
            if (fb.Rating__c != null) {
                String star = fb.Rating__c.substring(0, 1);
                if (ratingCounts.containsKey(star)) {
                    ratingCounts.put(star, ratingCounts.get(star) + 1);
                }
            }
        }

        // Calculate average
        Integer totalScore = 0;
        for (Feedback__c fb : allFeedbacks) {
            if (fb.Rating__c != null) {
                totalScore += Integer.valueOf(fb.Rating__c.substring(0, 1));
            }
        }
        Decimal average = total > 0 ? Decimal.valueOf(totalScore) / total : 0;

        result.put('total', total);
        result.put('average', average.setScale(1));
        result.put('ratingCounts', ratingCounts);

        // Get recent feedbacks
        List<Feedback__c> recentFeedbacks = Database.query(
            'SELECT Id, Rating__c, Comments__c, Feedback_Date__c, ' +
            'Submitted_By_Citizen__r.Name, Submitted_By_Volunteer__r.Name, ' +
            'Related_to_Initiative__r.Initiative_Name__c, ' +
            'Related_to_Case__r.Subject ' +
            'FROM Feedback__c ' + whereClause +
            ' ORDER BY Feedback_Date__c DESC LIMIT 50'
        );

        List<Map<String, String>> feedbackList = new List<Map<String, String>>();
        for (Feedback__c fb : recentFeedbacks) {
            Map<String, String> item = new Map<String, String>();
            item.put('id',       fb.Id);
            item.put('rating',   fb.Rating__c != null ? fb.Rating__c.substring(0, 1) : '0');
            item.put('comments', fb.Comments__c != null ? fb.Comments__c : '');
            item.put('date',     fb.Feedback_Date__c != null ? String.valueOf(fb.Feedback_Date__c) : '');
            item.put('submittedBy',
                fb.Submitted_By_Citizen__r != null ? fb.Submitted_By_Citizen__r.Name :
                fb.Submitted_By_Volunteer__r != null ? fb.Submitted_By_Volunteer__r.Name : 'Anonymous');
            item.put('relatedTo',
                fb.Related_to_Initiative__r != null ? fb.Related_to_Initiative__r.Initiative_Name__c :
                fb.Related_to_Case__r != null ? fb.Related_to_Case__r.Subject : '');
            feedbackList.add(item);
        }

        result.put('feedbacks', feedbackList);
        return result;
    }
}