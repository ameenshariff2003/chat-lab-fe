import { Meta } from "react-router";
import {io} from "socket.io-client";


export const initSocketConnection = ()=>{
    const socket = io(import.meta.env.VITE_API_URL,{
        withCredentials:true,
    })

    socket.on("connect",()=>{
        console.log("Connected to Socket.IO server")
    })
}