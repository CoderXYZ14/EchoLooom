"use client";

import * as React from "react";
import { ChevronDownIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DateTimePickerProps {
  value?: Date;
  onChange?: (date: Date | undefined) => void;
}

export function DateTimePicker({ value, onChange }: DateTimePickerProps) {
  const [open, setOpen] = React.useState(false);
  const [internalDate, setInternalDate] = React.useState<Date | undefined>(
    undefined
  );
  const [time, setTime] = React.useState("10:30");

  const date = value || internalDate;

  const handleDateChange = (newDate: Date | undefined) => {
    if (onChange) {
      // Combine date with time
      if (newDate && time) {
        const [hours, minutes] = time.split(":");
        const combinedDate = new Date(newDate);
        combinedDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        onChange(combinedDate);
      } else {
        onChange(newDate);
      }
    } else {
      setInternalDate(newDate);
    }
  };

  const handleTimeChange = (newTime: string) => {
    setTime(newTime);
    if (date && onChange) {
      const [hours, minutes] = newTime.split(":");
      const combinedDate = new Date(date);
      combinedDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      onChange(combinedDate);
    }
  };

  return (
    <div className="flex gap-4">
      <div className="flex flex-col gap-3">
        <Label htmlFor="date-picker" className="px-1">
          Date
        </Label>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              id="date-picker"
              className="w-32 justify-between font-normal"
            >
              {date ? date.toLocaleDateString() : "Select date"}
              <ChevronDownIcon />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto overflow-hidden p-0" align="start">
            <Calendar
              mode="single"
              selected={date}
              captionLayout="dropdown"
              onSelect={(date) => {
                handleDateChange(date);
                setOpen(false);
              }}
            />
          </PopoverContent>
        </Popover>
      </div>
      <div className="flex flex-col gap-3">
        <Label htmlFor="time-picker" className="px-1">
          Time
        </Label>
        <Input
          type="time"
          id="time-picker"
          step="1"
          value={time}
          onChange={(e) => handleTimeChange(e.target.value)}
          className="bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
        />
      </div>
    </div>
  );
}
