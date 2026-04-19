import { LightningElement, track } from 'lwc';

export default class MainLayout extends LightningElement {
  @track isAuthenticated = false;
  @track showRegister = false;
  @track currentUser = '';
  @track sidebarCollapsed = false;
  @track currentView = 'dashboard';

  handleLoginSuccess(event) {
    this.currentUser = event.detail.username;
    this.isAuthenticated = true;
    this.showRegister = false;
    this.currentView = 'dashboard';
  }

  handleLogout() {
    this.isAuthenticated = false;
    this.currentUser = '';
    this.showRegister = false;
    this.sidebarCollapsed = false;
    this.currentView = 'dashboard';
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

  handleNavigation(event) {
    event.preventDefault();
    const view = event.currentTarget.dataset.view;
    this.currentView = view;
    
    // Update active state
    this.template.querySelectorAll('.nav-item').forEach(item => {
      item.classList.remove('active');
    });
    event.currentTarget.parentElement.classList.add('active');
  }

  get sidebarClass() {
    return this.sidebarCollapsed ? 'sidebar collapsed' : 'sidebar';
  }

  get showDashboard() {
    return this.currentView === 'dashboard';
  }

  get showLeaveRequest(){
    return this.currentView === 'leaveRequest';
  }

  get showAllUsers() {
    return this.currentView === 'allUsers';
  }

  get showAllLeaves() {
    return this.currentView === 'allLeaves';
  }

  get showStatistics() {
    return this.currentView === 'statistics';
  }
}
