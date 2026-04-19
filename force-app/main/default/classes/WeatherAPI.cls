public with sharing class WeatherAPI {

    @AuraEnabled
    public static string getWeather(){
        //Instantiate a new Http object
        Http http = new Http();

        //Instantiate a new HTTP request, specify the method (GET) as well as the endpoint
        HttpRequest req = new HttpRequest();
        req.setEndpoint('callout:WeatherNamedCredential/curreant.json?q='+city);
        req.setMethod('GET');

        HttpResponse res = h.send(req);
        return res.getBody();
    }

    public WeatherAPI() {

    }
}