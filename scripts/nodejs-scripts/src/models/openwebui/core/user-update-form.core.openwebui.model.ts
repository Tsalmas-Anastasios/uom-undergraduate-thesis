export interface UserUpdateForm {
    role: string;
    name: string;
    email: string;
    profile_image_url: string;
    password?: string | null;
}
