import { useEffect } from "react";
import { useAuth } from "../hook/useAuth";
import { useSearchParams, useNavigate } from "react-router-dom";

export default function VerifyTkn() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const { handelVerify } = useAuth();

    useEffect(() => {
        const verifyAccount = async () => {
            const token = searchParams.get("token");

            const success = await handelVerify(token);

            if (success) {
                navigate("/login");
            }
        };

        verifyAccount();
    }, []);

    return <h2>Verifying your email...</h2>;
}