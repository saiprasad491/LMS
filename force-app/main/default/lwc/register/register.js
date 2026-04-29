import { LightningElement, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import createUser from '@salesforce/apex/CustomUsers.createUser';

export default class Register extends LightningElement {
  
  handleBackToLogin(event) {
    if (event) {
      event.preventDefault();
    }
    // Dispatch event to parent to go back to login
    const backToLoginEvent = new CustomEvent('backtologin', {
      bubbles: true,
      composed: true
    });
    this.dispatchEvent(backToLoginEvent);
  }
  @track username = '';
  @track email = '';
  @track password = '';
  @track confirmPassword = '';
  @track role = '';
  @track showPassword = false;
  @track showConfirmPassword = false;
  @track errorMessages = {};

  get passwordType() {
    return this.showPassword ? 'text' : 'password';
  }

  get confirmPasswordType() {
    return this.showConfirmPassword ? 'text' : 'password';
  }

  handleChange(event) {
    const field = event.target.name;
    this[field] = event.target.value;
    this.errorMessages = { ...this.errorMessages, [field]: '' };
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

    // Clear all errors
    this.errorMessages = {};

    let hasError = false;

    // Validate username
    if (!this.username.trim()) {
      this.errorMessages = { ...this.errorMessages, username: 'Username is required.' };
      hasError = true;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!this.email.trim()) {
      this.errorMessages = { ...this.errorMessages, email: 'Email is required.' };
      hasError = true;
    } else if (!emailRegex.test(this.email)) {
      this.errorMessages = { ...this.errorMessages, email: 'Please enter a valid email address.' };
      hasError = true;
    }

    // Validate role
    if (!this.role) {
      this.errorMessages = { ...this.errorMessages, role: 'Please select a role.' };
      hasError = true;
    }

    // Check password length
    if (!this.password) {
      this.errorMessages = { ...this.errorMessages, password: 'Password is required.' };
      hasError = true;
    } else if (this.password.length !== 6) {
      this.errorMessages = { ...this.errorMessages, password: 'Password must be exactly 6 characters long.' };
      hasError = true;
    }

    // Check if passwords match
    if (!this.confirmPassword) {
      this.errorMessages = { ...this.errorMessages, confirmPassword: 'Please confirm your password.' };
      hasError = true;
    } else if (this.password !== this.confirmPassword) {
      this.errorMessages = { ...this.errorMessages, confirmPassword: 'Passwords do not match!' };
      hasError = true;
    }

    if (hasError) {
      return;
    }

    // Create the user
    createUser({ username: this.username, email: this.email, password: this.password, role: this.role })
      .then(() => {
        this.dispatchEvent(new ShowToastEvent({
          title: 'Success',
          message: 'User created successfully!',
          variant: 'success'
        }));
        this.handleBackToLogin();
      })
      .catch(error => {
        this.dispatchEvent(new ShowToastEvent({
          title: 'Error',
          message: 'Error creating user: ' + error.body.message,
          variant: 'error'
        }));
      });
  }

  handleLoginClick(event) {
    event.preventDefault();
    this.handleBackToLogin(event);
  }
}