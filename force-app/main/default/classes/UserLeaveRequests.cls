public with sharing class UserLeaveRequests {
    public UserLeaveRequests() {

    }
    @AuraEnabled
    public static List<Leave_Request__c> getUserLeaves(Id userId){
        return [
            SELECT Id, Name, Custom_User__r.Name, From_Date__c, To_Date__c, Leave_Type__c, Status__c, Reason__c, Manager_Comment__c
            FROM Leave_Request__c
            WHERE Custom_User__c =: userId
            ORDER BY From_Date__c DESC
        ];
    }
}
