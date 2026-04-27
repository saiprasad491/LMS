public with sharing class UserLeaveRequests {
    public UserLeaveRequests() {

    }

    @AuraEnabled
    public static List<Leave_Request__c> getUserLeaves(Id userId){
        return [
            SELECT Id, Name, Custom_User__c, Custom_User__r.Name, From_Date__c, To_Date__c, Leave_Type__c, Number_of_days__c, Status__c, Reason__c, Manager_Comment__c
            FROM Leave_Request__c
            WHERE Custom_User__c =: userId
            ORDER BY From_Date__c DESC
        ];
    }

    // Returns all leave requests (for approvers to review)
    @AuraEnabled
    public static List<Leave_Request__c> getAllLeaveRequests(){
        return [
            SELECT Id, Name, Custom_User__c, Custom_User__r.Name, From_Date__c, To_Date__c, Leave_Type__c, Number_of_days__c, Status__c, Reason__c, Manager_Comment__c
            FROM Leave_Request__c
            ORDER BY From_Date__c DESC
        ];
    }

    // Update the status of a leave request (Approved/Rejected)
    @AuraEnabled
    public static Boolean updateLeaveRequestStatus(Id requestId, String status){
        if(requestId == null || String.isBlank(status)) return false;
        Leave_Request__c lr = [SELECT Id, Status__c FROM Leave_Request__c WHERE Id = :requestId LIMIT 1];
        lr.Status__c = status;
        update lr;
        return true;
    }
}
