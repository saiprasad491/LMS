public with sharing class LeaveApprovalController {
    public String action { get; set; }

    public PageReference processApproval() {
        Id leaveId = ApexPages.currentPage().getParameters().get('leaveId');
        action = ApexPages.currentPage().getParameters().get('action');

        if (leaveId != null && action != null) {
            Leave_Request__c leaveReq = [SELECT Id, Status__c, Custom_User__r.Email, Custom_User__r.Name, From_Date__c, To_Date__c FROM Leave_Request__c WHERE Id = :leaveId];

            if (action == 'approve') {
                leaveReq.Status__c = 'Approved';
                sendEmailToEmployee(leaveReq, 'approved');
            } else if (action == 'reject') {
                leaveReq.Status__c = 'Rejected';
                sendEmailToEmployee(leaveReq, 'rejected');
            }

            update leaveReq;
        }

        return null;
    }

    private void sendEmailToEmployee(Leave_Request__c leaveReq, String status) {
        Messaging.SingleEmailMessage email = new Messaging.SingleEmailMessage();
        email.setToAddresses(new String[] { leaveReq.Custom_User__r.Email });
        email.setSubject('Leave Request ' + status.capitalize());
        String body = 'Dear ' + leaveReq.Custom_User__r.Name + ',<br/><br/>' +
                      'Your leave request from ' + leaveReq.From_Date__c + ' to ' + leaveReq.To_Date__c + ' has been ' + status + '.<br/><br/>' +
                      'Thank you.';
        email.setHtmlBody(body);
        Messaging.sendEmail(new Messaging.SingleEmailMessage[] { email });
    }
}