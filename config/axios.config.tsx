import axios, { AxiosError, AxiosResponse } from "axios";

const axiosConfig = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 30000,
    timeoutErrorMessage: "Server Time Out....",
    responseType: "json",
    headers: {
        "Content-Type": "application/json",
    }
})
axiosConfig.interceptors.request.use((config) => {
    const accessToken = localStorage.getItem("token_43")
    if (accessToken) {
        config.headers.Authorization = "Bearer " + accessToken
    }
    return config;
})
export interface AxiosSuccessResponse {
    data: any,
    message: string,
    status: string,
    options: any,
}
axiosConfig.interceptors.response.use(
    (response: AxiosResponse) => {
        return response.data;
    },
    (exception: AxiosError) => {
        if (exception.response) {
            throw { error: exception.response.data, code: exception.status }
        } else {
            throw {
                error: null,
                code: exception.status
            }
        }
    }
)
export default axiosConfig; 