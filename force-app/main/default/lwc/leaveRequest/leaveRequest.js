import { LightningElement } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import USER_ID from '@salesforce/user/Id';

const LEAVE_TYPE_OPTIONS = [
    { label: 'Annual', value: 'annual' },
    { label: 'Sick', value: 'sick' },
    { label: 'Work From Home', value: 'wfh' },
];

export default class LeaveRequest extends LightningElement {
    userId = USER_ID;
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

    handleApply() {
        const payload = {
            userId: this.userId,
            fromDate: this.fromDate,
            toDate: this.toDate,
            leaveType: this.leaveType,
            reason: this.reason,
        };

        console.log('Leave request payload:', payload);

        if (!this.fromDate || !this.toDate || !this.leaveType) {
            this.showToast('Validation required', 'Please select From, To and Leave Type before applying.', 'warning');
            return;
        }

        this.showToast('Applied', 'Leave request is ready and logged to console.', 'success');
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