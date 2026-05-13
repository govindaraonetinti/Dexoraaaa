import Pagination from "../../../lib/Paginatuion";

export const NumberSelect = ({
    number,
    setNumber,
    length,
    setPage
}: {
    number: string;
    setNumber: (number: string) => void;
    length: number;
    setPage: (page: number) => void
}) => {

    if (length <= 1) return null;

    const BASE_OPTIONS = [10, 20, 50, 100];

    const options =
        length < 10
            ? [length]
            : BASE_OPTIONS.filter(opt => opt <= length);

    return (
        <div className="flex items-center gap-2 text-[12px]">
            <label>Rows</label>
            <select
                value={number}
                onChange={(e) => { setNumber(e.target.value); setPage(1); }}
                className="mr-2 w-fit focus:ring-0 focus:outline-0 border bg-black border-[#4a4a4d] rounded py-1 text-[12px] flex items-center justify-center cursor-pointer"
            >
                {options.map((opt) => (
                    <option key={opt} value={opt}>
                        {opt}
                    </option>
                ))}
            </select>
        </div>
    );
};

interface PaginateProps {
    page: number;
    pageCount: number;
    setPage: (page: number) => void;
    number: string;
    setNumber: (number: string) => void;
    data: any[];
}


export const PaginateSelect = ({
    pageCount,
    page,
    setPage,
    number,
    setNumber,
    data,
}: PaginateProps) => {
    return (
        <div className="flex items-center justify-between px-5 mt-4">

            {/* Page number display */}
            {data && data.length > 0 && (
                <div>
                    <div className="py-1 px-3 text-md border bg-black border-[#4a4a4d] rounded flex items-center justify-center cursor-pointer">
                        <span>Page: {page + 1}</span>
                    </div>
                </div>
            )}

            {/* Pagination Component */}
            <Pagination pageCount={pageCount} onPageChange={setPage} />

            {/* Rows selector */}
            <NumberSelect number={number} setNumber={setNumber} length={data.length} setPage={setPage} />
        </div>
    );
};
