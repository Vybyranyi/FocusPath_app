import { useAppDispatch, useAppSelector } from "@store/hooks";
import { logout } from "@store/authSlice";
import { useNavigate } from "react-router";
import Box from "@components/Box/Box";
import Header from "@components/Header/Header";
import IconButton from "@components/IconButton/IconButton";
import arrow_left from "@assets/images/icons/arrow-left.svg";

export default function Main() {
    const { user, token } = useAppSelector(state => state.auth);
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    return (
        <>
            <Header
                title="Label"
                leftButtonIcon={
                    <IconButton
                        size='large'
                        icon={arrow_left}
                    />
                }
                topContent
            />
            <p>token: {token}</p>
            <p>user: {JSON.stringify(user)}</p>
            <button onClick={() => {
                dispatch(logout());
                navigate('/login');
            }}>log out</button>
        </>
    )
}