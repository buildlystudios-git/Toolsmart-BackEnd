export interface LoggedInUser {
    sub: string; 
    aud: string; 
    email: string;
    exp: number;
    iat: number;
    isEmailVerified: boolean;
    isPhoneNumberVerified: boolean;
    iss: string;
    phoneNumber: string;
    role: string;
}