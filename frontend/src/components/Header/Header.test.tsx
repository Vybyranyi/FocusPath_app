import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Header from "./Header";
import IconButton from "@components/IconButton/IconButton";
import arrow_left from "@assets/images/icons/arrow-left.svg";

describe("Header component", () => {
    it("render title", () => {
        render(<Header title="Continue with E-mail" />);
        expect(screen.getByRole("heading")).toBeInTheDocument();
        expect(screen.getByText("Continue with E-mail")).toBeInTheDocument();
    });

    it("render left button", () => {
        render(<Header title="Continue with E-mail" leftButtonIcon={<IconButton size='large' icon={arrow_left} />} />);
        const button = screen.getByRole("button");
        expect(button).toBeInTheDocument();
        expect(button.className).toContain("iconButton");
    });

    it("render right button", () => {
        render(<Header title="Continue with E-mail" rightButtonIcon={<IconButton size='large' icon={arrow_left} />} />);
        const button = screen.getByRole("button");
        expect(button).toBeInTheDocument();
        expect(button.className).toContain("iconButton");
    });
});
