export interface User {
    username: string;
    email: string;
    phone_number: string;
}

export interface AuthResponse {
    token: string;
    user: User;
}