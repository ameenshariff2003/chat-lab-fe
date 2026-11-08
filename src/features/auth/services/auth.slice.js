import { createSlice } from "@reduxjs/toolkit";

const authSlice = createSlice({
    name:"auth",
    initialState:{
        user:null,
        loading:true,
        error:null,
    },
    reducers:{
        setUser:(state,action)=>{
            state.user=action.payload
        },
        setLoading:(state,action)=>{
            state.loading=action.payload
        },
        setErr:(state,action)=>{
            state.error=action.payload
        }
    }
})


export const {setUser,setLoading,setErr} = authSlice.actions;
export default authSlice.reducer