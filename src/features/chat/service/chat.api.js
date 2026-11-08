import axios from "axios";


const api = axios.create({
    baseURL:import.meta.env.VITE_API_URL,
    withCredentials:true
})

export const sendMessage = async({message,chatId})=>{
    const response = await api.post("/chat/message",{message,chat:chatId ?? undefined }) 
    
    return response.data
    
}
export const getChats = async()=>{
    const response = await api.get("/chat")
    return response.data
}
export const getMessages = async(chatId)=>{
    const response = await api.get(`/chat/${chatId}/message`)
    return response.data
}

export const deleteChats = async(chatId)=>{
    const response = await api.delete(`/chat/delete/${chatId}`)
    return response.data
}


