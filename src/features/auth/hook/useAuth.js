import { useDispatch } from "react-redux";
import { signup, login, getme,logout,verify } from "../services/auth.api";
import { setUser, setLoading, setErr } from "../services/auth.slice";
import {useCallback} from 'react'




export function useAuth() {
    const dispatch = useDispatch()
    

    async function handelSignup({ email, userName, password }) {
        try {
            dispatch(setLoading(true))
            const data = await signup({ email, userName, password })
        } catch (error) {
            dispatch(setErr(error.respomse?.data?.message || "Register Failed"))

        }finally{
            dispatch(setLoading(false))
        }

    }


async function handelLogin({ email, password }) {
    try {
        dispatch(setLoading(true));

        const data = await login({ email, password });

        dispatch(setUser(data.user));

        return data;

    } catch (error) {
        dispatch(setErr(
            error.response?.data?.msg || "Login Failed"
        ));

        throw error; // Important: pass error to Login.jsx

    } finally {
        dispatch(setLoading(false));
    }
}


async function handelGetMe() {
    try {
            dispatch(setLoading(true))
            const data = await getme()
            dispatch(setUser(data.user))
        } catch (error) {
            dispatch(setErr(error.response?.data?.message || "Failed to fetch data"))

        }finally{
            dispatch(setLoading(false))
        }
    
}

 async function handelVerify(token) {
        try {
            if (!token) {
                dispatch(setErr("Verification token is missing"));
                return false;
            }

            dispatch(setLoading(true));

            await verify(token);

            return true;
        } catch (error) {
            dispatch(setErr(
                error.response?.data?.message || "Email verification failed"
            ));
            return false;
        } finally {
            dispatch(setLoading(false));
        }
    }

const handelLogout = useCallback(async () => {
    try {
        await logout()
    } catch (error) {
        console.log(error)
    } finally {
        dispatch(setUser(null)) // clears user, so <Protected> redirects to /login
    }
}, [dispatch])

return {
    handelGetMe,
    handelLogin,
    handelSignup,
    handelLogout,
    handelVerify
}

}