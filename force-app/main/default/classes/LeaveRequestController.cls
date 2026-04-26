public with sharing class LeaveRequestController {
    @AuraEnabled
    public static void applyForLeave(Date startDate, Date endDate, Id approverId) {
        // Create leave request record
        Leave_Request__c leaveReq = new Leave_Request__c();
        leaveReq.Custom_User__c = UserInfo.getUserId();
        leaveReq.From_Date__c = startDate;
        leaveReq.To_Date__c = endDate;
        leaveReq.Approver__c = approverId;
        leaveReq.Status__c = 'Pending';
        insert leaveReq;

        // Send email to approver
        sendApprovalEmail(leaveReq.Id);
    }

    @AuraEnabled
    public static void sendApprovalEmail(Id leaveReqId) {
        Leave_Request__c leaveReq = [SELECT Id, Custom_User__r.Name, From_Date__c, To_Date__c, Approver__r.Email FROM Leave_Request__c WHERE Id = :leaveReqId];

        Messaging.SingleEmailMessage email = new Messaging.SingleEmailMessage();
        email.setToAddresses(new String[] { leaveReq.Approver__r.Email });
        email.setSubject('Leave Request Approval for ' + leaveReq.Custom_User__r.Name);
        String approveUrl = URL.getSalesforceBaseUrl().toExternalForm() + '/apex/LeaveApproval?leaveId=' + leaveReq.Id + '&action=approve';
        String rejectUrl = URL.getSalesforceBaseUrl().toExternalForm() + '/apex/LeaveApproval?leaveId=' + leaveReq.Id + '&action=reject';
        String body = 'Dear Approver,<br/><br/>' +
                      leaveReq.Custom_User__r.Name + ' has requested leave from ' + leaveReq.From_Date__c + ' to ' + leaveReq.To_Date__c + '.<br/><br/>' +
                      '<a href="' + approveUrl + '" style="background-color: green; color: white; padding: 10px 20px; text-decoration: none; margin-right: 10px;">Approve</a>' +
                      '<a href="' + rejectUrl + '" style="background-color: red; color: white; padding: 10px 20px; text-decoration: none;">Reject</a><br/><br/>' +
                      'Thank you.';
        email.setHtmlBody(body);
        Messaging.sendEmail(new Messaging.SingleEmailMessage[] { email });
    }
}