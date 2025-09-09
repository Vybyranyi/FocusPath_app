import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import DatePicker, { type IDatePicker } from "./DatePicker";


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

    it("adds the active class if active=true is passed", () => {
        render(<DatePicker date="09-03-25" active />);
        const datePicker = screen.getByText("3").closest("div");
        expect(datePicker?.className).toContain("active");

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
