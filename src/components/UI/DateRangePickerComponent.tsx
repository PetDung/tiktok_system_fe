import { useState, useRef, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

type Language = 'en' | 'vi';

type DateRangePickerProps = {
  onChange?: (startDate: Date, endDate: Date) => void;
  language?: Language;
};

const translations = {
  en: {
    daysOfWeek: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
    monthNames: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
    monthNamesShort: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    placeholder: 'YYYY-MM-DD ~ YYYY-MM-DD',
    days: 'Days',
    cancel: 'Cancel',
    apply: 'Apply',
    lastMonth: 'Last Month',
    thisMonth: 'This Month'
  },
  vi: {
    daysOfWeek: ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'],
    monthNames: ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'],
    monthNamesShort: ['Th1', 'Th2', 'Th3', 'Th4', 'Th5', 'Th6', 'Th7', 'Th8', 'Th9', 'Th10', 'Th11', 'Th12'],
    placeholder: 'YYYY-MM-DD ~ YYYY-MM-DD',
    days: 'Số ngày',
    cancel: 'Hủy',
    apply: 'Áp dụng',
    lastMonth: 'Tháng trước',
    thisMonth: 'Tháng này'
  }
};

export default function DateRangePicker({ onChange, language = 'en' }: DateRangePickerProps) {
  return (
    <div className="p-8">
      <div className="max-w-md mx-auto">
        {/* Demo Usage Examples */}
        <div className="mb-8 space-y-4">
          <div>
            <h3 className="text-sm font-semibold mb-2 text-gray-700">English Version:</h3>
            <DateRangePickerComponent 
              language="en"
              onChange={(start, end) => {
                console.log('English - Selected dates:', start, end);
                alert(`Selected: ${start.toLocaleDateString()} - ${end.toLocaleDateString()}`);
              }}
            />
          </div>
          
          <div>
            <h3 className="text-sm font-semibold mb-2 text-gray-700">Vietnamese Version:</h3>
            <DateRangePickerComponent 
              language="vi"
              onChange={(start, end) => {
                console.log('Vietnamese - Ngày đã chọn:', start, end);
                alert(`Đã chọn: ${start.toLocaleDateString('vi-VN')} - ${end.toLocaleDateString('vi-VN')}`);
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function DateRangePickerComponent({ onChange, language = 'en' }: DateRangePickerProps) {
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [tempStartDate, setTempStartDate] = useState<Date | null>(null);
  const [tempEndDate, setTempEndDate] = useState<Date | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [leftMonth, setLeftMonth] = useState(new Date());
  const [rightMonth, setRightMonth] = useState(new Date(new Date().getFullYear(), new Date().getMonth() + 1));
  const [leftView, setLeftView] = useState<'days' | 'months' | 'years'>('days');
  const [rightView, setRightView] = useState<'days' | 'months' | 'years'>('days');
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const t = translations[language];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        handleCancel();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, startDate, endDate]);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      days.push({ date: new Date(year, month - 1, prevMonthLastDay - i), isCurrentMonth: false });
    }
    
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({ date: new Date(year, month, i), isCurrentMonth: true });
    }
    
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      days.push({ date: new Date(year, month + 1, i), isCurrentMonth: false });
    }
    
    return days;
  };

  const isSameDay = (date1: Date | null, date2: Date | null) => {
    if (!date1 || !date2) return false;
    return date1.toDateString() === date2.toDateString();
  };

  const isInRange = (date: Date) => {
    if (!tempStartDate || !tempEndDate) return false;
    return date >= tempStartDate && date <= tempEndDate;
  };

  const handleStartDateClick = (date: Date) => {
    setTempStartDate(date);
    if (tempEndDate && date > tempEndDate) {
      setTempEndDate(null);
    }
  };

  const handleEndDateClick = (date: Date) => {
    if (!tempStartDate || date >= tempStartDate) {
      setTempEndDate(date);
    }
  };

  const handleApply = () => {
    if (tempStartDate && tempEndDate) {
      setStartDate(tempStartDate);
      setEndDate(tempEndDate);
      setIsOpen(false);
      
      if (onChange) {
        onChange(tempStartDate, tempEndDate);
      }
    }
  };

  const handleCancel = () => {
    setTempStartDate(startDate);
    setTempEndDate(endDate);
    setIsOpen(false);
    setLeftView('days');
    setRightView('days');
  };

  const handleOpen = () => {
    setTempStartDate(startDate);
    setTempEndDate(endDate);
    setIsOpen(true);
    if (startDate) {
      setLeftMonth(new Date(startDate.getFullYear(), startDate.getMonth()));
      setRightMonth(new Date(startDate.getFullYear(), startDate.getMonth() + 1));
    }
  };

  const handleQuickSelect = (type: 'lastMonth' | 'thisMonth') => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (type === 'lastMonth') {
      const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);
      setTempStartDate(lastMonthStart);
      setTempEndDate(lastMonthEnd);
      setLeftMonth(lastMonthStart);
      setRightMonth(new Date(lastMonthStart.getFullYear(), lastMonthStart.getMonth() + 1));
    } else if (type === 'thisMonth') {
      const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
      const thisMonthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      setTempStartDate(thisMonthStart);
      setTempEndDate(thisMonthEnd);
      setLeftMonth(thisMonthStart);
      setRightMonth(new Date(thisMonthStart.getFullYear(), thisMonthStart.getMonth() + 1));
    }
  };

  const formatDateRange = () => {
    if (!startDate || !endDate) return '';
    const formatDate = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    return `${formatDate(startDate)} ~ ${formatDate(endDate)}`;
  };

  const renderMonthPicker = (currentMonth: Date, isLeft: boolean) => {
    const year = currentMonth.getFullYear();
    return (
      <div className="grid grid-cols-3 gap-2">
        {t.monthNamesShort.map((month, index) => (
          <button
            key={index}
            onClick={() => {
              if (isLeft) {
                setLeftMonth(new Date(year, index, 1));
                setLeftView('days');
              } else {
                setRightMonth(new Date(year, index, 1));
                setRightView('days');
              }
            }}
            className="px-3 py-2 text-sm rounded hover:bg-blue-100 hover:text-blue-700 transition-colors"
          >
            {month}
          </button>
        ))}
      </div>
    );
  };

  const renderYearPicker = (currentMonth: Date, isLeft: boolean) => {
    const currentYear = currentMonth.getFullYear();
    const startYear = Math.floor(currentYear / 12) * 12;
    const years = Array.from({ length: 12 }, (_, i) => startYear + i);

    return (
      <div>
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={() => isLeft ? setLeftMonth(new Date(startYear - 12, 0)) : setRightMonth(new Date(startYear - 12, 0))}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm font-semibold">{startYear} - {startYear + 11}</span>
          <button
            onClick={() => isLeft ? setLeftMonth(new Date(startYear + 12, 0)) : setRightMonth(new Date(startYear + 12, 0))}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {years.map((year) => (
            <button
              key={year}
              onClick={() => {
                if (isLeft) {
                  setLeftMonth(new Date(year, leftMonth.getMonth(), 1));
                  setLeftView('months');
                } else {
                  setRightMonth(new Date(year, rightMonth.getMonth(), 1));
                  setRightView('months');
                }
              }}
              className="px-3 py-2 text-sm rounded hover:bg-blue-100 hover:text-blue-700 transition-colors"
            >
              {year}
            </button>
          ))}
        </div>
      </div>
    );
  };

  const renderCalendar = (month: Date, isLeft: boolean) => {
    const view = isLeft ? leftView : rightView;
    const setView = isLeft ? setLeftView : setRightView;
    const setMonth = isLeft ? setLeftMonth : setRightMonth;
    const days = getDaysInMonth(month);

    return (
      <div className="flex-1">
        <div className="flex items-center justify-between mb-2 px-1">
          <button
            onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1))}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <ChevronLeft className="w-4 h-4 text-gray-600" />
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setView(view === 'months' ? 'days' : 'months')}
              className="text-sm font-semibold text-gray-700 hover:text-blue-600 transition-colors"
            >
              {t.monthNames[month.getMonth()]}
            </button>
            <button
              onClick={() => setView(view === 'years' ? 'days' : 'years')}
              className="text-sm font-semibold text-gray-700 hover:text-blue-600 transition-colors"
            >
              {month.getFullYear()}
            </button>
          </div>
          <button
            onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1))}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <ChevronRight className="w-4 h-4 text-gray-600" />
          </button>
        </div>

        {view === 'days' && (
          <>
            <div className="grid grid-cols-7 gap-1 mb-1">
              {t.daysOfWeek.map((day) => (
                <div key={day} className="text-center text-xs font-medium text-gray-500 py-1">{day}</div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {days.map((day, index) => {
                const { date, isCurrentMonth } = day;
                const isStart = isSameDay(date, tempStartDate);
                const isEnd = isSameDay(date, tempEndDate);
                const inRange = isInRange(date);

                return (
                  <button
                    key={index}
                    onClick={() => isLeft ? handleStartDateClick(date) : handleEndDateClick(date)}
                    disabled={!isCurrentMonth || (!isLeft && tempStartDate && date < tempStartDate) || false}
                    className={`
                      aspect-square p-1 text-xs transition-all rounded
                      ${!isCurrentMonth ? 'text-gray-300 cursor-default' : ''}
                      ${isStart || isEnd ? 'bg-blue-500 text-white font-semibold' : ''}
                      ${inRange && isCurrentMonth && !isStart && !isEnd ? 'bg-blue-100 text-blue-700' : ''}
                      ${isCurrentMonth && !isStart && !isEnd && !inRange ? 'hover:bg-gray-100 text-gray-700' : ''}
                      ${!isLeft && tempStartDate && date < tempStartDate ? 'opacity-30 cursor-not-allowed' : ''}
                    `}
                  >
                    {date.getDate()}
                  </button>
                );
              })}
            </div>
          </>
        )}

        {view === 'months' && renderMonthPicker(month, isLeft)}
        {view === 'years' && renderYearPicker(month, isLeft)}
      </div>
    );
  };

  return (
    <div className="relative" ref={containerRef}>
      <div
        onClick={handleOpen}
        className="bg-white rounded-lg shadow-sm border border-gray-300 p-3 cursor-pointer hover:border-blue-400 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={formatDateRange()}
            readOnly
            placeholder={t.placeholder}
            className="flex-1 outline-none text-gray-700 text-sm cursor-pointer bg-transparent"
          />
        </div>
      </div>

      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 z-50 p-4"
          style={{
            minWidth: '650px',
            left: '50%',
            transform: 'translateX(-50%)'
          }}
        >
          {/* Quick Select Buttons */}
          <div className="flex gap-2 mb-4 pb-3 border-b border-gray-200">
            <button
              onClick={() => handleQuickSelect('lastMonth')}
              className="px-3 py-1.5 text-xs border border-gray-300 rounded hover:bg-gray-50 transition-colors"
            >
              {t.lastMonth}
            </button>
            <button
              onClick={() => handleQuickSelect('thisMonth')}
              className="px-3 py-1.5 text-xs border border-gray-300 rounded hover:bg-gray-50 transition-colors"
            >
              {t.thisMonth}
            </button>
          </div>

          <div className="flex gap-4 mb-4">
            {renderCalendar(leftMonth, true)}
            <div className="w-px bg-gray-200"></div>
            {renderCalendar(rightMonth, false)}
          </div>

          {tempStartDate && tempEndDate && (
            <div className="mb-3 p-2 bg-blue-50 rounded text-xs text-center">
              <span className="text-gray-600">{t.days}: </span>
              <span className="font-bold text-blue-700">
                {Math.ceil((tempEndDate.getTime() - tempStartDate.getTime()) / (1000 * 60 * 60 * 24)) + 1}
              </span>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-3 border-t border-gray-200">
            <button
              onClick={handleCancel}
              className="px-4 py-1.5 border border-gray-300 text-gray-700 rounded text-sm hover:bg-gray-50 transition-colors"
            >
              {t.cancel}
            </button>
            <button
              onClick={handleApply}
              disabled={!tempStartDate || !tempEndDate}
              className="px-4 py-1.5 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t.apply}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}