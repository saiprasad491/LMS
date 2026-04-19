import { LightningElement, track } from 'lwc';

export default class Register extends LightningElement {
  @track username = '';
  @track email = '';
  @track password = '';
  @track confirmPassword = '';
  @track showPassword = false;
  @track showConfirmPassword = false;

  get passwordType() {
    return this.showPassword ? 'text' : 'password';
  }

  get confirmPasswordType() {
    return this.showConfirmPassword ? 'text' : 'password';
  }

  handleUsernameChange(event) {
    this.username = event.target.value;
  }

  handleEmailChange(event) {
    this.email = event.target.value;
  }

  handlePasswordChange(event) {
    this.password = event.target.value;
  }

  handleConfirmPasswordChange(event) {
    this.confirmPassword = event.target.value;
  }

  togglePasswordVisibility(event) {
    event.preventDefault();
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility(event) {
    event.preventDefault();
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  handleRegister(event) {
    event.preventDefault();

    // Check if passwords match
    if (this.password !== this.confirmPassword) {
      // You can add error handling here
      alert('Passwords do not match!');
      return;
    }
    
    // Dispatch custom event to parent component
    const registerEvent = new CustomEvent('register', {
      detail: {
        username: this.username,
        email: this.email,
        password: this.password
      }
    });
    this.dispatchEvent(registerEvent);
  }

  handleLoginClick(event) {
    event.preventDefault();
    
    // Dispatch custom event to navigate to login page
    const loginEvent = new CustomEvent('navigatetologin');
    this.dispatchEvent(loginEvent);
  }
}