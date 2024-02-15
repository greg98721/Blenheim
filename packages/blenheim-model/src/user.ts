export interface User {
  username: string;
  firstName: string;
  lastName: string;
  /** ISO format date only */
  birthDate: string;
  address: string;
  email?: string;
  phoneNumber?: string;
}
