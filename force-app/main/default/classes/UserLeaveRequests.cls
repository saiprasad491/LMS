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

    //apply for leave
    /**
     * Creates a Leave_Request__c for the current logged in user.
     *
     * @param fromDate Date string in yyyy-MM-dd format or Date instance (Sent from LWC as string)
     * @param toDate Date string in yyyy-MM-dd format or Date instance (Sent from LWC as string)
     * @param leaveType API name of leave type (Leave_Type__c)
     * @param numberOfDays Number of days (can be decimal as String/Number)
     * @param reason Reason for leave
     * @return Map<String, Object> containing success (Boolean), id (Id when success), message (String)
     */
    @AuraEnabled
    public static Map<String, Object> createLeaveRequest(String fromDate, String toDate, String leaveType, Decimal numberOfDays, String reason) {
        Map<String, Object> result = new Map<String, Object>{
            'success' => false,
            'id' => null,
            'message' => ''
        };
        try {
            Id currentUserId = UserInfo.getUserId();
            Date fromDt;
            Date toDt;
            // Parse dates safely
            if (fromDate == null || toDate == null) {
                result.put('message', 'From and To dates are required.');
                return result;
            }
            try {
                fromDt = Date.valueOf(fromDate);
                toDt = Date.valueOf(toDate);
            } catch (Exception ex) {
                result.put('message', 'Invalid date format. Use yyyy-MM-dd.');
                return result;
            }
            Leave_Request__c lr = new Leave_Request__c();
            lr.Custom_User__c = currentUserId;
            lr.From_Date__c = fromDt;
            lr.To_Date__c = toDt;
            if (!String.isBlank(leaveType)) lr.Leave_Type__c = leaveType;
            // if (numberOfDays != null) lr.Number_of_days__c = numberOfDays;
            if (!String.isBlank(reason)) lr.Reason__c = reason;
            lr.Status__c = 'Pending';
            insert lr;
            result.put('success', true);
            result.put('id', lr.Id);
            result.put('message', 'Leave request created successfully.');
            return result;
        } catch (Exception e) {
            // Log and return error
            System.debug('Error creating leave request: ' + e.getMessage());
            result.put('message', 'Error creating leave request: ' + e.getMessage());
            return result;
        }
    }

}
