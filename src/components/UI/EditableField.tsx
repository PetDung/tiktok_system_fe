import React, { useState, useEffect, useRef } from "react";
import { Edit3, Check, X, Type, Save } from "lucide-react";

type Props = {
    value: string;
    onSave: (newValue: string) => void;
    placeholder?: string;
    className?: string;
    size?: number;
    label?: string;
    multiline?: boolean;
    maxLength?: number;
    required?: boolean;
    variant?: "default" | "inline" | "card";
    type?: "text" | "number";
    fistText? : string
};

const numberFormatter = new Intl.NumberFormat("en-US");

export default function EditableFieldModal({
    value,
    onSave,
    placeholder = "Enter value...",
    className = "",
    label = "Edit Value",
    multiline = false,
    maxLength = 255,
    required = false,
    variant = "default",
    type = "text",
    fistText = ""
}: Props) {
    const [open, setOpen] = useState(false);
    const [draft, setDraft] = useState(value);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState("");
    const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

    useEffect(() => {
        if (open && inputRef.current) {
            inputRef.current.focus();
            (inputRef.current as any).select?.();
        }
    }, [open]);

    useEffect(() => {
        setDraft(value);
    }, [value]);

    const validateInput = (input: string) => {
        if (required && !input.trim()) {
            return "This field is required";
        }
        if (maxLength && input.length > maxLength) {
            return `Maximum ${maxLength} characters allowed`;
        }
        if (type === "number" && isNaN(Number(input.replace(/,/g, "")))) {
            return "Invalid number";
        }
        return "";
    };

    async function handleSave() {
        const validationError = validateInput(draft);
        if (validationError) {
            setError(validationError);
            return;
        }

        setIsSaving(true);
        try {
            await new Promise((resolve) => setTimeout(resolve, 300));
            onSave(draft);
            setOpen(false);
            setError("");
        } catch {
            setError("Failed to save. Please try again.");
        } finally {
            setIsSaving(false);
        }
    }

    function handleCancel() {
        setDraft(value);
        setOpen(false);
        setError("");
    }

    function handleKeyDown(e: React.KeyboardEvent) {
        if (e.key === "Enter" && !multiline && !e.shiftKey) {
            e.preventDefault();
            handleSave();
        } else if (e.key === "Escape") {
            handleCancel();
        }
    }

    function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
        let input = e.target.value;

        if (type === "number") {
            // Cho phép số, dấu . và dấu , (coi , như .)
            input = input.replace(",", ".");

            // Nếu nhập gì ngoài số và . thì bỏ
            if (/^[0-9]*\.?[0-9]*$/.test(input)) {
                setDraft(input);
                setError("");
            }
            // Nếu không khớp regex thì KHÔNG update draft (người dùng gõ ký tự lạ sẽ bị bỏ qua)
        } else {
            setDraft(input);
            setError("");
        }
    }

    const renderDisplayValue = () => {
        const isEmpty = !value;
        let displayText: string;

        if (type === "number") {
            const num = Number(value);
            displayText = isNaN(num)
                ? "0"
                : numberFormatter.format(num);
        } else {
            displayText = value || placeholder;
        }


        if (variant === "inline") {
            return (
                <div
                    className="group flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-all duration-200 cursor-pointer"
                    onClick={() => {
                        setDraft(
                            type === "number" && value ? numberFormatter.format(Number(value)) : value
                        );
                        setOpen(true);
                    }}
                >
                    <span
                        className={`${isEmpty ? "text-gray-400 italic" : "text-gray-900"}`}
                    >
                        {displayText}
                    </span>
                    <Edit3 className="w-3.5 h-3.5 text-gray-400 group-hover:text-blue-500 transition-colors duration-200" />
                </div>
            );
        }

        return (
            <div className="flex items-center gap-3">
                <span
                    className={`font-medium ${isEmpty ? "text-gray-400 italic" : "text-gray-900"}`}
                >
                    {`${fistText} ${displayText}`}
                </span>
                <button
                    onClick={() => {
                        setDraft(
                            type === "number" && value
                                ? numberFormatter.format(Number(value))
                                : value
                        );
                        setOpen(true);
                    }}
                    className="group px-2 py-1 text-xs rounded-md border border-blue-200 
                        bg-blue-50 hover:bg-blue-100 hover:border-blue-300 
                        flex items-center gap-1.5 transition-all duration-200"
                >
                    <Edit3 className="w-3 h-3 text-blue-600 group-hover:scale-110 transition-transform duration-200" />
                    <span className="text-blue-700">Edit</span>
                </button>

            </div>
        );
    };

    return (
        <div className={`${className}`}>
            {renderDisplayValue()}

            {open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
                        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 rounded-t-2xl">
                            <h2 className="text-xl font-bold text-white">{label}</h2>
                        </div>

                        <div className="p-6">
                            <div className="mb-4">
                                {multiline ? (
                                    <textarea
                                        ref={inputRef as React.RefObject<HTMLTextAreaElement>}
                                        value={draft}
                                        onChange={handleChange}
                                        onKeyDown={handleKeyDown}
                                        placeholder={placeholder}
                                        rows={4}
                                        maxLength={maxLength}
                                        className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                                        disabled={isSaving}
                                    />
                                ) : (
                                    <input
                                        ref={inputRef as React.RefObject<HTMLInputElement>}
                                        type="text"
                                        value={draft}
                                        onChange={handleChange}
                                        onKeyDown={handleKeyDown}
                                        placeholder={placeholder}
                                        maxLength={maxLength}
                                        className="w-full px-4 py-3 border rounded-xl focus:ring-2  focus:border-transparent transition-all duration-200 outline-none"
                                        disabled={isSaving}
                                    />
                                )}
                                {error && (
                                    <p className="text-red-600 text-sm flex items-center gap-1 mt-2">
                                        <X className="w-3.5 h-3.5" />
                                        {error}
                                    </p>
                                )}
                            </div>
                            <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
                                <button
                                    onClick={handleCancel}
                                    disabled={isSaving}
                                    className="px-4 py-2 text-sm bg-red-400 text-white rounded-lg hover:bg-red-200 disabled:opacity-50 flex items-center gap-1"
                                >
                                    <X className="w-4 h-4" />
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={isSaving || (required && !draft.trim()) || !!error}
                                    className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-1"
                                >
                                    {isSaving ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="w-4 h-4" />
                                            Save
                                        </>
                                    )}
                                </button>
                            </div>

                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
