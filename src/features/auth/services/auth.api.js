import axios from "axios"


const api = axios.create({
    baseURL:import.meta.env.VITE_API_URL,
    withCredentials:true,
})

export async function signup({email,username,password}) {
    const response = await api.post("/signup",{email,username,password})
    return response.data
    
}
export async function login({email,password}) {
    const response = await api.post("/login",{email,password})
    return response.data
    
}

export async function getme() {
    const response = await api.get("/get-me")
    return response.data
    
}
export async function logout() {
    const response = await api.post("/logout")
    return response.data
}

export async function verify(token) {
    const response = await api.get("/verify", {
        params: { token }
    });

    return response.data;
}

