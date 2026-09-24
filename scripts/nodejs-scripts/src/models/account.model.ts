import { AccountType } from '../types/index.type.ts';

export interface AccountCreation {
    username: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    profileImageUrl?: string;
    accountType: AccountType;
}

export interface RegistrationData extends AccountCreation {
    confirmPassword: string;
}

export interface Account extends Omit<AccountCreation, 'password'> {
    accountId: string;
    password?: string;
    createdAt: string | Date;
    updatedAt: string | Date;
}
