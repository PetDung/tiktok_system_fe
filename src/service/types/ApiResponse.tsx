export interface UserData {
    id: string;
    username: string;
    name: string;
    role: string;
    team: string;
}

export interface ApiResponse<T> {
    code: number;
    message?: string;
    result: T;
}

// Type alias for specific user response
export type UserLoginResponse = ApiResponse<UserData>;