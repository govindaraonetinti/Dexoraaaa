import { useCallback } from "react";

type UseNumberOnlyOptions = {
    decimals?: boolean;
};

export default function useNumberOnly({ decimals = true }: UseNumberOnlyOptions = {}) {

    const onKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
        const allowed = ["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab"];

        if (allowed.includes(e.key)) return;

        const isNumber = /^[0-9]$/.test(e.key);
        if (isNumber) return;

        if (decimals && e.key === ".") {
            if (e.currentTarget.value.includes(".")) e.preventDefault();
            return;
        }

        e.preventDefault();
    }, [decimals]);

    const onPaste = useCallback((e: React.ClipboardEvent<HTMLInputElement>) => {
        const v = e.clipboardData.getData("text");
        const regex = decimals ? /^[0-9]*\.?[0-9]*$/ : /^[0-9]*$/;

        if (!regex.test(v)) e.preventDefault();
    }, [decimals]);

    return { onKeyDown, onPaste };
}
