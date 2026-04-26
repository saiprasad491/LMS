import { LightningElement, api } from 'lwc';

export default class AllLeaves extends LightningElement {
  @api leavesData;
  
  get hasLeaves() {
    return this.leavesData && this.leavesData.length > 0;
  }
  
  connectedCallback() {
    console.log('Leaves Data:', this.leavesData);
  }
}
