import ReactPaginate from "react-paginate";
import { SlArrowLeft, SlArrowRight } from "react-icons/sl";

interface Props {
    pageCount: number;
    onPageChange: (page: number) => void;
}

const Pagination = ({ pageCount, onPageChange }: Props) => {
    if (pageCount <= 1) {
        return (
            <div></div>
        )
    } else
        return (
            <ReactPaginate
                breakLabel="..."
                previousLabel={<SlArrowLeft className="text-[10px]" />}
                nextLabel={<SlArrowRight className="text-[10px]" />}
                pageCount={pageCount}
                marginPagesDisplayed={2}
                pageRangeDisplayed={2}
                onPageChange={({ selected }) => onPageChange(selected)}

                containerClassName="flex gap-2 justify-center py-0"

                pageClassName="border border-[#4a4a4d] rounded w-6 h-6 flex items-center justify-center cursor-pointer"
                previousClassName="border border-[#4a4a4d] rounded w-6 h-6 flex items-center justify-center cursor-pointer"
                nextClassName="border border-[#4a4a4d] rounded w-6 h-6 flex items-center justify-center cursor-pointer"

                breakClassName="text-2xl flex items-center justify-center text-gray-400 cursor-default"
                breakLinkClassName="w-full h-full flex items-center justify-center"

                pageLinkClassName="w-full h-full flex items-center justify-center"
                previousLinkClassName="w-full h-full flex items-center justify-center"
                nextLinkClassName="w-full h-full flex items-center justify-center"

                activeClassName="bg-white text-black"
            />
        );
};

export default Pagination;
