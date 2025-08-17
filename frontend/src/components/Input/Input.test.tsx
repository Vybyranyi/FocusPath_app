import { render, screen, fireEvent } from "@testing-library/react";
import Input from "./Input";
import { describe, expect, it } from "vitest";

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

    it("shows clear icon and clears input on click", () => {
        render(<Input label="Name" placeholder="Enter name" type="text" />);
        const input = screen.getByPlaceholderText("Enter name") as HTMLInputElement;
        fireEvent.change(input, { target: { value: "Test" } });
        const clearIcon = screen.getByRole("img", { name: "Clear input" });
        fireEvent.click(clearIcon);
        expect(input.value).toBe("");
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

});


