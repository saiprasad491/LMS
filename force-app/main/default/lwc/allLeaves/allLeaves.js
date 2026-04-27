import { LightningElement, wire } from 'lwc';
import getCurrentUserLeaveRequests from '@salesforce/apex/UserLeaves.getCurrentUserLeaveRequests';
import Id from '@salesforce/user/Id';

export default class AllLeaves extends LightningElement {
  leaves = [];
  error;
  userId = Id;

  @wire(getCurrentUserLeaveRequests, { userId: '$userId' })
  wiredLeaves({ error, data }) {
    if (data) {
      // Process leaves data to add status-based CSS classes
      this.leaves = data.map(leave => {
        return {
          ...leave,
          rowClass: this.getRowClass(leave.Status__c),
          statusBadgeClass: this.getStatusBadgeClass(leave.Status__c)
        };
      });
      this.error = undefined;
    } else if (error) {
      this.error = error;
      this.leaves = [];
    }
  }

  get hasLeaves() {
    return this.leaves && this.leaves.length > 0;
  }

  getRowClass(status) {
    if (!status) return '';
    const normalizedStatus = status.toLowerCase();
    if (normalizedStatus === 'approved') {
      return 'approved-row';
    } else if (normalizedStatus === 'rejected') {
      return 'rejected-row';
    }
    return 'pending-row';
  }

  getStatusBadgeClass(status) {
    if (!status) return 'status-badge';
    const normalizedStatus = status.toLowerCase();
    if (normalizedStatus === 'approved') {
      return 'status-badge status-approved';
    } else if (normalizedStatus === 'rejected') {
      return 'status-badge status-rejected';
    } else if (normalizedStatus === 'pending') {
      return 'status-badge status-pending';
    }
    return 'status-badge';
  }
}