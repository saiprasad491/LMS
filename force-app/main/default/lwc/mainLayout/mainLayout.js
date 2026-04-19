import { LightningElement, track } from 'lwc';

export default class MainLayout extends LightningElement {
  @track isAuthenticated = false;
  @track showRegister = false;
  @track currentUser = '';
  @track sidebarCollapsed = false;

  handleLoginSuccess(event) {
    this.currentUser = event.detail.username;
    this.isAuthenticated = true;
    this.showRegister = false;
  }

  handleLogout() {
    this.isAuthenticated = false;
    this.currentUser = '';
    this.showRegister = false;
    this.sidebarCollapsed = false;
  }

  handleShowRegister() {
    this.showRegister = true;
  }

  handleBackToLogin() {
    this.showRegister = false;
  }

  toggleSidebar() {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  get sidebarClass() {
    return this.sidebarCollapsed ? 'sidebar collapsed' : 'sidebar';
  }
}