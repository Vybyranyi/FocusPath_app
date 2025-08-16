import { render, screen, fireEvent } from "@testing-library/react";
import IconButton from "./IconButton";
import { describe, expect, it, vi } from "vitest";
import notification from "@assets/images/icons/notification.svg";

describe("IconButton component", () => {
    it("renders emoji when emoji prop is provided'", () => {
        render(<IconButton emoji="smiling cat with heart-eyes" size='large' />);
        const img = screen.getByRole("img", { name: 'smiling cat with heart-eyes' });
        expect(img).toBeInTheDocument();
        expect(img).toHaveAttribute("alt", 'smiling cat with heart-eyes');
    });

    it("renders an icon when icon prop is passed", () => {
        render(<IconButton icon={notification} size='large' />);
        const img = screen.getByRole("img", { name: 'icon' });
        expect(img).toBeInTheDocument();
        expect(img).toHaveAttribute("src", notification);
    });

    it("renders button with correct size class", () => {
        render(<IconButton size="medium" />);
        const button = screen.getByRole("button");
        expect(button.className).toContain("medium");
        expect(button.className).toContain("iconButton");
    });

    it("renders dot when show_dot is true", () => {
        render(<IconButton size="medium" show_dot />);
        const dot = screen.getByText("", { selector: "span" });
        expect(dot.className).toContain("dot");
        expect(dot).toBeInTheDocument();
    });

    it("calls onclick when clicked", () => {
        const handleClick = vi.fn();
        render(<IconButton  size='large' onClick={handleClick}></IconButton>);
        const button = screen.getByRole("button");
        fireEvent.click(button);
        expect(button.className).toContain("iconButton");
        expect(handleClick).toHaveBeenCalled();
    });
});