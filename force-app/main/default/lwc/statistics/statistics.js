import { LightningElement, api } from 'lwc';

export default class Statistics extends LightningElement {
    _leavesData;
    leaveTypeStats = [];
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
            // Group data by leave type
            const leaveTypeMap = new Map();
            
            this._leavesData.forEach(leave => {
                // Map SObject fields to the internal names the component expects
                const leaveType = leave.Leave_Type__c || leave.leaveType || 'Unknown';
                const allocated = Number(leave.Total_Allocated__c) || Number(leave.allocatedLeaves) || 0;
                const consumed = Number(leave.Total_Consumed__c) || Number(leave.consumedLeaves) || 0;
                const remaining = Number(leave.Remaining_Leaves__c) || Number(leave.remainingLeaves) || 0;
                
                if (!leaveTypeMap.has(leaveType)) {
                    leaveTypeMap.set(leaveType, {
                        leaveType: leaveType,
                        totalAllocated: 0,
                        totalConsumed: 0,
                        totalRemaining: 0
                    });
                }
                
                const stats = leaveTypeMap.get(leaveType);
                stats.totalAllocated += allocated;
                stats.totalConsumed += consumed;
                stats.totalRemaining += remaining;
            });
            
            // Convert map to array and add donut data
            const statsArray = Array.from(leaveTypeMap.values()).map((stats, index) => {
                const donut = this.calculateDonutData(stats.totalConsumed, stats.totalAllocated);
                const pct = donut.percentage;
                const color = this.getColorForType(index) || { stroke: '#2196F3', fill: '#6EC2FF' };

                const id = `leave-type-${index}`;
                const donutTitleId = `donut-title-${id}`;
                const labelId = `label-${id}`;
                const barStyle = `--fill: ${pct}%; background: ${color.fill || '#6EC2FF'};`;

                return {
                    ...stats,
                    id,
                    consumedPercentage: this.calculatePercentage(stats.totalConsumed, stats.totalAllocated),
                    remainingPercentage: this.calculatePercentage(stats.totalRemaining, stats.totalAllocated),
                    donutData: donut,
                    color,
                    // computed presentation fields
                    tooltip: `${stats.leaveType}: ${stats.totalConsumed} consumed, ${stats.totalRemaining} remaining`,
                    barStyle,
                    _donutTitleId: donutTitleId,
                    _labelId: labelId,
                    _barStyle: barStyle
                };
            });

            // Update totals for header display
            this.totalAllocated = statsArray.reduce((sum, s) => sum + (s.totalAllocated || 0), 0);
            this.totalConsumed = statsArray.reduce((sum, s) => sum + (s.totalConsumed || 0), 0);
            this.totalRemaining = statsArray.reduce((sum, s) => sum + (s.totalRemaining || 0), 0);

            this.leaveTypeStats = statsArray;
        } else {
            this.leaveTypeStats = [];
            this.totalAllocated = 0;
            this.totalConsumed = 0;
            this.totalRemaining = 0;
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
            { stroke: '#4CAF50', name: 'green', fill: '#A5D6A7' },   // Green
            { stroke: '#FF9800', name: 'orange', fill: '#FFCC80' },  // Orange
            { stroke: '#2196F3', name: 'blue', fill: '#90CAF9' },    // Blue
            { stroke: '#9C27B0', name: 'purple', fill: '#CE93D8' },  // Purple
            { stroke: '#F44336', name: 'red', fill: '#EF9A9A' }      // Red
        ];
        return colors[index % colors.length];
    }

    get hasData() {
        return this.leaveTypeStats && this.leaveTypeStats.length > 0;
    }

    // Keep legacy helper but not used by template anymore
    getBarStyle(stat) {
        const pct = stat.donutData && typeof stat.donutData.percentage === 'number' ? stat.donutData.percentage : 0;
        return `width: ${pct}%`;
    }

    // Provide a tooltip string (used by template via title attribute if needed)
    getTooltip(stat) {
        const allocated = stat.totalAllocated || 0;
        const consumed = stat.totalConsumed || 0;
        const remaining = stat.totalRemaining || 0;
        return `${stat.leaveType}: ${consumed} consumed, ${remaining} remaining (allocated ${allocated})`;
    }
}
