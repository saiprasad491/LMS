import { LightningElement, track, api } from 'lwc';

const DEFAULT_PAGE_SIZE = 5;
const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

export default class AllUsers extends LightningElement {
  @api usersData = [];
  @track selectedLetter = 'All';
  @track pageSize = DEFAULT_PAGE_SIZE;
  @track currentPage = 1;

  // users = [
  //   {
  //     Id: '1',
  //     Name: 'John Doe',
  //     Email__c: 'john.doe@example.com',
  //     Role__c: 'Administrator'
  //   },
  //   {
  //     Id: '2',
  //     Name: 'Jane Smith',
  //     Email__c: 'jane.smith@example.com',
  //     Role__c: 'Manager'
  //   },
  //   {
  //     Id: '3',
  //     Name: 'Mike Johnson',
  //     Email__c: 'mike.johnson@example.com',
  //     Role__c: 'Employee'
  //   },
  //   {
  //     Id: '4',
  //     Name: 'Sarah Williams',
  //     Email__c: 'sarah.williams@example.com',
  //     Role__c: 'Employee'
  //   },
  //   {
  //     Id: '5',
  //     Name: 'Tom Brown',
  //     Email__c: 'tom.brown@example.com',
  //     Role__c: 'Manager'
  //   },
  //   {
  //     Id: '6',
  //     Name: 'Emily Davis',
  //     Email__c: 'emily.davis@example.com',
  //     Role__c: 'Employee'
  //   }
  // ];

  get pageSizeOptions() {
    return [
      { label: '5', value: '5' },
      { label: '10', value: '10' },
      { label: '15', value: '15' },
      { label: '20', value: '20' }
    ];
  }

  get sourceUsers() {
    return this.usersData && this.usersData.length > 0 ? this.usersData : [];
  }

  get alphabetButtons() {
    return ['All', ...ALPHABET].map((letter) => ({
      letter,
      buttonClass: letter === this.selectedLetter ? 'alpha-btn active' : 'alpha-btn'
    }));
  }

  get filteredUsers() {
    if (!this.sourceUsers || this.sourceUsers.length === 0) {
      return [];
    }

    if (this.selectedLetter === 'All') {
      return this.sourceUsers.slice();
    }

    return this.sourceUsers.filter((user) => {
      const name = (user.Name || '').trim();
      return name.toUpperCase().startsWith(this.selectedLetter);
    });
  }

  get totalRecords() {
    return this.filteredUsers.length;
  }

  get totalPages() {
    return Math.max(1, Math.ceil(this.totalRecords / this.pageSize));
  }

  get paginatedUsers() {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredUsers.slice(start, start + this.pageSize);
  }

  get hasUsers() {
    return this.filteredUsers.length > 0;
  }

  get pageButtons() {
    return Array.from({ length: this.totalPages }, (_, index) => {
      const page = index + 1;
      return {
        page,
        buttonClass: page === this.currentPage ? 'pagination-page active' : 'pagination-page'
      };
    });
  }

  get isFirstPage() {
    return this.currentPage === 1;
  }

  get isLastPage() {
    return this.currentPage === this.totalPages;
  }

  handleAlphaClick(event) {
    const selected = event.currentTarget.dataset.letter;
    this.selectedLetter = selected || 'All';
    this.currentPage = 1;
  }

  handlePageSizeChange(event) {
    this.pageSize = parseInt(event.target.value, 10) || DEFAULT_PAGE_SIZE;
    this.currentPage = 1;
  }

  handlePageClick(event) {
    const page = parseInt(event.currentTarget.dataset.page, 10);
    if (!Number.isNaN(page)) {
      this.currentPage = page;
    }
  }

  handlePrevPage() {
    if (this.currentPage > 1) {
      this.currentPage -= 1;
    }
  }

  handleNextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage += 1;
    }
  }
}