import Switch from "@components/Switch/Switch";
// import { useEffect } from "react";
// import { useAppDispatch, useAppSelector } from "@store/hooks";
// import { getHabitsForDate } from "@store/habitSlice";

export default function Main() {
    // const dispatch = useAppDispatch();
    // const { habitsForDate } = useAppSelector(state => state.habit);

    // useEffect(() => {
    //     dispatch(getHabitsForDate(new Date().toISOString() ));
    // }, []);

    return (
        <>
            main
            <Switch />
            <div>
                {/* {habitsForDate} */}
            </div>
        </>
    )
}