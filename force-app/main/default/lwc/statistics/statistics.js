import { LightningElement, api } from 'lwc';

export default class Statistics extends LightningElement {
    _leavesData;
    leaveTypeStats = [];

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
            // Group data by leave type
            const leaveTypeMap = new Map();
            
            this._leavesData.forEach(leave => {
                const leaveType = leave.leaveType || 'Unknown';
                
                if (!leaveTypeMap.has(leaveType)) {
                    leaveTypeMap.set(leaveType, {
                        leaveType: leaveType,
                        totalAllocated: 0,
                        totalConsumed: 0,
                        totalRemaining: 0
                    });
                }
                
                const stats = leaveTypeMap.get(leaveType);
                stats.totalAllocated += (leave.allocatedLeaves || 0);
                stats.totalConsumed += (leave.consumedLeaves || 0);
                stats.totalRemaining += (leave.remainingLeaves || 0);
            });
            
            // Convert map to array and add donut data
            this.leaveTypeStats = Array.from(leaveTypeMap.values()).map((stats, index) => {
                return {
                    ...stats,
                    id: `leave-type-${index}`,
                    consumedPercentage: this.calculatePercentage(stats.totalConsumed, stats.totalAllocated),
                    remainingPercentage: this.calculatePercentage(stats.totalRemaining, stats.totalAllocated),
                    donutData: this.calculateDonutData(stats.totalConsumed, stats.totalAllocated),
                    color: this.getColorForType(index)
                };
            });
        } else {
            this.leaveTypeStats = [];
        }
    }

    calculatePercentage(value, total) {
        if (total === 0) return 0;
        return Math.round((value / total) * 100);
    }

    calculateDonutData(consumed, allocated) {
        const percentage = this.calculatePercentage(consumed, allocated);
        const circumference = 2 * Math.PI * 70;
        const offset = circumference - (percentage / 100) * circumference;
        
        return {
            circumference: circumference,
            offset: offset,
            percentage: percentage
        };
    }

    getColorForType(index) {
        const colors = [
            { stroke: '#4CAF50', name: 'green' },   // Green
            { stroke: '#FF9800', name: 'orange' },  // Orange
            { stroke: '#2196F3', name: 'blue' },    // Blue
            { stroke: '#9C27B0', name: 'purple' },  // Purple
            { stroke: '#F44336', name: 'red' }      // Red
        ];
        return colors[index % colors.length];
    }

    get hasData() {
        return this.leaveTypeStats && this.leaveTypeStats.length > 0;
    }
}