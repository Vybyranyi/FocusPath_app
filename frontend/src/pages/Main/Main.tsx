import { useAppDispatch } from "@store/hooks";
import { logout } from "@store/authSlice";
import { useNavigate } from "react-router";
// import Header from "@components/Header/Header";
// import IconButton from "@components/IconButton/IconButton";
// import arrow_left from "@assets/images/icons/arrow-left.svg";
import AppBarMobile from "@components/AppBarMobile/AppBarMobile";
import AppBarDecktop from "@components/AppBarDecktop/AppBarDecktop";
import ColorPicker from "@components/ColorPicker/ColorPicker";
import { useState } from "react";


export default function Main() {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const [color, setColor] = useState('');

    return (
        <>
            {/* <Header
                title="Label"
                leftButtonIcon={
                    <IconButton
                        size='large'
                        icon={arrow_left}
                    />
                }
                topContent
                profile
                segmentControl
                showWeekController
            /> */}
            {/* <button onClick={() => {
                dispatch(logout());
                navigate('/login');
            }}>log out</button> */}
            {/* <AppBarMobile /> */}
            {/* <AppBarDecktop /> */}
            

                <ColorPicker
                    value={color}
                    onChange={setColor}
                />

        </>
    )
}