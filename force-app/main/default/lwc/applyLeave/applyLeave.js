import { LightningElement, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import createLeaveRequest from '@salesforce/apex/UserLeaveRequests.createLeaveRequest';

export default class ApplyLeave extends LightningElement {
  @track showApplyLeaveModal = false;
  
  @track formData = {
    fromDate: '',
    toDate: '',
    leaveType: '',
    reason: ''
  };

  leaveTypeOptions = [
    { label: 'Sick Leave', value: 'Sick Leave' },
    { label: 'Planned Leave', value: 'Planned Leave' },
    { label: 'Unpaid Leave', value: 'Unpaid Leave' }
  ];

  get containerClass() {
    return this.showApplyLeaveModal ? 'modal-open' : '';
  }

  handleApplyLeaveModal(){
    this.showApplyLeaveModal = this.showApplyLeaveModal ? !this.showApplyLeaveModal : true;
  }

  handleChange(event) {
    const field = event.target.name;
    const value = event.target.value;
    this.formData[field] = value;
    //  console.debug(`applyLeave handleChange - field: ${field}, value: ${value}`, JSON.stringify(this.formData));
  }

 handleCancel() {
    this.showApplyLeaveModal = false;
    this.formData = {
      fromDate: '',
      toDate: '',
      leaveType: '',
      reason: ''
    };
    this.dispatchEvent(new CustomEvent('leavecancelled'));
  }

  handleApply() {
    if (!this.formData.fromDate || !this.formData.toDate || !this.formData.leaveType || !this.formData.reason) {
      this.dispatchEvent(
        new ShowToastEvent({
          title: 'Missing required fields',
          message: 'Please provide From Date, To Date, Leave Type and Reason.',
          variant: 'error'
        })
      );
      return;
    }
    // Ensure from <= to
    const fromDt = new Date(this.formData.fromDate);
    const toDt = new Date(this.formData.toDate);
    if (isNaN(fromDt.getTime()) || isNaN(toDt.getTime()) || fromDt > toDt) {
      this.dispatchEvent(
        new ShowToastEvent({
          title: 'Invalid dates',
          message: 'Please ensure From Date is on or before To Date.',
          variant: 'error'
        })
      );
      return;
    }

    const fromDateStr = this.formData.fromDate;
    const toDateStr = this.formData.toDate;

    // Calculate number of days (inclusive)
    let numberOfDays = null;
    try {
      const fromDt = new Date(fromDateStr);
      const toDt = new Date(toDateStr);
      const oneDay = 24 * 60 * 60 * 1000;
      const diffDays = Math.round((toDt - fromDt) / oneDay) + 1;
      if (!isNaN(diffDays) && diffDays > 0) {
        numberOfDays = diffDays;
      }
    } catch (e) {
      console.warn('Could not calculate number of days automatically:', e);
    }

    // Prepare params for Apex
    const params = {
      fromDate: fromDateStr,
      toDate: toDateStr,
      leaveType: this.formData.leaveType || '',
      numberOfDays: numberOfDays,
      reason: this.formData.reason || ''
    };

    // For local debugging: if running outside org or Apex failing, simulate success
    const simulateIfNeeded = false; // set true to simulate without calling Apex
    if (simulateIfNeeded) {
      //console.info('Simulating createLeaveRequest response (local debug mode)');
      const simulatedId = 'a0BsimulatedId000000';
      this.dispatchEvent(
        new ShowToastEvent({
          title: 'Leave Requested (Simulated)',
          message: 'Simulated leave request created.',
          variant: 'success'
        })
      );
      this.dispatchEvent(new CustomEvent('leavesubmitted', { detail: { id: simulatedId } }));
      this.showApplyLeaveModal = false;
      this.formData = { fromDate: '', toDate: '', leaveType: '', reason: '' };
      return;
    }

    const apexParams = {
      fromDate: params.fromDate,
      toDate: params.toDate,
      leaveType: params.leaveType,
      numberOfDays: params.numberOfDays,
      reason: params.reason
    };
    //console.debug('Calling createLeaveRequest with', apexParams);

    createLeaveRequest(apexParams)
      .then((res) => {
        //console.debug('createLeaveRequest response', res);
        const success = res && (res.success === true || res.success === 'true');
        const message = res && res.message ? res.message : 'No message returned';
        const id = res && res.id ? res.id : null;
        if (success) {
          this.dispatchEvent(
            new ShowToastEvent({
              title: 'Leave Requested',
              message: message || 'Your leave request has been submitted.',
              variant: 'success'
            })
          );
          this.dispatchEvent(new CustomEvent('leavesubmitted', { detail: { id } }));
        } else {
          this.dispatchEvent(
            new ShowToastEvent({
              title: 'Failed to create leave request',
              message: message || 'Please try again or contact your administrator.',
              variant: 'error'
            })
          );
          //console.error('Failed to create leave request:', message);
        }
      })
      .catch((error) => {
        //console.error('createLeaveRequest caught error', error);
        const errMsg = (error && error.body && error.body.message) ? error.body.message : JSON.stringify(error);
        this.dispatchEvent(
          new ShowToastEvent({
            title: 'Server error',
            message: errMsg,
            variant: 'error'
          })
        );
      })
      .finally(() => {
        this.showApplyLeaveModal = false;
        // Reset form data
        this.formData = {
          fromDate: '',
          toDate: '',
          leaveType: '',
          reason: ''
        };
      });
  }
}
