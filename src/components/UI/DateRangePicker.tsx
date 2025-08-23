import { useEffect, useRef, useState } from "react";

export default function DateRangePicker() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedStartDate, setSelectedStartDate] = useState<string | null>(null);
    const [selectedEndDate, setSelectedEndDate] = useState<string | null>(null);
    const [isOpen, setIsOpen] = useState(true);

    const datepickerRef = useRef(null);

    const renderCalendar = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();

        const firstDayOfMonth = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const daysArray = [];

        for (let i = 0; i < firstDayOfMonth; i++) {
            daysArray.push(<div key={`empty-${i}`}></div>);
        }

        for (let i = 1; i <= daysInMonth; i++) {
            const day = new Date(year, month, i);
            const dayString = day.toLocaleDateString("en-US");

            let className =
                "flex h-[40px] w-[40px] items-center justify-center rounded-full mb-2 transition-colors cursor-pointer " +
                "text-gray-700 hover:bg-gray-100";

            if (selectedStartDate && dayString === selectedStartDate) {
                className =
                    "flex h-[40px] w-[40px] items-center justify-center mb-2 rounded-l-full bg-blue-500 text-white";
            }
            if (selectedEndDate && dayString === selectedEndDate) {
                className =
                    "flex h-[40px] w-[40px] items-center justify-center mb-2 rounded-r-full bg-blue-500 text-white";
            }
            if (
                selectedStartDate &&
                selectedEndDate &&
                new Date(day) > new Date(selectedStartDate) &&
                new Date(day) < new Date(selectedEndDate)
            ) {
                className =
                    "flex h-[40px] w-[40px] items-center justify-center mb-2 bg-blue-100 text-blue-700";
            }

            daysArray.push(
                <div
                    key={i}
                    className={className}
                    data-date={dayString}
                    onClick={() => handleDayClick(dayString)}
                >
                    {i}
                </div>
            );
        }

        return daysArray;
    };

    const handleDayClick = (selectedDay: string) => {
        if (!selectedStartDate || (selectedStartDate && selectedEndDate)) {
            setSelectedStartDate(selectedDay);
            setSelectedEndDate(null);
        } else {
            if (new Date(selectedDay) < new Date(selectedStartDate)) {
                setSelectedEndDate(selectedStartDate);
                setSelectedStartDate(selectedDay);
            } else {
                setSelectedEndDate(selectedDay);
            }
        }
    };

    const updateInput = () => {
        if (selectedStartDate && selectedEndDate) {
            return `${selectedStartDate} - ${selectedEndDate}`;
        } else if (selectedStartDate) {
            return selectedStartDate;
        } else {
            return "";
        }
    };

    const toggleDatepicker = () => {
        setIsOpen(!isOpen);
    };

    useEffect(() => { }, []);

    return (
        <div className="mx-auto max-w-[380px]" ref={datepickerRef}>
            <div className="relative mb-3">
                <input
                    type="text"
                    placeholder="Pick a date"
                    className="h-12 w-full appearance-none border rounded-lg pl-12 pr-4 text-gray-700 bg-white border-gray-300 outline-none focus:border-blue-500"
                    value={updateInput()}
                    onClick={toggleDatepicker}
                    readOnly
                />
            </div>

            {isOpen && (
                <div className="absolute z-50 max-w-[380px] shadow-md flex w-full flex-col rounded-lg border border-gray-200 bg-white px-4 py-6 sm:px-6 sm:py-[30px]">
                    <div className="flex items-center justify-between pb-2">
                        <p className="text-base font-medium text-gray-800">
                            {currentDate.toLocaleString("default", { month: "long" })}{" "}
                            {currentDate.getFullYear()}
                        </p>
                        <div className="flex items-center justify-end space-x-[10px]">
                            <span
                                onClick={() =>
                                    setCurrentDate(
                                        new Date(currentDate.setMonth(currentDate.getMonth() - 1))
                                    )
                                }
                                className="flex h-[30px] w-[30px] cursor-pointer items-center justify-center rounded border border-gray-300 bg-gray-100 text-gray-600 hover:bg-gray-200"
                            >
                                ‹
                            </span>
                            <span
                                onClick={() =>
                                    setCurrentDate(
                                        new Date(currentDate.setMonth(currentDate.getMonth() + 1))
                                    )
                                }
                                className="flex h-[30px] w-[30px] cursor-pointer items-center justify-center rounded border border-gray-300 bg-gray-100 text-gray-600 hover:bg-gray-200"
                            >
                                ›
                            </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-7 pb-2 pt-4 text-sm font-semibold text-gray-500">
                        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                            <div
                                key={day}
                                className="flex h-[38px] w-[38px] items-center justify-center"
                            >
                                {day}
                            </div>
                        ))}
                    </div>

                    <div id="days-container" className="grid grid-cols-7 text-sm font-medium">
                        {renderCalendar()}
                    </div>

                    <div className="flex items-center justify-center space-x-3 pt-4 sm:space-x-4">
                        <button className="h-[37px] rounded border border-gray-300 bg-white px-5 text-sm font-medium text-gray-700 hover:border-blue-500">
                            {selectedStartDate || "Select Start Date"}
                        </button>
                        <button className="h-[37px] rounded border border-gray-300 bg-white px-5 text-sm font-medium text-gray-700 hover:border-blue-500">
                            {selectedEndDate || "Select End Date"}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
