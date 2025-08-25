import { JSX, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Calendar, X } from "lucide-react";

type DateRangePickerProps = {
  position?: "bottom-left" | "bottom-right" | "top-left" | "top-right";
  onChange?: (startDate: Date | null, endDate: Date | null) => void;
};

export default function DateRangePicker({
  position = "bottom-left",
  onChange,
}: DateRangePickerProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedStartDate, setSelectedStartDate] = useState<Date | null>(null);
  const [selectedEndDate, setSelectedEndDate] = useState<Date | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const pickerRef = useRef<HTMLDivElement>(null);

  // đóng khi click ra ngoài
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const formatDate = (date: Date | null) =>
    date ? date.toLocaleDateString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" }) : "";

  const handleDayClick = (day: Date) => {
    if (!selectedStartDate || (selectedStartDate && selectedEndDate)) {
      setSelectedStartDate(day);
      setSelectedEndDate(null);
      onChange?.(day, null);
    } else {
      if (day < selectedStartDate) {
        setSelectedEndDate(selectedStartDate);
        setSelectedStartDate(day);
        onChange?.(day, selectedStartDate);
      } else {
        setSelectedEndDate(day);
        onChange?.(selectedStartDate, day);
      }
    }
  };

  const clearDates = () => {
    setSelectedStartDate(null);
    setSelectedEndDate(null);
    onChange?.(null, null);
  };

  const renderCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysArray: JSX.Element[] = [];

    for (let i = 0; i < firstDayOfMonth; i++) {
      daysArray.push(<div key={`empty-${i}`} />);
    }

    for (let i = 1; i <= daysInMonth; i++) {
      const day = new Date(year, month, i);

      let className =
        "flex h-10 w-10 items-center justify-center rounded-full mb-2 cursor-pointer text-gray-700 hover:bg-gray-100";

      if (selectedStartDate && day.getTime() === selectedStartDate.getTime()) {
        className =
          "flex h-10 w-10 items-center justify-center mb-2 rounded-l-full bg-blue-500 text-white";
      }
      if (selectedEndDate && day.getTime() === selectedEndDate.getTime()) {
        className =
          "flex h-10 w-10 items-center justify-center mb-2 rounded-r-full bg-blue-500 text-white";
      }
      if (
        selectedStartDate &&
        selectedEndDate &&
        day > selectedStartDate &&
        day < selectedEndDate
      ) {
        className =
          "flex h-10 w-10 items-center justify-center mb-2 bg-blue-100 text-blue-700";
      }

      daysArray.push(
        <div key={i} className={className} onClick={() => handleDayClick(day)}>
          {i}
        </div>
      );
    }

    return daysArray;
  };

  const positionClasses: Record<string, string> = {
    "bottom-left": "top-full left-0 mt-2",
    "bottom-right": "top-full right-0 mt-2",
    "top-left": "bottom-full left-0 mb-2",
    "top-right": "bottom-full right-0 mb-2",
  };

  return (
    <div className="relative max-w-[380px]" ref={pickerRef}>
      <div className="relative">
        <Calendar
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          size={18}
        />
        <input
          type="text"
          placeholder="Pick a date"
          className="h-10 w-full border rounded-lg pl-10 pr-10 text-gray-700 bg-white border-gray-300 outline-none focus:border-blue-500"
          value={
            selectedStartDate && selectedEndDate
              ? `${formatDate(selectedStartDate)} - ${formatDate(selectedEndDate)}`
              : selectedStartDate
              ? formatDate(selectedStartDate)
              : ""
          }
          onClick={() => setIsOpen(!isOpen)}
          readOnly
        />
        {(selectedStartDate || selectedEndDate) && (
          <button
            onClick={clearDates}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {isOpen && (
        <div
          className={`absolute z-50 max-w-[380px] shadow-md flex w-full flex-col rounded-lg border border-gray-200 bg-white px-4 py-6 sm:px-6 sm:py-[30px] ${positionClasses[position]}`}
        >
          <div className="flex items-center justify-between pb-2">
            <p className="text-base font-medium text-gray-800">
              {currentDate.toLocaleString("vi-VN", { month: "long", year: "numeric" })}
            </p>
            <div className="flex space-x-2">
              <button
                onClick={() =>
                  setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
                }
                className="h-8 w-8 flex items-center justify-center rounded border bg-gray-100 hover:bg-gray-200"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={() =>
                  setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
                }
                className="h-8 w-8 flex items-center justify-center rounded border bg-gray-100 hover:bg-gray-200"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 pb-2 pt-4 text-sm font-semibold text-gray-500">
            {["CN", "T2", "T3", "T4", "T5", "T6", "T7"].map((day) => (
              <div key={day} className="flex h-9 w-9 items-center justify-center">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 text-sm font-medium">{renderCalendar()}</div>

          <div className="flex items-center justify-center space-x-3 pt-4">
            <span className="px-3 py-1 rounded bg-gray-100 text-sm text-gray-700">
              {formatDate(selectedStartDate) || "Start Date"}
            </span>
            <span className="px-3 py-1 rounded bg-gray-100 text-sm text-gray-700">
              {formatDate(selectedEndDate) || "End Date"}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
