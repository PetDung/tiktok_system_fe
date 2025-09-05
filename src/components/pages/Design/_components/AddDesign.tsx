"use client";

import { useEffect, useRef, useState } from "react";

export type DesignRequest = {
    name: string;
    frontSide: string;
    backSide: string;
    leftSide: string;
    rightSide: string;
};

type Props = {
    open: boolean;
    onClose: () => void;
    onSubmit: (payload: DesignRequest) => Promise<void> | void;
    initial?: Partial<DesignRequest>;
    title?: string;
};

export default function DesignModal({
    open,
    onClose,
    onSubmit,
    initial = {},
    title = "Add new design",
}: Props) {
    const [name, setName] = useState(initial.name ?? "");
    const [frontSide, setFrontSide] = useState(initial.frontSide ?? "");
    const [backSide, setBackSide] = useState(initial.backSide ?? "");
    const [leftSide, setLeftSide] = useState(initial.leftSide ?? "");
    const [rightSide, setRightSide] = useState(initial.rightSide ?? "");
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);
    const modalRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (open) {
            setErrors({});
            setLoading(false);
            // focus first input
            setTimeout(() => {
                modalRef.current?.querySelector("input")?.focus();
            }, 50);
        }
    }, [open]);

    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                onClose();
            }
        };
        if (open) document.addEventListener("keydown", handleKey);
        return () => document.removeEventListener("keydown", handleKey);
    }, [open, onClose]);

    if (!open) return null;

    const validate = () => {
        const err: Record<string, string> = {};
        if (!name.trim()) err.name = "Name is required";
        // optional: check at least one side provided
        if (!frontSide.trim() && !backSide.trim() && !leftSide.trim() && !rightSide.trim()) {
            err.sides = "At least one side value is required";
        }

        setErrors(err);
        return Object.keys(err).length === 0;
    };

    const handleSubmit = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!validate()) return;

        const payload: DesignRequest = {
            name: name.trim(),
            frontSide: frontSide.trim(),
            backSide: backSide.trim(),
            leftSide: leftSide.trim(),
            rightSide: rightSide.trim(),
        };

        try {
            setLoading(true);
            await onSubmit(payload);
            setLoading(false);
            handleClose();
        } catch (err) {
            console.error(err);
            setLoading(false);
            setErrors(prev => ({ ...prev, submit: (err as Error)?.message ?? "Submit failed" }));
        }
    };

    const handleClose = () => {
        setName(initial.name ?? "");
        setFrontSide(initial.frontSide ?? "");
        setBackSide(initial.backSide ?? "");
        setLeftSide(initial.leftSide ?? "");
        setRightSide(initial.rightSide ?? "");
        setErrors({});
        setLoading(false);
        onClose();
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center"
            aria-modal="true"
            role="dialog"
        >
            {/* backdrop */}
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                onClick={() => !loading && handleClose()}
            />

            {/* modal */}
            <div
                ref={modalRef}
                className="relative z-10 w-[95%] max-w-2xl rounded-lg bg-white shadow-lg ring-1 ring-black/5"
            >
                {/* header */}
                <div className="flex items-center justify-between border-b px-6 py-4">
                    <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
                    <button
                        type="button"
                        onClick={() => !loading && handleClose()}
                        aria-label="Close"
                        className="rounded-md px-2 py-1 text-gray-600 hover:bg-gray-100"
                    >
                        ✕
                    </button>
                </div>

                {/* body */}
                <form onSubmit={handleSubmit} className="px-6 py-4">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        {/* Name */}
                        <div className="col-span-1 sm:col-span-2">
                            <label className="mb-1 block text-sm font-medium text-gray-700">Name</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className={`w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 ${errors.name ? "border-rose-500" : "border-gray-200"
                                    }`}
                                placeholder="Design name"
                                disabled={loading}
                            />
                            {errors.name && <p className="mt-1 text-xs text-rose-600">{errors.name}</p>}
                        </div>

                        {/* Front */}
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">Front Side</label>
                            <input
                                type="text"
                                value={frontSide}
                                onChange={(e) => setFrontSide(e.target.value)}
                                className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                                placeholder="Front design URL or description"
                                disabled={loading}
                            />
                        </div>

                        {/* Back */}
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">Back Side</label>
                            <input
                                type="text"
                                value={backSide}
                                onChange={(e) => setBackSide(e.target.value)}
                                className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                                placeholder="Back design URL or description"
                                disabled={loading}
                            />
                        </div>

                        {/* Left */}
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">Left Side</label>
                            <input
                                type="text"
                                value={leftSide}
                                onChange={(e) => setLeftSide(e.target.value)}
                                className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                                placeholder="Left design URL or description"
                                disabled={loading}
                            />
                        </div>

                        {/* Right */}
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">Right Side</label>
                            <input
                                type="text"
                                value={rightSide}
                                onChange={(e) => setRightSide(e.target.value)}
                                className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                                placeholder="Right design URL or description"
                                disabled={loading}
                            />
                        </div>
                    </div>

                    {errors.sides && <p className="mt-3 text-sm text-rose-600">{errors.sides}</p>}
                    {errors.submit && <p className="mt-3 text-sm text-rose-600">{errors.submit}</p>}

                    {/* footer */}
                    <div className="mt-6 flex items-center justify-end gap-3 border-t pt-4">
                        <button
                            type="button"
                            onClick={() => !loading && handleClose()}
                            className="rounded-md px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                            disabled={loading}
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-60"
                            disabled={loading}
                        >
                            {loading ? (
                                <svg className="h-4 w-4 animate-spin text-white" viewBox="0 0 24 24">
                                    <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                    <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                                </svg>
                            ) : null}
                            Save
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
