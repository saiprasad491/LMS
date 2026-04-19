import { LightningElement, track } from 'lwc';

export default class ApplyLeave extends LightningElement {
  @track showApplyLeaveModal = false;
  
  @track formData = {
    fromDate: '',
    toDate: '',
    leaveType: '',
    reason: ''
  };

  // Leave type options for dropdown
  leaveTypeOptions = [
    { label: 'Sick Leave', value: 'Sick Leave' },
    { label: 'Planned Leave', value: 'Planned Leave' },
    { label: 'Unpaid Leave', value: 'Unpaid Leave' }
  ];

  // Getter for dynamic container class
  get containerClass() {
    return this.showApplyLeaveModal ? 'modal-open' : '';
  }

  handleApplyLeaveModal(){
    this.showApplyLeaveModal = this.showApplyLeaveModal ? !this.showApplyLeaveModal : true;
  }

  // Handle all input field changes
  handleChange(event) {
    const field = event.target.name;
    const value = event.target.value;
    this.formData[field] = value;
  }

  // Handle cancel button click
  handleCancel() {
    this.showApplyLeaveModal = false;
    // Reset form data
    this.formData = {
      fromDate: '',
      toDate: '',
      leaveType: '',
      reason: ''
    };
  }

  // Handle apply button click
  handleApply() {
    console.log('Leave Request Details:');
    console.log('From Date:', this.formData.fromDate);
    console.log('To Date:', this.formData.toDate);
    console.log('Leave Type:', this.formData.leaveType);
    console.log('Reason:', this.formData.reason);
    console.log('Complete Form Data:', JSON.stringify(this.formData, null, 2));
    
    // Close modal after applying
    this.showApplyLeaveModal = false;
    
    // Reset form data
    this.formData = {
      fromDate: '',
      toDate: '',
      leaveType: '',
      reason: ''
    };
  }

}
