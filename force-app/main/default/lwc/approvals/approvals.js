import { LightningElement, track } from 'lwc';
import getAllLeaveRequests from '@salesforce/apex/UserLeaveRequests.getAllLeaveRequests';
import updateLeaveRequestStatus from '@salesforce/apex/UserLeaveRequests.updateLeaveRequestStatus';

export default class Approvals extends LightningElement {
  @track leaves = [];
  @track loading = false;

  // pagination state
  @track pageSize = 10; // number of records per page (default)
  @track pageNumber = 1; // current page (1-based)
  @track totalRecords = 0;
  @track totalPages = 0;

  // columns can be used if switching to lightning-datatable later
  columns = [
    { label: 'Requester', fieldName: 'requesterName' },
    { label: 'Leave Type', fieldName: 'leaveType' },
    { label: 'Start Date', fieldName: 'startDate' },
    { label: 'End Date', fieldName: 'endDate' },
    { label: 'Days', fieldName: 'days' },
    { label: 'Status', fieldName: 'status' }
  ];

  // Number of columns in the approvals table; keep this in sync with the <th> count in the template
  get columnCount() {
    return 7;
  }

  // Readable boolean used by the template instead of inline expressions
  get hasNoLeaves() {
    return !this.loading && Array.isArray(this.leaves) && this.leaves.length === 0;
  }

  // returns the slice of leaves for the current page
  get currentPageLeaves() {
    if (!Array.isArray(this.leaves) || this.leaves.length === 0) {
      return [];
    }
    const start = (this.pageNumber - 1) * this.pageSize;
    return this.leaves.slice(start, start + this.pageSize);
  }

  // helper to determine whether pagination controls should be shown
  get showPagination() {
    return this.totalRecords > this.pageSize;
  }

  // computed page numbers array for template iteration
  get pageNumbers() {
    const pages = [];
    for (let i = 1; i <= this.totalPages; i++) {
      pages.push(i);
    }
    return pages;
  }

  // display range start
  get displayStart() {
    if (this.totalRecords === 0) return 0;
    return (this.pageNumber - 1) * this.pageSize + 1;
  }

  // display range end
  get displayEnd() {
    return Math.min(this.totalRecords, this.pageNumber * this.pageSize);
  }

  // handler for page button clicks
  handlePageButtonClick(event) {
    const p = Number(event.currentTarget.dataset.page);
    if (!Number.isNaN(p)) {
      this.changePage(p);
    }
  }

  connectedCallback() {
    this.loadLeaves();
  }

  async loadLeaves() {
    this.loading = true;
    try {
      const data = await getAllLeaveRequests();
      // normalize records for template usage
      this.leaves = (data || []).map(r => ({
        id: r.Id,
        requesterId: r.Custom_User__c,
        requesterName: (r.Custom_User__r && r.Custom_User__r.Name) || '',
        leaveType: r.Leave_Type__c,
        startDate: r.From_Date__c,
        endDate: r.To_Date__c,
        days: r.Number_of_days__c,
        status: r.Status__c,
        isPending: (r.Status__c === 'Pending')
      }));

      // pagination calculations
      this.totalRecords = this.leaves.length;
      this.totalPages = Math.max(1, Math.ceil(this.totalRecords / this.pageSize));
      // reset to first page if current page is out of range
      if (this.pageNumber > this.totalPages) {
        this.pageNumber = 1;
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Error loading leaves', err);
      this.leaves = [];
      this.totalRecords = 0;
      this.totalPages = 0;
      this.pageNumber = 1;
    } finally {
      this.loading = false;
    }
  }

  // change to a specific page (1-based)
  changePage(page) {
    const p = Number(page);
    if (p >= 1 && p <= this.totalPages) {
      this.pageNumber = p;
    }
  }

  // next page
  nextPage() {
    if (this.pageNumber < this.totalPages) {
      this.pageNumber += 1;
    }
  }

  // previous page
  prevPage() {
    if (this.pageNumber > 1) {
      this.pageNumber -= 1;
    }
  }

  // handle changing page size
  handlePageSizeChange(event) {
    const newSize = Number(event.target.value) || 10;
    this.pageSize = newSize;
    this.totalPages = Math.max(1, Math.ceil(this.totalRecords / this.pageSize));
    // reset to first page to avoid out of range
    this.pageNumber = 1;
  }

  // Approve a request
  async handleApprove(event) {
    const id = event.currentTarget.dataset.id;
    await this.updateStatus(id, 'Approved');
  }

  // Reject a request
  async handleReject(event) {
    const id = event.currentTarget.dataset.id;
    await this.updateStatus(id, 'Rejected');
  }

  async updateStatus(id, status) {
    this.loading = true;
    try {
      await updateLeaveRequestStatus({ requestId: id, status });
      // refresh local list
      await this.loadLeaves();
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Error updating status', err);
    } finally {
      this.loading = false;
    }
  }
}
