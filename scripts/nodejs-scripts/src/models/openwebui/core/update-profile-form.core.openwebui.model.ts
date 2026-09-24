export interface UpdateProfileForm {
    profile_image_url: string;
    name: string;
    bio?: string | null;
    gender?: string | null;
    date_of_birth?: string | null;
}
