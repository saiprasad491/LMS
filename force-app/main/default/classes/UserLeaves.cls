public with sharing class UserLeaves {
    
    @AuraEnabled(cacheable=true)
    public static List<User_Leaves__c> getUserLeaves() {        
        try {
            return [SELECT Name, Custom_User__r.Name, Leave_Type__c, Total_Allocated__c, Total_Consumed__c, Remaining_Leaves__c FROM User_Leaves__c];
                
        } catch (Exception e) {
            System.debug('Error fetching user leaves: ' + e.getMessage());
            return new List<User_Leaves__c>();
        }
    }
    
    /**
     * Returns User_Leaves__c records for a specific custom user.
     *
     * @param userId Id of the custom user (Custom_User__c)
     * @return List<User_Leaves__c> filtered by Custom_User__c
     */
    @AuraEnabled(cacheable=true)
    public static List<User_Leaves__c> getUserLeavesForUser(Id userId) {
        try {
            if (userId == null || String.isBlank(String.valueOf(userId))) {
                return new List<User_Leaves__c>();
            }
            return [
                SELECT Name, Custom_User__r.Name, Leave_Type__c, Total_Allocated__c, Total_Consumed__c, Remaining_Leaves__c
                FROM User_Leaves__c
                WHERE Custom_User__c = :userId
            ];
        } catch (Exception e) {
            System.debug('Error fetching user leaves for userId ' + userId + ': ' + e.getMessage());
            return new List<User_Leaves__c>();
        }
    }
    
    @AuraEnabled(cacheable=true)
    public static List<Leave_Request__c> getCurrentUserLeaveRequests(String userId) {        
        try {
            return [
                SELECT Id, Name, Leave_Type__c, From_Date__c, To_Date__c, 
                       Number_of_Days__c, Reason__c, Status__c, CreatedDate
                FROM Leave_Request__c 
                WHERE Custom_User__c = :userId
                ORDER BY CreatedDate DESC
            ];
        } catch (Exception e) {
            System.debug('Error fetching user leave requests: ' + e.getMessage());
            throw new AuraHandledException('Error fetching leave requests: ' + e.getMessage());
        }
    }
}
