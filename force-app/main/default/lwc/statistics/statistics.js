import { LightningElement, api } from 'lwc';

export default class Statistics extends LightningElement {
    _leavesData;
    totalEmployees = 0;
    totalAllocated = 0;
    totalConsumed = 0;
    totalRemaining = 0;

    @api
    get leavesData() {
        return this._leavesData;
    }

    set leavesData(value) {
        this._leavesData = value;
        this.calculateStatistics();
    }

    calculateStatistics() {
        if (this._leavesData && this._leavesData.length > 0) {
            this.totalEmployees = this._leavesData.length;
            
            this.totalAllocated = this._leavesData.reduce((sum, leave) => {
                return sum + (leave.allocatedLeaves || 0);
            }, 0);
            
            this.totalConsumed = this._leavesData.reduce((sum, leave) => {
                return sum + (leave.consumedLeaves || 0);
            }, 0);
            
            this.totalRemaining = this._leavesData.reduce((sum, leave) => {
                return sum + (leave.remainingLeaves || 0);
            }, 0);
        } else {
            // Reset to 0 if no data
            this.totalEmployees = 0;
            this.totalAllocated = 0;
            this.totalConsumed = 0;
            this.totalRemaining = 0;
        }
    }

    get utilizationPercentage() {
        if (this.totalAllocated === 0) return 0;
        return Math.round((this.totalConsumed / this.totalAllocated) * 100);
    }

    get availabilityPercentage() {
        if (this.totalAllocated === 0) return 100;
        return Math.round((this.totalRemaining / this.totalAllocated) * 100);
    }

    get utilizationStyle() {
        return `width: ${this.utilizationPercentage}%`;
    }

    get availabilityStyle() {
        return `width: ${this.availabilityPercentage}%`;
    }

    get hasData() {
        return this._leavesData && this._leavesData.length > 0;
    }
}
