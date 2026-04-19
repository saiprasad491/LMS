import { LightningElement, track } from 'lwc';

export default class AllUsers extends LightningElement {
  @track users = [
    {
      id: '1',
      name: 'John Doe',
      email: 'john.doe@example.com',
      role: 'Administrator'
    },
    {
      id: '2',
      name: 'Jane Smith',
      email: 'jane.smith@example.com',
      role: 'Manager'
    },
    {
      id: '3',
      name: 'Mike Johnson',
      email: 'mike.johnson@example.com',
      role: 'Employee'
    },
    {
      id: '4',
      name: 'Sarah Williams',
      email: 'sarah.williams@example.com',
      role: 'Employee'
    },
    {
      id: '5',
      name: 'Tom Brown',
      email: 'tom.brown@example.com',
      role: 'Manager'
    },
    {
      id: '6',
      name: 'Emily Davis',
      email: 'emily.davis@example.com',
      role: 'Employee'
    }
  ];

  get hasUsers() {
    return this.users && this.users.length > 0;
  }
}