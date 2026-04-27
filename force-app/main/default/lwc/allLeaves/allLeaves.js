import { LightningElement, api, track } from 'lwc';
import getUserLeaves from '@salesforce/apex/UserLeaveRequests.getUserLeaves';
import USER_ID from '@salesforce/user/Id';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class AllLeaves extends LightningElement {
    @track leaveRequests = [];
    @track displayedLeaves = [];
    @track error;
    @track isLoading = false;
    
    // Pagination properties
    @track currentPage = 1;
    @track recordsPerPage = 10;
    @track totalRecords = 0;
    @track totalPages = 0;
    
    // Pagination options
    pageOptions = [
        { label: '5', value: 5 },
        { label: '10', value: 10 },
        { label: '25', value: 25 },
        { label: '50', value: 50 }
    ];

    /**
     * Accept logged-in user id via attribute or fallback to current user import.
     * Parent components can pass a user-id attribute: <c-all-leaves user-id="005..."></c-all-leaves>
     */
    @api userId = USER_ID;

    connectedCallback() {
        // If userId is not provided by parent, USER_ID import will be used.
        // Defer loading if userId is not yet populated by parent — observe property instead.
        // If parent passes user-id after initialization, handle it in renderedCallback.
        if (this.userId) {
            this.loadLeaveRequests();
        }
    }
    
    renderedCallback() {
        // If parent supplies userId later (via attribute), ensure we load once when it becomes available.
        if (!this._loadedForUser && this.userId) {
            this._loadedForUser = this.userId;
            this.loadLeaveRequests();
        }
    }

    loadLeaveRequests() {
        // Validate userId before calling Apex
        if (!this.userId) {
            console.warn('allLeaves: userId is not set — skipping load.');
            this.leaveRequests = [];
            this.displayedLeaves = [];
            this.totalRecords = 0;
            this.totalPages = 0;
            this.isLoading = false;
            return;
        }

        this.isLoading = true;
        console.debug('allLeaves: loading leave requests for userId =', this.userId);

        // Reset previous state
        this.leaveRequests = [];
        this.displayedLeaves = [];
        this.totalRecords = 0;
        this.totalPages = 0;
        this.currentPage = 1;
        this.error = undefined;

        getUserLeaves({ userId: this.userId })
            .then(result => {
                // Log raw result for debugging
                console.debug('allLeaves: raw result from getUserLeaves:', result);

                // Apex may return an array of SObjects; normalize it
                const records = Array.isArray(result) ? result : [];

                // If records exist, map and format them. Otherwise keep arrays empty.
                if (records.length > 0) {
                    this.leaveRequests = records.map(leave => {
                        // defensive access to fields that may be undefined
                        const status = (leave && leave.Status__c) ? leave.Status__c : '';
                        const fromDate = (leave && leave.From_Date__c) ? leave.From_Date__c : null;
                        const toDate = (leave && leave.To_Date__c) ? leave.To_Date__c : null;
                        return {
                            Id: leave.Id,
                            Leave_Type__c: leave.Leave_Type__c || '',
                            From_Date__c: fromDate,
                            To_Date__c: toDate,
                            Reason__c: leave.Reason__c || '',
                            Manager_Comment__c: leave.Manager_Comment__c || '',
                            Status__c: status,
                            statusClass: this.getStatusClass(status),
                            formattedStartDate: this.formatDate(fromDate),
                            formattedEndDate: this.formatDate(toDate)
                        };
                    });
                } else {
                    console.debug('allLeaves: no records returned for userId =', this.userId);
                }

                console.debug('allLeaves: mapped leaveRequests length =', this.leaveRequests.length);

                // Update paging state
                this.totalRecords = this.leaveRequests.length;
                this.calculateTotalPages();
                this.updateDisplayedRecords();

                this.isLoading = false;
            })
            .catch(error => {
                console.error('allLeaves: error fetching leave requests', error);
                this.error = error;
                this.isLoading = false;
                const errorMessage = error && error.body ? error.body.message : (error && error.message) ? error.message : 'Unknown error';
                this.showToast('Error', 'Error loading leave requests: ' + errorMessage, 'error');
            });
    }

    formatDate(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        });
    }

    getStatusClass(status) {
        if (status === 'Approved') {
            return 'status-approved';
        } else if (status === 'Rejected') {
            return 'status-rejected';
        } else if (status === 'Pending') {
            return 'status-pending';
        }
        return 'status-default';
    }

    calculateTotalPages() {
        this.totalPages = Math.ceil(this.totalRecords / this.recordsPerPage);
        if (this.totalPages === 0) {
            this.totalPages = 1;
        }
    }

    updateDisplayedRecords() {
        const start = (this.currentPage - 1) * this.recordsPerPage;
        const end = start + this.recordsPerPage;
        this.displayedLeaves = this.leaveRequests.slice(start, end);
    }

    handleRecordsPerPageChange(event) {
        this.recordsPerPage = parseInt(event.detail.value);
        this.currentPage = 1;
        this.calculateTotalPages();
        this.updateDisplayedRecords();
    }

    handlePrevious() {
        if (this.currentPage > 1) {
            this.currentPage--;
            this.updateDisplayedRecords();
        }
    }

    handleNext() {
        if (this.currentPage < this.totalPages) {
            this.currentPage++;
            this.updateDisplayedRecords();
        }
    }

    handleFirst() {
        this.currentPage = 1;
        this.updateDisplayedRecords();
    }

    handleLast() {
        this.currentPage = this.totalPages;
        this.updateDisplayedRecords();
    }

    get isPreviousDisabled() {
        return this.currentPage <= 1;
    }

    get isNextDisabled() {
        return this.currentPage >= this.totalPages;
    }

    get startRecord() {
        return this.totalRecords === 0 ? 0 : (this.currentPage - 1) * this.recordsPerPage + 1;
    }

    get endRecord() {
        const end = this.currentPage * this.recordsPerPage;
        return end > this.totalRecords ? this.totalRecords : end;
    }

    get hasLeaves() {
        return this.leaveRequests && this.leaveRequests.length > 0;
    }

    showToast(title, message, variant) {
        const event = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant
        });
        this.dispatchEvent(event);
    }

    handleRefresh() {
        this.loadLeaveRequests();
        this.showToast('Success', 'Leave requests refreshed', 'success');
    }
}