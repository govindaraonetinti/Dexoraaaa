import { useAuthAddress } from "../lib/hooks/useAuthAddress";


interface StartEarningProps {
    className?: string;
    title?: string;
    content?: string;
    btnText?: string;
}
export const StartEarning = ({
    className,
    title,
    content,
    btnText
}: StartEarningProps) => {
   const { address ,login ,handleLogout } = useAuthAddress();
    return (
        <section className={`bg-[#0d0d0d] text-white ${className}`}>
            <div className="max-w-220 mx-auto px-6 text-center">
                <h3 className="h2-tag font-bold leading-tight">
                    {title}
                </h3>
                {content && <p className="text-gray-300 p-tag mt-4">
                    {content}
                </p>}
                {address ?
                    <button
                        className="cursor-pointer mt-10 bg-white px-8 py-3.5 
                    text-black font-semibold rounded-full text-lg 
                    hover:bg-gray-200 transition-all" onClick={handleLogout}
                    >
                        {`${address.slice(0, 6)}${('.').repeat(6)}${address.slice(-6)}`}
                    </button> :
                    <button
                        className="cursor-pointer mt-10 bg-white px-8 py-3.5 
                    text-black font-semibold rounded-full text-lg 
                    hover:bg-gray-200 transition-all" onClick={login}
                    >
                        {btnText}
                    </button>
                }
            </div>
        </section>
    );
};
