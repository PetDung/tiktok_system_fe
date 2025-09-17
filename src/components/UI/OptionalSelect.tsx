import React, { useState, useRef, useEffect } from "react";

export type Option = {
    value: string;
    label: string;
    description?: string;
};

type Props = {
    options: Option[];
    value?: string | null; // null or undefined means "no selection"
    placeholder?: string;
    allowClear?: boolean; // show clear button when selected
    onChange?: (value: string | null) => void;
    className?: string;
    size?: number;
};

// A lightweight, accessible single-select component (choose one or none)
export default function OptionalSelect({
    options,
    value = null,
    placeholder = "Select...",
    allowClear = true,
    onChange,
    className = "",
    size = 200
}: Props) {
    const [open, setOpen] = useState(false);
    const [highlight, setHighlight] = useState<number>(-1);
    const rootRef = useRef<HTMLDivElement | null>(null);

    // Close on outside click
    useEffect(() => {
        function onDoc(e: MouseEvent) {
            if (!rootRef.current) return;
            if (!rootRef.current.contains(e.target as Node)) setOpen(false);
        }
        document.addEventListener("mousedown", onDoc);
        return () => document.removeEventListener("mousedown", onDoc);
    }, []);

    const selected = options.find((o) => o.value === value) || null;

    function toggle() {
        setOpen((s) => !s);
    }

    function handleSelect(value : string | null) {
        console.log(value)
        onChange?.(value);
        setOpen(false);
    }

    function clear() {
        onChange?.(null);
        setOpen(false);
    }

    function onKeyDown(e: React.KeyboardEvent) {
        if (e.key === "ArrowDown") {
            e.preventDefault();
            setOpen(true);
            setHighlight((h) => Math.min(h + 1, options.length - 1));
        }
        if (e.key === "ArrowUp") {
            e.preventDefault();
            setOpen(true);
            setHighlight((h) => Math.max(h - 1, 0));
        }
        if (e.key === "Enter") {
            e.preventDefault();
            if (open && highlight >= 0) handleSelect(options[highlight].value);
            else setOpen((s) => !s);
        }
        if (e.key === "Escape") {
            setOpen(false);
        }
    }

    useEffect(() => {
        if (!open) setHighlight(-1);
    }, [open]);

    return (
        <div ref={rootRef} className={`relative inline-block ${className}`}>
            <button
                type="button"
                aria-haspopup="listbox"
                aria-expanded={open}
                onClick={toggle}
                onKeyDown={onKeyDown}
                style={{ width: `${size}px` }}
                className="text-left px-3 py-2 bg-white border border-gray-200 rounded-lg shadow-sm flex items-center justify-between gap-2 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-400"
            >
                <div className="flex flex-col">
                    <span className={`truncate ${selected ? "text-gray-900 font-medium" : "text-gray-400"}`}>
                        {selected ? selected.label : placeholder}
                    </span>
                    {selected?.description && (
                        <small className="text-gray-500 text-xs">{selected.description}</small>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    {selected && allowClear && (
                        <span
                            role="button"
                            tabIndex={0}
                            onClick={(e) => {
                                e.stopPropagation();
                                clear();
                            }}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ") {
                                    e.preventDefault();
                                    clear();
                                }
                            }}
                            aria-label="Clear selection"
                            className="p-1 rounded hover:bg-gray-100 cursor-pointer focus:outline-none"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                <path
                                    fillRule="evenodd"
                                    d="M6.707 6.707a1 1 0 00-1.414-1.414L3 7.586 1.707 6.293A1 1 0 10.293 7.707L1.586 9l-1.293 1.293a1 1 0 101.414 1.414L3 10.414l1.293 1.293a1 1 0 001.414-1.414L4.414 9l1.293-1.293z"
                                    clipRule="evenodd"
                                />
                            </svg>
                        </span>
                    )}


                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className={`h-5 w-5 transition-transform ${open ? "transform rotate-180" : ""}`}
                        viewBox="0 0 20 20"
                        fill="none"
                        stroke="currentColor"
                    >
                        <path d="M6 8l4 4 4-4" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </div>
            </button>

            {open && (
                <ul
                    role="listbox"
                    aria-activedescendant={highlight >= 0 ? `opt-${highlight}` : undefined}
                    tabIndex={-1}
                    className="absolute z-50 mt-2 w-56 max-h-56 overflow-auto bg-white border border-gray-200 rounded-lg shadow-lg py-1"
                >   
                    <li
                        id="opt--none"
                        key="none"
                        role="option"
                        aria-selected={value === null}
                        onMouseEnter={() => setHighlight(-1)}
                        onClick={() => handleSelect(null)}
                        className={`px-3 py-2 cursor-pointer flex flex-col gap-0.5 ${highlight === -1 ? "bg-indigo-50" : "hover:bg-gray-50"
                            } ${value === null ? "font-semibold" : ""}`}
                    >
                        <span className="truncate">Không có</span>
                    </li>

                    {options.map((opt, idx) => (
                        <li
                            id={`opt-${idx}`}
                            key={opt.value}
                            role="option"
                            aria-selected={value === opt.value}
                            onMouseEnter={() => setHighlight(idx)}
                            onClick={() => handleSelect(opt.value)}
                            className={`px-3 py-2 cursor-pointer flex flex-col gap-0.5 ${highlight === idx ? "bg-indigo-50" : "hover:bg-gray-50"
                                } ${value === opt.value ? "font-semibold" : ""}`}
                        >
                            <span className="truncate">{opt.label}</span>
                            {opt.description && <small className="text-xs text-gray-500">{opt.description}</small>}
                        </li>
                    ))}

                    {options.length === 0 && (
                        <li className="px-3 py-2 text-gray-500">No options</li>
                    )}
                </ul>
            )}
        </div>
    );
}
