import { jwtDecode } from "jwt-decode";

export const getTokenEXP = (token: string) => {
    const decodedToken: any = jwtDecode(token);
    return decodedToken.exp * 1000;
};

export const isTokenExpired = (token: string) => {
    const exp = getTokenEXP(token);
    return exp < Date.now();
}


