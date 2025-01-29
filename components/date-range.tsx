"use client";

import * as React from "react";
import { addDays, format } from "date-fns";
import { IconCalendar } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DateRange } from "react-day-picker";

interface DateRangeOptionsProps {
  className?: string;
  initialFrom?: Date;
  initialTo?: Date;
  buttonId?: string;
  buttonVariant?: any; // eslint-disable-line
  buttonClassName?: string;
  popoverContentClassName?: string;
  numberOfMonths?: number;
  onChange?: (date: { from: Date | undefined; to: Date | undefined }) => void;
}

const DateRangeOptions: React.FC<DateRangeOptionsProps> = ({
  className,
  initialFrom = new Date(2022, 0, 20),
  initialTo = addDays(new Date(2022, 0, 20), 20),
  buttonId = "date",
  buttonVariant = "outline",
  buttonClassName = "w-full border-none justify-start text-center font-normal",
  popoverContentClassName = "w-auto p-0",
  numberOfMonths = 2,
  onChange,
}) => {
  const [date, setDate] = React.useState<{ from: Date | undefined; to: Date | undefined }>({
    from: initialFrom,
    to: initialTo,
  });

  React.useEffect(() => {
    if (onChange) {
      onChange(date);
    }
  }, [date, onChange]);

  const handleSelect = (range: DateRange | undefined) => {
    setDate({ from: range?.from, to: range?.to });
  };

  return (
    <div className={cn("grid gap-2 rounded-lg outline-dashed outline-gray-200 dark:outline-gray-800", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id={buttonId}
            variant={buttonVariant}
            className={cn(buttonClassName, !date && "text-muted-foreground", "custom-text-size")}
          >
            <IconCalendar className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "LLL dd, y")} - {format(date.to, "LLL dd, y")}
                </>
              ) : (
                format(date.from, "LLL dd, y")
              )
            ) : (
              <span>Pick a date</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className={popoverContentClassName} align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={handleSelect}
            numberOfMonths={numberOfMonths}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default DateRangeOptions;