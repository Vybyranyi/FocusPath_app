import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import DatePicker, { type IDatePicker } from '@components/pickers/DatePicker';


const setup = (props?: Partial<IDatePicker>) => {
    const defaultProps: IDatePicker = {
        date: new Date(2025, 8, 4),
        active: false,
        onClick: vi.fn(),
    };
    return render(<DatePicker {...defaultProps} {...props} />);
};

describe("DatePicker component", () => {
    it("renders the correct day", () => {
        setup();
        expect(screen.getByText("4")).toBeInTheDocument();
    });

    it("renders the correct day of the week", () => {
        setup({ date: new Date(2025, 8, 4) });
        expect(screen.getByText("THU")).toBeInTheDocument();
    });

    it("is a button, so the grid can be operated from the keyboard", () => {
        // It used to be a <div onClick>: the week strip and the month grid had
        // no keyboard path, and the day number was wrapped in an <h6>.
        setup();
        expect(screen.getByRole("button")).toBeInTheDocument();
    });

    it("names itself with the whole date, not just the number", () => {
        setup({ date: new Date(2025, 8, 4) });
        expect(
            screen.getByRole("button", { name: "Thursday, 4 September 2025" }),
        ).toBeInTheDocument();
    });

    it("reports the selected day as pressed", () => {
        // The previous version added a class called `active` that was never
        // defined in any stylesheet, and a test asserted its presence.
        const { rerender } = render(<DatePicker date={new Date(2025, 8, 3)} active />);
        expect(screen.getByRole("button")).toHaveAttribute("aria-pressed", "true");

        rerender(<DatePicker date={new Date(2025, 8, 3)} active={false} />);
        expect(screen.getByRole("button")).toHaveAttribute("aria-pressed", "false");
    });

    it("marks the selected day visually as well", () => {
        render(<DatePicker date={new Date(2025, 8, 3)} active />);
        expect(screen.getByRole("button").className).toContain("ring-accent");
    });

    it("does not call onClick while disabled", () => {
        const handleClick = vi.fn();
        setup({ onClick: handleClick, disabled: true });

        fireEvent.click(screen.getByRole("button"));

        expect(handleClick).not.toHaveBeenCalled();
        expect(screen.getByRole("button")).toBeDisabled();
    });

    it("calls onClick on click", () => {
        const handleClick = vi.fn();
        setup({ onClick: handleClick });

        fireEvent.click(screen.getByText("4"));
        expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it("works correctly with string date", () => {
        setup({ date: "2025-09-04" });
        expect(screen.getByText("4")).toBeInTheDocument();
        expect(screen.getByText("THU")).toBeInTheDocument();
    });

    it("works correctly with timestamp", () => {
        const timestamp = new Date(2025, 8, 4).getTime();
        setup({ date: timestamp });
        expect(screen.getByText("4")).toBeInTheDocument();
        expect(screen.getByText("THU")).toBeInTheDocument();
    });
});
