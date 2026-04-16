"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createWeightGoalSchema,
  type CreateWeightGoalFormData,
} from "@/lib/schemas/weight.schema";
import { WeightUnit, WeightGoalMode } from "@/types/weight.type";
import { useAddGoal } from "@/hooks/use-weight";
import {
  Target,
  Calendar,
  StickyNote,
  Loader2,
  Check,
  Crosshair,
  Timer,
} from "lucide-react";
import { useState } from "react";

interface AddGoalFormProps {
  onSuccess?: () => void;
}

export default function AddGoalForm({ onSuccess }: AddGoalFormProps) {
  const { addGoal, isLoading, error } = useAddGoal();
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreateWeightGoalFormData>({
    resolver: zodResolver(createWeightGoalSchema),
    defaultValues: {
      unit: WeightUnit.KG,
      mode: WeightGoalMode.MILESTONE,
      note: "",
      deadline: "",
    },
  });

  const selectedUnit = watch("unit");
  const selectedMode = watch("mode");

  const onSubmit = async (data: CreateWeightGoalFormData) => {
    setSuccess(false);
    const result = await addGoal({
      targetWeight: data.targetWeight,
      unit: data.unit,
      mode: data.mode,
      deadline: data.deadline || undefined,
      toleranceWeight: data.toleranceWeight || undefined,
      note: data.note || undefined,
    });

    if (result) {
      setSuccess(true);
      reset();
      setTimeout(() => setSuccess(false), 3000);
      onSuccess?.();
    }
  };

  const modeOptions = [
    {
      value: WeightGoalMode.MILESTONE,
      label: "Milestone",
      description: "Reach your target, no time limit",
      icon: Crosshair,
    },
    {
      value: WeightGoalMode.DEADLINE,
      label: "Deadline",
      description: "Reach your target by a date",
      icon: Timer,
    },
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Target Weight + Unit */}
      <div className="flex gap-3">
        <div className="flex-1">
          <label className="flex items-center gap-1.5 mb-2 text-[10px] uppercase tracking-[0.2em] font-medium text-black/40">
            <Target size={12} />
            Target weight
          </label>
          <input
            type="number"
            step="0.01"
            placeholder="70.0"
            {...register("targetWeight", { valueAsNumber: true })}
            className="w-full bg-transparent text-black text-sm placeholder:text-black/20 border-b border-black/10 hover:border-black/30 focus:outline-none focus:border-black transition-all duration-300 py-2.5 appearance-none"
          />
          {errors.targetWeight && (
            <p className="mt-1.5 text-[11px] text-red-500/80">
              {errors.targetWeight.message}
            </p>
          )}
        </div>

        <div className="w-28">
          <label className="block mb-2 text-[10px] uppercase tracking-[0.2em] font-medium text-black/40">
            Unit
          </label>
          <div className="flex rounded-lg border border-black/10 overflow-hidden">
            {Object.values(WeightUnit).map((unit) => (
              <button
                key={unit}
                type="button"
                onClick={() => setValue("unit", unit)}
                className={`flex-1 py-2.5 text-xs font-medium transition-all duration-200 cursor-pointer ${
                  selectedUnit === unit
                    ? "bg-black text-white"
                    : "bg-transparent text-black/40 hover:text-black/60 hover:bg-black/5"
                }`}
              >
                {unit}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Mode selection */}
      <div>
        <label className="block mb-3 text-[10px] uppercase tracking-[0.2em] font-medium text-black/40">
          Goal type
        </label>
        <div className="grid grid-cols-2 gap-2">
          {modeOptions.map(({ value, label, description, icon: Icon }) => (
            <button
              key={value}
              type="button"
              onClick={() => setValue("mode", value)}
              className={`flex flex-col items-start gap-1 p-3.5 rounded-xl border text-left transition-all duration-200 cursor-pointer ${
                selectedMode === value
                  ? "border-black bg-black/[0.02] shadow-sm"
                  : "border-black/10 hover:border-black/20 hover:bg-black/[0.01]"
              }`}
            >
              <div className="flex items-center gap-2">
                <Icon
                  size={14}
                  className={
                    selectedMode === value ? "text-black" : "text-black/30"
                  }
                />
                <span
                  className={`text-sm font-medium ${
                    selectedMode === value ? "text-black" : "text-black/50"
                  }`}
                >
                  {label}
                </span>
              </div>
              <span className="text-[11px] text-black/30 leading-tight">
                {description}
              </span>
            </button>
          ))}
        </div>
        {errors.mode && (
          <p className="mt-1.5 text-[11px] text-red-500/80">
            {errors.mode.message}
          </p>
        )}
      </div>

      {/* Deadline (conditional) */}
      {selectedMode === WeightGoalMode.DEADLINE && (
        <div>
          <label className="flex items-center gap-1.5 mb-2 text-[10px] uppercase tracking-[0.2em] font-medium text-black/40">
            <Calendar size={12} />
            Deadline
          </label>
          <input
            type="datetime-local"
            {...register("deadline")}
            className="w-full bg-transparent text-black text-sm placeholder:text-black/20 border-b border-black/10 hover:border-black/30 focus:outline-none focus:border-black transition-all duration-300 py-2.5 appearance-none"
          />
          {errors.deadline && (
            <p className="mt-1.5 text-[11px] text-red-500/80">
              {errors.deadline.message}
            </p>
          )}
        </div>
      )}

      {/* Tolerance */}
      <div>
        <label className="flex items-center gap-1.5 mb-2 text-[10px] uppercase tracking-[0.2em] font-medium text-black/40">
          Tolerance
          <span className="text-black/20 normal-case tracking-normal">
            (optional, for maintain goals)
          </span>
        </label>
        <input
          type="number"
          step="0.1"
          placeholder="1.5"
          {...register("toleranceWeight", { valueAsNumber: true })}
          className="w-full bg-transparent text-black text-sm placeholder:text-black/20 border-b border-black/10 hover:border-black/30 focus:outline-none focus:border-black transition-all duration-300 py-2.5 appearance-none"
        />
        {errors.toleranceWeight && (
          <p className="mt-1.5 text-[11px] text-red-500/80">
            {errors.toleranceWeight.message}
          </p>
        )}
      </div>

      {/* Note */}
      <div>
        <label className="flex items-center gap-1.5 mb-2 text-[10px] uppercase tracking-[0.2em] font-medium text-black/40">
          <StickyNote size={12} />
          Note
          <span className="text-black/20 normal-case tracking-normal">
            (optional)
          </span>
        </label>
        <textarea
          rows={2}
          placeholder="Lose weight before summer..."
          {...register("note")}
          className="w-full bg-transparent text-black text-sm placeholder:text-black/20 border-b border-black/10 hover:border-black/30 focus:outline-none focus:border-black transition-all duration-300 py-2.5 resize-none"
        />
        {errors.note && (
          <p className="mt-1.5 text-[11px] text-red-500/80">
            {errors.note.message}
          </p>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-red-50 border border-red-100">
          <p className="text-[12px] text-red-600">{error}</p>
        </div>
      )}

      {/* Success */}
      {success && (
        <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-emerald-50 border border-emerald-100">
          <Check size={14} className="text-emerald-600" />
          <p className="text-[12px] text-emerald-600">Goal created</p>
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-2 bg-black text-white text-sm font-medium py-3 rounded-xl hover:bg-black/85 active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
      >
        {isLoading ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            Creating...
          </>
        ) : (
          "Set goal"
        )}
      </button>
    </form>
  );
}
