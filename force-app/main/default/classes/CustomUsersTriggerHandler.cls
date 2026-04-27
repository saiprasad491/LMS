public class CustomUsersTriggerHandler {
	 public static void createUserLeave(List<Custom_User__c> users){

        List<User_Leaves__c> leavesList = new List<User_Leaves__c>();

        for(Custom_User__c user : users){ 
            User_Leaves__c leave = new User_Leaves__c();
            leave.Custom_User__c = user.Id;
            if(user.Role__c == 'Employee'){
                leave.Total_Allocated__c = 16;
            }
            else if(user.Role__c == 'Intern'){
                leave.Total_Allocated__c = 1;
            }
            else if(user.Role__c == 'HR' || user.Role__c == 'CEO'){ 
                leave.Total_Allocated__c = 32;
            }
            leave.Total_Consumed__c = 0; 
            leave.Leave_Type__c = 'Planned Leave';
            leavesList.add(leave);
        }

        if(!leavesList.isEmpty()){
            insert leavesList; 
        }
     }
}