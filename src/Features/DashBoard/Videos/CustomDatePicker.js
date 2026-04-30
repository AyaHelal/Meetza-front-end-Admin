import React, { useState, useRef, useEffect } from 'react';
import { Calendar, CaretLeft, CaretRight } from 'phosphor-react';
import './CustomDatePicker.css';

const CustomDatePicker = ({ value, onChange, name, style, className = "" }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(value ? new Date(value) : null);
    const datePickerRef = useRef(null);
    const inputRef = useRef(null);
    const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });

    useEffect(() => {
        if (value) {
            setSelectedDate(new Date(value));
            setCurrentMonth(new Date(value));
        }
    }, [value]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (datePickerRef.current && !datePickerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        const updatePosition = () => {
            if (isOpen && datePickerRef.current) {
                const rect = datePickerRef.current.getBoundingClientRect();
                setDropdownPosition({
                    top: rect.bottom + 8,
                    left: rect.left,
                    width: Math.max(rect.width, 400)
                });
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            window.addEventListener('scroll', updatePosition, true);
            window.addEventListener('resize', updatePosition);
            updatePosition();
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            window.removeEventListener('scroll', updatePosition, true);
            window.removeEventListener('resize', updatePosition);
        };
    }, [isOpen]);

    const formatDateForInput = (date) => {
        if (!date) return '';
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const getDaysInMonth = (date) => {
        return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (date) => {
        return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    };

    const handleDateSelect = (day) => {
        const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
        setSelectedDate(newDate);
        setIsOpen(false);

        const formattedDate = formatDateForInput(newDate);
        if (onChange) {
            const syntheticEvent = {
                target: {
                    name: name,
                    value: formattedDate
                }
            };
            onChange(syntheticEvent);
        }
    };

    const handlePreviousMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
    };

    const handleToday = () => {
        const today = new Date();
        setCurrentMonth(today);
        setSelectedDate(today);
        setIsOpen(false);

        const formattedDate = formatDateForInput(today);
        if (onChange) {
            const syntheticEvent = {
                target: {
                    name: name,
                    value: formattedDate
                }
            };
            onChange(syntheticEvent);
        }
    };

    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDay = getFirstDayOfMonth(currentMonth);
    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
        days.push(null);
    }

    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
        days.push(day);
    }

    const today = new Date();
    const isToday = (day) => {
        return day === today.getDate() &&
            currentMonth.getMonth() === today.getMonth() &&
            currentMonth.getFullYear() === today.getFullYear();
    };

    const isSelected = (day) => {
        if (!selectedDate) return false;
        return day === selectedDate.getDate() &&
            currentMonth.getMonth() === selectedDate.getMonth() &&
            currentMonth.getFullYear() === selectedDate.getFullYear();
    };

    return (
        <div className="custom-date-picker-wrapper" ref={datePickerRef}>
            <div
                className={`custom-date-input-container ${className}`}
                onClick={() => {
                    if (!isOpen && datePickerRef.current) {
                        const rect = datePickerRef.current.getBoundingClientRect();
                        setDropdownPosition({
                            top: rect.bottom + 8,
                            left: rect.left,
                            width: Math.max(rect.width, 400)
                        });
                    }
                    setIsOpen(!isOpen);
                }}
                style={style}
            >
                <input
                    ref={inputRef}
                    type="text"
                    readOnly
                    value={selectedDate ? formatDateForInput(selectedDate) : ''}
                    placeholder="Select a date"
                    className="custom-date-input-field py-2 rounded-4 "
                    style={{
                        border: "1px solid #ABABAB",
                        fontSize: "16px",
                        width: "100%",
                        padding: "0.75rem",
                        borderRadius: "12px",
                        cursor: "pointer",
                        backgroundColor: "#FFFFFF",
                        outline: "none",
                    }}
                    onFocus={(e) => {
                        e.target.style.borderColor = "#0076EA";
                        e.target.style.boxShadow = "0 0 0 0.2rem rgba(0, 118, 234, 0.25)";
                    }}
                    onBlur={(e) => {
                        e.target.style.borderColor = "#E9ECEF";
                        e.target.style.boxShadow = "none";
                    }}
                />
                <Calendar
                    size={20}
                    weight="bold"
                    className="custom-date-icon"
                    style={{ color: "#0076EA" }}
                />
            </div>

            {isOpen && (
                <div
                    className="custom-date-picker-dropdown"
                    style={{
                        position: 'fixed',
                        top: `${dropdownPosition.top}px`,
                        left: `${dropdownPosition.left}px`,
                        width: `${dropdownPosition.width || 400}px`,
                        minWidth: '400px',
                        zIndex: 9999
                    }}
                >
                    <div className="custom-date-picker-header">
                        <button
                            type="button"
                            className="custom-date-picker-nav-btn"
                            onClick={handlePreviousMonth}
                        >
                            <CaretLeft size={20} weight="bold" />
                        </button>
                        <div className="custom-date-picker-month-year">
                            {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                        </div>
                        <button
                            type="button"
                            className="custom-date-picker-nav-btn"
                            onClick={handleNextMonth}
                        >
                            <CaretRight size={20} weight="bold" />
                        </button>
                    </div>

                    <div className="custom-date-picker-weekdays">
                        {weekDays.map((day) => (
                            <div key={day} className="custom-date-picker-weekday">
                                {day}
                            </div>
                        ))}
                    </div>

                    <div className="custom-date-picker-days">
                        {days.map((day, index) => {
                            if (day === null) {
                                return <div key={`empty-${index}`} className="custom-date-picker-day empty" />;
                            }
                            return (
                                <button
                                    key={day}
                                    type="button"
                                    className={`custom-date-picker-day ${isToday(day) ? 'today' : ''
                                        } ${isSelected(day) ? 'selected' : ''}`}
                                    onClick={() => handleDateSelect(day)}
                                >
                                    {day}
                                </button>
                            );
                        })}
                    </div>

                    <div className="custom-date-picker-footer">
                        <button
                            type="button"
                            className="custom-date-picker-today-btn"
                            onClick={handleToday}
                        >
                            Today
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CustomDatePicker;

