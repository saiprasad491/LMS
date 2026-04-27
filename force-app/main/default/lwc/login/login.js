import { LightningElement, track } from 'lwc';
import getLoginUserData from '@salesforce/apex/CustomUsers.getLoginUserData';

export default class Login extends LightningElement {
  @track username = '';
  @track password = '';
  @track showPassword = false;
  @track errorMessage = '';

  get passwordType() {
    return this.showPassword ? 'text' : 'password';
  }

  handleUsernameChange(event) {
    this.username = event.target.value;
  }

  handlePasswordChange(event) {
    this.password = event.target.value;
  }

  togglePasswordVisibility(event) {
    event.preventDefault();
    this.showPassword = !this.showPassword;
  }




  handleLogin(event) {
    event.preventDefault();
    
    // Clear previous error message
    this.errorMessage = '';
    
    // Validate input fields
    if (!this.username || !this.password) {
      this.errorMessage = 'Please enter both username and password.';
      return;
    }
    
    // Call Apex method to authenticate user
    getLoginUserData({ name: this.username, pwd: this.password })
      .then(result => {
        if (result && result.length > 0) {
          // Authentication successful
          const user = result[0];
          console.log(`login userId ${user.Id} userName ${user.Name} role ${user.Role__c} email ${user.Email__c}`);
          const loginSuccessEvent = new CustomEvent('loginsuccess', {
            detail: { 
              username: user.Name, 
              userId: user.Id,
              role: user.Role__c,
              email: user.Email__c
            },
            bubbles: true,
            composed: true
          });
          this.dispatchEvent(loginSuccessEvent);
          
          // Clear form
          this.username = '';
          this.password = '';
        } else {
          // Authentication failed - no matching user found
          this.errorMessage = 'Invalid username or password. Please try again.';
        }
      })
      .catch(error => {
        // Handle error from Apex call
        console.error('Login error:', error);
        this.errorMessage = 'An error occurred during login. Please try again.';
      });
  }

  handleRegisterClick(event) {
    event.preventDefault();
    // Dispatch event to parent to show register component
    const showRegisterEvent = new CustomEvent('showregister', {
      bubbles: true,
      composed: true
    });
    this.dispatchEvent(showRegisterEvent);
  }
}
