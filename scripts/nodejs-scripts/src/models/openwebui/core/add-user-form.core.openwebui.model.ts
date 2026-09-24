export interface AddUserForm {
    name: string;
    email: string;
    password: string;
    profile_image_url?: string | null;
    role?: string | null;
}
