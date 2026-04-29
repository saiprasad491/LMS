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
        try {
            if(requestId == null || String.isBlank(status)) {
                return false;
            }
            Leave_Request__c lr = [SELECT Id, Status__c, Custom_User__c, Leave_Type__c FROM Leave_Request__c WHERE Id = :requestId LIMIT 1];
            String oldStatus = lr.Status__c;
            lr.Status__c = status;
            update lr;

            Integer delta = 0;
            if (oldStatus != 'Approved' && status == 'Approved') {
                delta = 1;
            } else if (oldStatus == 'Approved' && status != 'Approved') {
                delta = -1;
            }

            if (delta != 0) {
                Boolean adjusted = adjustUserLeavesConsumed(lr.Custom_User__c, lr.Leave_Type__c, delta);
                if (!adjusted) {
                    throw new AuraHandledException('Unable to update consumed leaves for the user.');
                }
            }

            return true;
        } catch (Exception e) {
            System.debug('Error updating leave request status: ' + e.getMessage());
            throw new AuraHandledException('Error updating leave request: ' + e.getMessage());
        }
    }

    private static Boolean adjustUserLeavesConsumed(Id customUserId, String leaveType, Integer delta) {
        if (customUserId == null || String.isBlank(leaveType) || delta == 0) {
            return true;
        }

        List<User_Leaves__c> userLeaves = [
            SELECT Id, Total_Consumed__c, Total_Allocated__c
            FROM User_Leaves__c
            WHERE Custom_User__c = :customUserId
            AND Leave_Type__c = :leaveType
            LIMIT 1
        ];

        if (userLeaves.isEmpty()) {
            return false;
        }

        User_Leaves__c userLeave = userLeaves[0];
        if (userLeave.Total_Consumed__c == null) {
            userLeave.Total_Consumed__c = 0;
        }

        userLeave.Total_Consumed__c += delta;
        if (userLeave.Total_Consumed__c < 0) {
            userLeave.Total_Consumed__c = 0;
        }

        if (userLeave.Total_Allocated__c == null) {
            userLeave.Total_Allocated__c = 0;
        }

        update userLeave;
        return true;
    }

    //apply for leave
    /**
     * Creates a Leave_Request__c for the specified custom user.
     *
     * @param customUserId The ID of the Custom_User__c record
     * @param fromDate Date string in yyyy-MM-dd format or Date instance (Sent from LWC as string)
     * @param toDate Date string in yyyy-MM-dd format or Date instance (Sent from LWC as string)
     * @param leaveType API name of leave type (Leave_Type__c)
     * @param numberOfDays Number of days (can be decimal as String/Number)
     * @param reason Reason for leave
     * @return Map<String, Object> containing success (Boolean), id (Id when success), message (String)
     */
    @AuraEnabled
    public static Map<String, Object> createLeaveRequest(Id customUserId, String fromDate, String toDate, String leaveType, Decimal numberOfDays, String reason) {
        Map<String, Object> result = new Map<String, Object>{
            'success' => false,
            'id' => null,
            'message' => ''
        };
        try {
            if (customUserId == null) {
                result.put('message', 'Custom user ID is required.');
                return result;
            }
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
            lr.Custom_User__c = customUserId;
            lr.From_Date__c = fromDt;
            lr.To_Date__c = toDt;
            if (!String.isBlank(leaveType)) lr.Leave_Type__c = leaveType;
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
