import { z } from "zod";
import { WeightUnit, WeightGoalMode } from "@/types/weight.type";

export const createWeightEntrySchema = z.object({
  weight: z
    .number({ message: "Weight must be a number" })
    .min(20, "Weight must be at least 20")
    .max(500, "Weight must not exceed 500"),
  unit: z.nativeEnum(WeightUnit, { message: "Please select a unit" }),
  note: z
    .string()
    .max(500, "Note must be at most 500 characters")
    .optional()
    .or(z.literal("")),
  measuredAt: z.string().optional().or(z.literal("")),
});

export type CreateWeightEntryFormData = z.infer<typeof createWeightEntrySchema>;

export const createWeightGoalSchema = z
  .object({
    targetWeight: z
      .number({ message: "Target weight must be a number" })
      .min(20, "Target weight must be at least 20")
      .max(500, "Target weight must not exceed 500"),
    unit: z.nativeEnum(WeightUnit, { message: "Please select a unit" }),
    mode: z.nativeEnum(WeightGoalMode, { message: "Please select a mode" }),
    deadline: z.string().optional().or(z.literal("")),
    toleranceWeight: z
      .number({ message: "Tolerance must be a number" })
      .positive("Tolerance must be positive")
      .optional(),
    note: z
      .string()
      .max(500, "Note must be at most 500 characters")
      .optional()
      .or(z.literal("")),
  })
  .refine(
    (data) => {
      if (data.mode === WeightGoalMode.DEADLINE) {
        return !!data.deadline;
      }
      return true;
    },
    {
      message: "Deadline is required for deadline mode",
      path: ["deadline"],
    },
  );

export type CreateWeightGoalFormData = z.infer<typeof createWeightGoalSchema>;
