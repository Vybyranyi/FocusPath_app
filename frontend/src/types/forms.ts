import type { HabitType } from "@shared/index";

/**
 * What the create-habit form holds while it is being filled in.
 *
 * Deliberately not the API's `Habit`: the field names follow the labels on
 * screen, the duration is the string an <input> gives back, and the start date
 * is undefined until something is picked. Conflating the two is what previously
 * let the store be typed as the form while holding API payloads.
 */
export interface CreateHabitFormValues {
  color: string;
  emoji: string;
  habitName: string;
  habitDescription: string;
  startDate: Date | undefined;
  aiEnabled: boolean;
  duration: string;
  habitType: HabitType;
}
