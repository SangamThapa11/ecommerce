import { ICredentials } from "@/components/login/LoginForm";
import axiosConfig from "../config/axios.config"
import { IRegisterData } from "./validation";

class AuthService{
    async registerUser(data: IRegisterData) {
        try{
            return await axiosConfig.post("/auth/register", data, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
        });
        }catch(exception){
            throw exception
        }
    }
    async activateUserProfile(token: string) {
        return await axiosConfig.get("/auth/activate/"+token)
    }
    async loginUser(credentials: ICredentials) {
        return await axiosConfig.post('/auth/login', credentials)
    }
    async getLoggedInUser() {
        return await axiosConfig.get("/auth/me");
    }
    async forgetPasswordRequest(email: string) {
        return await axiosConfig.post("/auth/forget-password", { email })
    }
    
    async verifyForgetToken(token: string) {
       return await axiosConfig.get(`/auth/forget-password/${token}/verify`);
    }
    
    async resetPassword(token: string, password: string) {
        return await axiosConfig.patch("/auth/reset-password", {
            password,
            verifiedToken: token  
        });
}
}

const authSvc = new AuthService()
export default authSvc;