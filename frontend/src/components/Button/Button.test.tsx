import { render, screen, fireEvent } from "@testing-library/react";
import Button from "./Button";
import notification from "@assets/images/icons/notification.svg";
import { describe, it, expect, vi } from "vitest";

describe("Button component", () => {
    it("render children text", () => {
        render(<Button type='primary' size='large'>Click Me</Button>);
        expect(screen.getByText("Click Me")).toBeInTheDocument();
    });

    it("renders an icon when icon prop is passed", () => {
        render(<Button type='primary' size='large' icon={notification}>Click Me</Button>);
        const img = screen.getByRole("img", { name: 'icon' });
        expect(img).toBeInTheDocument();
        expect(img).toHaveAttribute("src", notification);
    });

    it("applies disabled attribute", () => {
        render(<Button type='primary' size='large' disabled>Click Me</Button>);
        expect(screen.getByRole("button")).toBeDisabled();
    });

    it("calls onclick when clicked", () => {
        const handleClick = vi.fn();
        render(<Button type='primary' size='large' onClick={handleClick}>Click Me</Button>);
        fireEvent.click(screen.getByRole("button"));
        expect(handleClick).toHaveBeenCalled();
    });

    it("applies correct styles based on props", () => {
        render(<Button type='outline' size='small'>Outline Small</Button>);
        const button = screen.getByRole("button", { name: "Outline Small" });
        expect(button.className).toContain("btn");
        expect(button.className).toContain("outline");
        expect(button.className).toContain("small");
    });
});