import { useAppDispatch, useAppSelector } from "@store/hooks";
import { logout } from "@store/authSlice";
import { useNavigate } from "react-router";
import Box from "@components/Box/Box";
import Header from "@components/Header/Header";
import IconButton from "@components/IconButton/IconButton";
import arrow_left from "@assets/images/icons/arrow-left.svg";
import SegmentControl from "@components/SegmentControl/SegmentControl";

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
                profile
            />
            <p>token: {token}</p>
            <p>user: {JSON.stringify(user)}</p>
            <button onClick={() => {
                dispatch(logout());
                navigate('/login');
            }}>log out</button>
            <SegmentControl
                segments={[
                    { id: '1', label: 'Text 1' },
                    { id: '2', label: 'Text 2' },
                    { id: '3', label: 'Text 3' },
                    { id: '4', label: 'Text 4' },
                ]}
                defaultSelectedId='1'
                onSelect={(id) => {
                    console.log(id);
                }}
            />
        </>
    )
}