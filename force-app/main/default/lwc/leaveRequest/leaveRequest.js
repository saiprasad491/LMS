import { LightningElement, api } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import createLeaveRequest from '@salesforce/apex/UserLeaveRequests.createLeaveRequest';

const LEAVE_TYPE_OPTIONS = [
    { label: 'Planned Leave', value: 'Planned Leave' },
    { label: 'Sick Leave', value: 'Sick Leave' },
    { label: 'Unpaid Leave', value: 'Unpaid Leave' },
];

export default class LeaveRequest extends LightningElement {
    @api userId; // Custom user ID passed from parent component
    fromDate = '';
    toDate = '';
    leaveType = '';
    reason = '';
    leaveTypeOptions = LEAVE_TYPE_OPTIONS;

    handleChange(event) {
        const fieldName = event.target.dataset.field;
        if (fieldName) {
            this[fieldName] = event.target.value;
        }
    }

    async handleApply() {
        if (!this.fromDate || !this.toDate || !this.leaveType) {
            this.showToast('Validation required', 'Please select From, To and Leave Type before applying.', 'warning');
            return;
        }

        // Calculate number of days
        const from = new Date(this.fromDate);
        const to = new Date(this.toDate);
        const diffTime = Math.abs(to - from);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

        if (!this.userId) {
            this.showToast('Error', 'User ID is not available. Please log in again.', 'error');
            return;
        }

        try {
            const result = await createLeaveRequest({
                customUserId: this.userId,
                fromDate: this.fromDate,
                toDate: this.toDate,
                leaveType: this.leaveType,
                numberOfDays: diffDays,
                reason: this.reason
            });

            if (result.success) {
                this.showToast('Success', result.message, 'success');
                // Reset form
                this.handleCancel();
            } else {
                this.showToast('Error', result.message, 'error');
            }
        } catch (error) {
            this.showToast('Error', 'An unexpected error occurred: ' + error.body.message, 'error');
        }
    }

    handleCancel() {
        this.fromDate = '';
        this.toDate = '';
        this.leaveType = '';
        this.reason = '';
        this.showToast('Cleared', 'Form inputs have been reset.', 'info');
    }

    showToast(title, message, variant) {
        this.dispatchEvent(
            new ShowToastEvent({
                title,
                message,
                variant,
            })
        );
    }
}