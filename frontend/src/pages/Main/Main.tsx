import { useAppDispatch, useAppSelector } from "@store/hooks";
import { logout } from "@store/authSlice";
import { useNavigate } from "react-router";

export default function Main() {
    const { user, token } = useAppSelector(state => state.auth);
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    return (
        <>
        <p>token: {token}</p>
        <p>user: {JSON.stringify(user)}</p>
        <button onClick={() => {
            dispatch(logout());
            navigate('/login');
        }}>log out</button>
        </>
    )
}