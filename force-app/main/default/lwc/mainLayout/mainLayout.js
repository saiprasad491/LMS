import { LightningElement, track } from 'lwc';

export default class MainLayout extends LightningElement {
  @track isAuthenticated = false;
  @track currentUser = '';
  @track showRegister = false;

  handleLoginSuccess(event) {
    // Handle successful login from login component
    this.currentUser = event.detail.username;
    this.isAuthenticated = true;
    this.showRegister = false;
  }

  handleLogout() {
    // Reset authentication state
    this.isAuthenticated = false;
    this.currentUser = '';
    this.showRegister = false;
  }

  handleShowRegister() {
    // Show register component
    this.showRegister = true;
  }

  handleBackToLogin() {
    // Show login component
    this.showRegister = false;
  }
}
