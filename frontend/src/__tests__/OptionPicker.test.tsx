import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import OptionPicker from "@components/pickers/OptionPicker";
import type { Option } from "@/types/ui";

const options: Option[] = [
  { label: "Blue", value: "blue" },
  { label: "Red", value: "red" },
];

const renderPicker = (props: Partial<Parameters<typeof OptionPicker>[0]> = {}) =>
  render(
    <OptionPicker
      options={options}
      caption="Color"
      placeholder="Select Color"
      renderPreview={(option) => (
        <span data-testid="preview">{option?.value ?? "empty"}</span>
      )}
      {...props}
    />,
  );

describe("OptionPicker", () => {
  it("shows the placeholder until something is chosen", () => {
    renderPicker();

    expect(screen.getByText("Select Color")).toBeInTheDocument();
    expect(screen.getByText("Color")).toBeInTheDocument();
  });

  it("shows the selected option's label", () => {
    renderPicker({ value: "red" });

    expect(screen.getByText("Red")).toBeInTheDocument();
    expect(screen.queryByText("Select Color")).not.toBeInTheDocument();
  });

  it("asks the caller to draw the preview, including for the empty state", () => {
    renderPicker();

    expect(screen.getByTestId("preview")).toHaveTextContent("empty");
  });

  it("reports the value that was picked", () => {
    const onChange = vi.fn();
    renderPicker({ onChange });

    fireEvent.click(screen.getByText("Select Color"));
    fireEvent.click(screen.getByText("Red"));

    expect(onChange).toHaveBeenCalledWith("red");
  });

  it("closes the list after a choice", () => {
    renderPicker({ onChange: vi.fn() });

    fireEvent.click(screen.getByText("Select Color"));
    expect(screen.getByText("Blue")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Blue"));

    expect(screen.queryByText("Red")).not.toBeInTheDocument();
  });

  it("does not open while disabled", () => {
    renderPicker({ disabled: true });

    fireEvent.click(screen.getByText("Select Color"));

    expect(screen.queryByText("Red")).not.toBeInTheDocument();
  });

  it("is a button, so it can be reached from the keyboard", () => {
    // The trigger used to be a <div>. Radix forwards handlers and
    // aria-expanded through asChild but does not add tabIndex, so both
    // required fields on the habit form had no keyboard path at all.
    renderPicker();

    const trigger = screen.getByRole("button", { name: /Color/ });
    trigger.focus();

    expect(trigger).toHaveFocus();
  });

  it("names itself with both the field and the current choice", () => {
    renderPicker({ value: "red" });

    expect(screen.getByRole("button", { name: "Color: Red" })).toBeInTheDocument();
  });

  it("shows an error underneath when given one", () => {
    renderPicker({ error: "Color is required" });

    expect(screen.getByText("Color is required")).toBeInTheDocument();
  });
});
