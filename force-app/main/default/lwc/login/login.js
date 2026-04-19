import { LightningElement, track, api } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';

export default class Login extends NavigationMixin(LightningElement) {
  @track username = '';
  @track password = '';
  @track showPassword = false;
  @track errorMessage = '';

  @api hasAccount ;

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
    
    // Validate credentials
    if (this.username === 'admin' && this.password === 'admin') {
      // Authentication successful - navigate to mainLayout
      this.navigateToMainLayout();
    } else {
      // Authentication failed
      this.errorMessage = 'Invalid username or password. Please try again.';
    }
  }

  navigateToMainLayout() {
    // Dispatch custom event to parent component to show mainLayout
    const loginSuccessEvent = new CustomEvent('loginsuccess', {
      detail: {
        username: this.username
      }
    });
    this.dispatchEvent(loginSuccessEvent);
  }

  handleRegisterClick(event) {
    event.preventDefault();
    
    // Dispatch custom event to navigate to register page
    const registerEvent = new CustomEvent('navigatetoregister');
    this.dispatchEvent(registerEvent);
  }
}