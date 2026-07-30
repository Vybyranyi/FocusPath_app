import { render, screen, fireEvent } from "@testing-library/react";
import Input from '@components/ui/Input';
import { describe, expect, it, vi } from "vitest";

describe("Input component", () => {
    it("renders label and placeholder", () => {
        render(<Input label="Email" placeholder="Enter email" type="email" />);
        expect(screen.getByText("Email")).toBeInTheDocument();
        expect(screen.getByPlaceholderText("Enter email")).toBeInTheDocument();
    });

    it("updates value when typing", () => {
        render(<Input label="Name" placeholder="Enter name" type="text" />);
        const input = screen.getByPlaceholderText("Enter name") as HTMLInputElement;
        fireEvent.change(input, { target: { value: "Мар'ян" } });
        expect(input.value).toBe("Мар'ян");
    });

    it("disables input when disabled prop is true", () => {
        render(<Input label="Password" placeholder="Enter password" type="password" disabled />);
        const input = screen.getByPlaceholderText("Enter password");
        expect(input).toBeDisabled();
    });

    it("calls onBlur prop with the blur event", () => {
        const handleBlur = vi.fn();
        render(
            <Input
                label="Name"
                placeholder="Enter name"
                type="text"
                onBlur={handleBlur}
            />
        );

        const input = screen.getByPlaceholderText("Enter name") as HTMLInputElement;
        fireEvent.blur(input);

        expect(handleBlur).toHaveBeenCalledTimes(1);
        expect(handleBlur).toHaveBeenCalledWith(
            expect.objectContaining({ target: input })
        );
    });

    it("calls onClear when the clear button is pressed", () => {
        const handleClear = vi.fn();
        render(
            <Input
                label="Name"
                placeholder="Enter name"
                type="text"
                value="Test"
                onChange={vi.fn()}
                onClear={handleClear}
            />
        );

        fireEvent.click(screen.getByRole("img", { name: "Clear input" }));

        expect(handleClear).toHaveBeenCalledTimes(1);
    });

    it("hides the clear button when no handler was given", () => {
        // It used to fabricate a change event with only a target.value on it —
        // an object nothing else about a real event was true of.
        render(
            <Input
                label="Name"
                placeholder="Enter name"
                type="text"
                value="Test"
                onChange={vi.fn()}
            />
        );

        expect(screen.queryByRole("img", { name: "Clear input" })).not.toBeInTheDocument();
    });

    it("password toggle", () => {
        render(<Input label="Password" placeholder="Enter password" type="password" />);
        const input = screen.getByPlaceholderText("Enter password") as HTMLInputElement;
        fireEvent.change(input, { target: { value: "12345" } });
        const icon = screen.getByRole("img", { name: "Toggle password visibility" });
        fireEvent.click(icon);
        expect(input.type).toBe("text");
        fireEvent.click(icon);
        expect(input.type).toBe("password");
    });

    it("shows error message when invalid input is provided", () => {
        render(<Input label="Email" placeholder="Enter email" type="email" error="Invalid email address" />);
        const input = screen.getByPlaceholderText("Enter email") as HTMLInputElement;
        fireEvent.change(input, { target: { value: "invalid-email" } });
        fireEvent.blur(input);
        expect(screen.getByText("Invalid email address")).toBeInTheDocument();
    });

    it("switches input type to date on focus", () => {
        render(<Input label="Date" placeholder="Enter date" type="date" />);
        const input = screen.getByPlaceholderText("Enter date") as HTMLInputElement;

        expect(input.type).toBe("text");
        fireEvent.focus(input);
        expect(input.type).toBe("date");
    });

    it("switches back to text on blur if no value", () => {
        render(<Input label="Date" placeholder="Enter date" type="date" />);
        const input = screen.getByPlaceholderText("Enter date") as HTMLInputElement;

        fireEvent.focus(input);
        expect(input.type).toBe("date");

        fireEvent.blur(input);
        expect(input.type).toBe("text");
    });

    it("keeps type date on blur if value exists", () => {
        render(<Input label="Date" placeholder="Enter date" type="date" value="2025-08-23" />);
        const input = screen.getByPlaceholderText("Enter date") as HTMLInputElement;

        fireEvent.focus(input);
        expect(input.type).toBe("date");

        fireEvent.blur(input);
        expect(input.type).toBe("date");
    });
});
