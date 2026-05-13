import { useMemo, useState } from "react";

export function usePagination<T>(data: T[]) {
    const [page, setPage] = useState(0);
    const [number, setNumber] = useState<string>("10");

    const pageCount = Math.ceil(data.length / Number(number));

    const paginatedData = useMemo(() => {
        const start = page * Number(number);
        return data.slice(start, start + Number(number));
    }, [page, data, number]);

    return {
        page,
        setPage,
        pageCount,
        paginatedData,
        setNumber,
        number
    };
}
