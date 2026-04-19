public with sharing class UserLeaves {
    
    @AuraEnabled(cacheable=true)
    public static List<LeaveWrapper> getUserLeaves() {
        List<LeaveWrapper> leavesList = new List<LeaveWrapper>();
        Integer serialNo = 1;
        
        try {
            // Query all users with their leave information
            // Assuming you have a Leave__c custom object with fields:
            // Employee__c (lookup to User), Leave_Type__c, 
            // Total_Allocated_Leaves__c, Total_Consumed_Leaves__c
            
            for (User u : [SELECT Id, Name FROM User WHERE IsActive = true LIMIT 100]) {
                LeaveWrapper wrapper = new LeaveWrapper();
                wrapper.serialNo = serialNo++;
                wrapper.employeeName = u.Name;
                wrapper.leaveType = 'Annual'; // Default, can be queried from Leave__c object
                wrapper.allocatedLeaves = 20; // Default, can be queried from Leave__c object
                wrapper.consumedLeaves = 0; // Default, can be queried from Leave__c object
                wrapper.remainingLeaves = 20; // Default, can be queried from Leave__c object
                
                leavesList.add(wrapper);
            }
        } catch (Exception e) {
            System.debug('Error fetching user leaves: ' + e.getMessage());
        }
        
        return leavesList;
    }
    
    // Wrapper class to hold leave information
    public class LeaveWrapper {
        @AuraEnabled public Integer serialNo;
        @AuraEnabled public String employeeName;
        @AuraEnabled public String leaveType;
        @AuraEnabled public Integer allocatedLeaves;
        @AuraEnabled public Integer consumedLeaves;
        @AuraEnabled public Integer remainingLeaves;
    }
}
