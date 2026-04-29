import { LightningElement, track, wire } from 'lwc';
import getUsers from '@salesforce/apex/CustomUsers.getUsers';
import getUserLeavesForUser from '@salesforce/apex/UserLeaves.getUserLeavesForUser';

export default class MainLayout extends LightningElement {
  @track isAuthenticated = false;
  @track showRegister = false;
  @track currentUser = '';
  @track currentUserId = null;
  @track currentUserRole = '';
  @track sidebarCollapsed = false;
  @track currentView = 'dashboard';
  @track allUserDetails = [];
  @track allUserLeaves = [];
  @track userInitialized = false;

  handleLoginSuccess(event) {
    const userId = event?.detail?.userId;
    const username = event?.detail?.username || '';
    const role = event?.detail?.role;
    console.log(`userId ${userId} userName ${username} role ${role}`);
    this.currentUser = {
      Id: userId || null,
      Name: username
    };
    this.currentUserId = userId || null;
    this.currentUserRole = role || '';
    this.isAuthenticated = true;
    this.showRegister = false;
    if (['Manager', 'HR'].includes(this.currentUserRole)) {
      this.currentView = 'allLeaves';
    } else {
      this.currentView = 'dashboard';
    }
    this.fetchLeavesForUser(this.currentUserId);
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

  handleLeaveUpdated() {
    if (this.currentUserId) {
      this.fetchLeavesForUser(this.currentUserId);
    }
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

    // If navigating to statistics, refresh leaves for the current user so stats are up-to-date
    if (view === 'statistics' && this.currentUserId) {
      this.fetchLeavesForUser(this.currentUserId);
    }
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

  get isApprover(){
    return ['Manager', 'HR'].includes(this.currentUserRole);
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

  // Imperative fetch for leaves of the selected user
    async fetchLeavesForUser(userId) {
    if (!userId) {
      this.allUserLeaves = [];
      return;
    }
    try {
      const data = await getUserLeavesForUser({ userId });
      this.allUserLeaves = data ? [...data] : [];
      console.log('Fetched leaves for user:', userId, this.allUserLeaves);
      this.userInitialized = true;
    } catch (error) {
      console.error('Error fetching leaves for user:', error);
      this.allUserLeaves = [];
      this.userInitialized = true;
    }
  }

}
