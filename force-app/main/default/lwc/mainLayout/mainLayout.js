import { LightningElement, track, wire } from 'lwc';
import getUsers from '@salesforce/apex/CustomUsers.getUsers';
import getUserLeaves from '@salesforce/apex/UserLeaves.getUserLeaves';
import getUserLeavesForUser from '@salesforce/apex/UserLeaves.getUserLeavesForUser';

export default class MainLayout extends LightningElement {
  @track isAuthenticated = false;
  @track showRegister = false;
  @track currentUser = '';
  @track currentUserId = null;
  @track sidebarCollapsed = false;
  @track currentView = 'dashboard';
  @track allUserDetails = [];
  @track allUserLeaves = [];

  handleLoginSuccess(event) {
    // Expect the login component to provide the custom user's Id and username in the event detail.
    // Parent/login component should emit: { userId: '005...', username: 'John Doe' }
    // Ensure currentUser is an object with a Name property so the template can use {currentUser.Name}
    const userId = event?.detail?.userId;
    const username = event?.detail?.username || '';
    // If a userId is present, keep the Id and Name; otherwise use the provided username string.
    this.currentUser = {
      Id: userId || null,
      Name: username
    };
    // expose the Id separately for child components that expect a plain Id
    this.currentUserId = userId || null;
    this.isAuthenticated = true;
    this.showRegister = false;
    this.currentView = 'dashboard';
    // Fetch leaves for the logged-in user so child components (statistics etc.) get per-user data
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

  @wire(getUsers)
    wiredUsers({ data, error }) {
        if (data) {
            this.allUserDetails = data;
            console.log(data);
        } else if (error) {
           console.log(`Error occured in fetching user details ${error}`);
        }
    }

  // Previously wired to get all user leaves. Replace with per-user fetch when currentUserId changes.
  // Keep the original wire commented for reference.
  // @wire(getUserLeaves)
  // wiredLeaves({data,error}){
  //   if(data){
  //     this.allUserLeaves = data;
  //     console.log(data);
  //   }else if(error){
  //     console.log(`Error occurred in fetching leave details ${error}`);
  //   }
  // }

  // Imperative fetch for leaves of the selected user
    async fetchLeavesForUser(userId) {
    if (!userId) {
      this.allUserLeaves = [];
      return;
    }
    try {
      const data = await getUserLeavesForUser({ userId });
      // Reassign a new array reference so child components' @api setters run when navigating
      this.allUserLeaves = data ? [...data] : [];
      console.log('Fetched leaves for user:', userId, this.allUserLeaves);
    } catch (error) {
      console.error('Error fetching leaves for user:', error);
      this.allUserLeaves = [];
    }
  }

  // life cycle hooks
  connectedCallback() {
    
  }

}
