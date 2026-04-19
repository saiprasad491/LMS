import { LightningElement, track } from 'lwc';

export default class MainLayout extends LightningElement {
  @track isAuthenticated = false;
  @track hasAccount = true;

  handleNavigateToRegister() {
    this.hasAccount = false;
  }

  handleNavigateToLogin() {
    this.hasAccount = true;
  }
}
