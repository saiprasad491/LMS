public class CustomUsers {
    @AuraEnabled
    public static List<Custom_User__c> getUsers(){
        return [SELECT ID, Employee_ID__c, Name, Password__c,  Email__c, Phone__c,  Role__c FROM Custom_User__c];
    }
    public static void display(){
        List<Custom_User__c> users = CustomUsers.getUsers();
        for(Custom_User__c user:users){
            user.Password__c = 'user12';
            System.debug('Id = '+user.ID+' Name = '+user.Name+' Role = '+user.Role__c+' Password = '+user.Password__c);
        }
        update users;
    }
    @AuraEnabled
    public static void createUser(String username, String email, String password, String role){
        Custom_User__c newUser = new Custom_User__c();
        newUser.Name = username;
        newUser.Email__c = email;
        newUser.Password__c = password;
        newUser.Role__c = role;
        insert newUser;
    }
    @AuraEnabled
    public static List<Custom_User__c> getLoginUserData(String name,String pwd){
        return [SELECT ID, Employee_ID__c, Name, Password__c,  Email__c, Phone__c,  Role__c 
                FROM Custom_User__c 
                WHERE Name =: name AND Password__c =: pwd];
    }
    @AuraEnabled
    public static List<Leave_Request__c> getUserLeaves(Id userId){
        return [
            SELECT Name, From_Date__c, To_Date__c, Number_of_days__c,
                   Reason__c, Leave_Type__c, Manager_Comment__c, Status__c
            FROM Leave_Request__c
            WHERE Custom_User__c = :userId
            ORDER BY From_Date__c DESC
        ];
    }
}