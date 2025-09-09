import { useAppDispatch } from "@store/hooks";
import { logout } from "@store/authSlice";
import { useNavigate } from "react-router";
// import Header from "@components/Header/Header";
// import IconButton from "@components/IconButton/IconButton";
// import arrow_left from "@assets/images/icons/arrow-left.svg";
import AppBarMobile from "@components/AppBarMobile/AppBarMobile";
import AppBarDecktop from "@components/AppBarDecktop/AppBarDecktop";
import { useState } from "react";
import EmojiPicker from "@components/EmojiPicker/EmojiPicker";
import ColorPicker from "@components/ColorPicker/ColorPicker";


export default function Main() {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const [emoji, setEmoji] = useState('');
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
            

                <EmojiPicker
                    value={emoji}
                    onChange={setEmoji}
                />
                <ColorPicker
                    value={color}
                    onChange={setColor}
                />

        </>
    )
}