import { useAppDispatch } from "@store/hooks";
import { logout } from "@store/authSlice";
import { useNavigate } from "react-router";
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