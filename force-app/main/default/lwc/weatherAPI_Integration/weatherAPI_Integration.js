import { LightningElement } from 'lwc';
import getWeather from '@salesforce/apex/WeatherAPI.getWeather';

export default class WeatherAPI_Integration extends LightningElement {
  city;
  imageURL;
  conditionText;
  temperature;

  handleChange(event){
    this.city = event.target.value;
  }

  buttonClick(){
    getWeather({city:this.city})
    .then((response)=>{
      console.log()
    })
  }

}