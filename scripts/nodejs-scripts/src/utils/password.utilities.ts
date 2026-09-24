import bcrypt from 'bcrypt';

export class PasswordsManagementUtilities {
    generateHash(password: string): string {
        const salt = bcrypt.genSaltSync(12);
        const hash = bcrypt.hashSync(password, salt);
        return hash;
    }

    validatePasswords(data: { password: string; hashedPassword: string }): boolean {
        return bcrypt.compareSync(data.password, data.hashedPassword);
    }
}

export const passwordsManagementUtilities = new PasswordsManagementUtilities();
