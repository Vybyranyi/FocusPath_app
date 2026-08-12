import { render, screen, fireEvent } from "@testing-library/react";
import Select from '@components/ui/Select';
import type { ISelectOption } from '@components/ui/Select';
import { describe, expect, it, vi } from "vitest";

const options: ISelectOption[] = [
  { label: "Option A", value: "a" },
  { label: "Option B", value: "b" },
];

describe("Select component", () => {
  it("renders label and placeholder", () => {
    render(
      <Select
        label="Category"
        placeholder="Choose option"
        options={options}
        value=""
        onChange={() => {}}
      />
    );

    expect(screen.getByText("Category")).toBeInTheDocument();
    expect(screen.getByText("Choose option")).toBeInTheDocument();
  });

  it("renders provided options", () => {
    render(
      <Select
        label="Category"
        placeholder="Choose option"
        options={options}
        value=""
        onChange={() => {}}
      />
    );

    expect(screen.getByText("Option A")).toBeInTheDocument();
    expect(screen.getByText("Option B")).toBeInTheDocument();
  });

  it("disables select when disabled prop is true", () => {
    render(
      <Select
        label="Category"
        placeholder="Choose option"
        options={options}
        value=""
        onChange={() => {}}
        disabled
      />
    );

    const select = screen.getByRole("combobox");
    expect(select).toBeDisabled();
  });

  it("shows error message when error prop is provided", () => {
    render(
      <Select
        label="Category"
        placeholder="Choose option"
        options={options}
        value=""
        onChange={() => {}}
        error="Invalid selection"
      />
    );

    expect(screen.getByText("Invalid selection")).toBeInTheDocument();
  });

  it("calls onBlur when select loses focus", () => {
    const handleBlur = vi.fn();
    render(
      <Select
        label="Category"
        placeholder="Choose option"
        options={options}
        value=""
        onChange={() => {}}
        onBlur={handleBlur}
      />
    );

    const select = screen.getByRole("combobox");
    fireEvent.blur(select);

    expect(handleBlur).toHaveBeenCalledTimes(1);
  });

  it("renders placeholder as hidden and disabled option", () => {
    render(
      <Select
        label="Category"
        placeholder="Choose option"
        options={options}
        value=""
        onChange={() => {}}
      />
    );

    const placeholderOption = screen.getByText("Choose option") as HTMLOptionElement;
    expect(placeholderOption).toHaveAttribute("disabled");
    expect(placeholderOption).toHaveAttribute("hidden");
  });

  it("shows the placeholder in muted text when no value is selected", () => {
    render(
      <Select
        label="Category"
        placeholder="Choose option"
        options={options}
        value=""
        onChange={() => {}}
      />
    );

    const select = screen.getByRole("combobox");
    expect(select.className).toContain("text-ink-muted");
  });

  it("does not mute the text once a value is selected", () => {
    render(
      <Select
        label="Category"
        placeholder="Choose option"
        options={options}
        value="a"
        onChange={() => {}}
      />
    );

    const select = screen.getByRole("combobox");
    expect(select.className).not.toContain("text-ink-muted");
  });
});
