// import { initSocketConnection } from "../service/chat.service";
// import { sendMessage,getChats,getMessages,deleteChats } from "../service/chat.api";
// import {setChats,setCurrentChatId,setLoading,setError} from  '../chat.slice'
// import {useDispatch} from "react-redux"

// export const useChat=()=>{
//     const dispatch = useDispatch()
//     async function handelSendMessage({message,chatId}) {
//         dispatch(setLoading(true))
//         const data = await sendMessage({message,chatId})
//         const {chat,aiMessage} = data
//         dispatch(setChats((prev)=>{
//             return{
//                 ...prev,
//                 [chat.title]:{
//                     ...chat,
//                     message:[{content:message,role:"user"},aiMessage]
//                 }
//             }
//         }))
//         dispatch(setCurrentChatId(chat._id))

//     }




//     return{
//         initSocketConnection,
//         handelSendMessage
//     }
//  }




import { useCallback } from "react"
import { useDispatch, useSelector, useStore } from "react-redux"
import { initSocketConnection } from "../service/chat.service"
import { sendMessage, getChats, getMessages, deleteChats } from "../service/chat.api"
import { setChats, setCurrentChatId, setLoading, setError } from "../chat.slice"

// If your store registers this reducer under a different key, change it here only.
const selectChat = (state) => state.chat

const errMsg = (e) => e?.response?.data?.message || e?.message || "Something went wrong"

export const useChat = () => {
    const dispatch = useDispatch()
    const store = useStore()
    const { chats, currentChatId, isLoading, error } = useSelector(selectChat)

    const handelSendMessage = useCallback(async ({ message, chatId }) => {
        dispatch(setLoading(true))
        dispatch(setError(null))
        try {
            const { chat, aiMessage } = await sendMessage({ message, chatId })
            const id = chat?._id ?? chatId   // backend returns chat only for new chats
            const prev = selectChat(store.getState()).chats
            const existing = prev[id]?.messages ?? []
            dispatch(setChats({
                ...prev,
                [id]: {
                    ...prev[id],
                    ...chat,
                    messages: [...existing, { content: message, role: "user" }, aiMessage],
                },
            }))

            dispatch(setCurrentChatId(id))
            return true
        } catch (e) {
            dispatch(setError(errMsg(e)))
            return false
        } finally {
            dispatch(setLoading(false))
        }
    }, [dispatch, store])

    const handleGetChats = useCallback(async () => {
        try {
            const data = await getChats()
            const list = Array.isArray(data) ? data : data?.chats ?? []
            const prev = selectChat(store.getState()).chats
            const next = {}
            for (const c of list) next[c._id] = { ...prev[c._id], ...c }
            dispatch(setChats(next))
        } catch (e) {
            dispatch(setError(errMsg(e)))
        }
    }, [dispatch, store])

    const handleOpenChat = useCallback(async (chatId) => {
        dispatch(setCurrentChatId(chatId))
        if (selectChat(store.getState()).chats[chatId]?.messages) return // already loaded
        try {
            const data = await getMessages(chatId)
            const messages = Array.isArray(data) ? data : data?.messages ?? []
            const prev = selectChat(store.getState()).chats
            dispatch(setChats({ ...prev, [chatId]: { ...prev[chatId], messages } }))
        } catch (e) {
            dispatch(setError(errMsg(e)))
        }
    }, [dispatch, store])

    const handleDeleteChat = useCallback(async (chatId) => {
        try {
            await deleteChats(chatId)
            const state = selectChat(store.getState())
            const rest = { ...state.chats }
            delete rest[chatId]
            dispatch(setChats(rest))
            if (state.currentChatId === chatId) dispatch(setCurrentChatId(null))
        } catch (e) {
            dispatch(setError(errMsg(e)))
        }
    }, [dispatch, store])

    const handleNewChat = useCallback(() => {
        dispatch(setCurrentChatId(null))
    }, [dispatch])

    const clearError = useCallback(() => dispatch(setError(null)), [dispatch])

    return {
        chats,
        currentChatId,
        isLoading,
        error,
        initSocketConnection,
        handelSendMessage,
        handleGetChats,
        handleOpenChat,
        handleDeleteChat,
        handleNewChat,
        clearError,
    }
}