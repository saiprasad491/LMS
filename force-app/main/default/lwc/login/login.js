import { LightningElement, track } from 'lwc';

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
    
    // Validate credentials
    if (this.username === 'admin' && this.password === 'admin') {
      // Authentication successful - dispatch event to parent
      const loginSuccessEvent = new CustomEvent('loginsuccess', {
        detail: { username: this.username },
        bubbles: true,
        composed: true
      });
      this.dispatchEvent(loginSuccessEvent);
      
      // Clear form
      this.username = '';
      this.password = '';
    } else {
      // Authentication failed
      this.errorMessage = 'Invalid username or password. Please try again.';
    }
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
