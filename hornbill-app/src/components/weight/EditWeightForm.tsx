"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createWeightEntrySchema,
  type CreateWeightEntryFormData,
} from "@/lib/schemas/weight.schema";
import { WeightUnit } from "@/types/weight.type";
import type { WeightEntry } from "@/types/weight.type";
import { useUpdateWeight } from "@/hooks/use-weight";
import { Scale, StickyNote, Calendar, Loader2, Check } from "lucide-react";
import { useState, useEffect } from "react";

interface EditWeightFormProps {
  entry: WeightEntry;
  onSuccess?: () => void;
}

export default function EditWeightForm({
  entry,
  onSuccess,
}: EditWeightFormProps) {
  const { updateWeight, isLoading, error } = useUpdateWeight();
  const [success, setSuccess] = useState(false);

  // Format date for datetime-local input
  const formatDateTimeLocal = (dateStr: string) => {
    const date = new Date(dateStr);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreateWeightEntryFormData>({
    resolver: zodResolver(createWeightEntrySchema),
    defaultValues: {
      weight: entry.weight,
      unit: entry.unit,
      note: entry.note || "",
      measuredAt: formatDateTimeLocal(entry.measuredAt),
    },
  });

  const selectedUnit = watch("unit");

  const onSubmit = async (data: CreateWeightEntryFormData) => {
    setSuccess(false);
    const result = await updateWeight(entry.id, {
      weight: data.weight,
      unit: data.unit,
      note: data.note || undefined,
      measuredAt: data.measuredAt || undefined,
    });

    if (result) {
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onSuccess?.();
      }, 1000);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Weight + Unit row */}
      <div className="flex gap-3">
        <div className="flex-1">
          <label className="flex items-center gap-1.5 mb-2 text-[10px] uppercase tracking-[0.2em] font-medium text-black/40">
            <Scale size={12} />
            Weight
          </label>
          <input
            type="number"
            step="0.01"
            placeholder="75.5"
            {...register("weight", { valueAsNumber: true })}
            className="w-full bg-transparent text-black text-sm placeholder:text-black/20 border-b border-black/10 hover:border-black/30 focus:outline-none focus:border-black transition-all duration-300 py-2.5 appearance-none"
          />
          {errors.weight && (
            <p className="mt-1.5 text-[11px] text-red-500/80">
              {errors.weight.message}
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

      {/* Date */}
      <div>
        <label className="flex items-center gap-1.5 mb-2 text-[10px] uppercase tracking-[0.2em] font-medium text-black/40">
          <Calendar size={12} />
          Measured at
        </label>
        <input
          type="datetime-local"
          {...register("measuredAt")}
          className="w-full bg-transparent text-black text-sm placeholder:text-black/20 border-b border-black/10 hover:border-black/30 focus:outline-none focus:border-black transition-all duration-300 py-2.5 appearance-none"
        />
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
          placeholder="After morning workout..."
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
          <p className="text-[12px] text-emerald-600">Weight entry updated</p>
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
            Updating...
          </>
        ) : (
          "Update weight"
        )}
      </button>
    </form>
  );
}
