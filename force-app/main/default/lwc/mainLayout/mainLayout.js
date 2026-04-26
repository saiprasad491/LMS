import { LightningElement, track, wire } from 'lwc';
import getUsers from '@salesforce/apex/CustomUsers.getUsers';
import getUserLeaves from '@salesforce/apex/UserLeaves.getUserLeaves';

export default class MainLayout extends LightningElement {
  @track isAuthenticated = false;
  @track showRegister = false;
  @track currentUser = '';
  @track sidebarCollapsed = false;
  @track currentView = 'dashboard';
  @track allUserDetails = [];
  @track allUserLeaves = [];

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
    console.log('Navigating to:', view);
    console.log('Previous view:', this.currentView);
    this.currentView = view;
    console.log('New view:', this.currentView);
    
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

  @wire(getUsers)
    wiredUsers({ data, error }) {
        if (data) {
            this.allUserDetails = data;
            console.log(data);
        } else if (error) {
           console.log(`Error occured in fetching user details ${error}`);
        }
    }

  @wire(getUserLeaves)
  wiredLeaves({data,error}){
    if(data){
      this.allUserLeaves = data;
      console.log(data);
    }else if(error){
      console.log(`Error occurred in fetching leave details ${error}`);
    }
  }

  // life cycle hooks
  connectedCallback() {
    
  }

}
