public class CustomUsers {
    public static List<Custom_User__c> getUsers(){
        return [SELECT ID, Name, Role__c FROM Custom_User__c];
    }
    public static void display(){
        List<Custom_User__c> users = CustomUsers.getUsers();
        for(Custom_User__c user:users){
            System.debug('Id = '+user.ID+' Name = '+user.Name+' Role = '+user.Role__c);
        }
    }
}