import Modal from "../Modal";

interface LeverageProps {
    tradeType: string | null;
    setTradeType: (tradeType: string | null) => void;
    selectedCoin: string

}

const PositionPopup = ({ tradeType, setTradeType, selectedCoin }: LeverageProps) => {
    return (
        <Modal
            open={tradeType === "position"}
            onClose={() => setTradeType(null)}
            title=""
            width="max-w-[500px]"
        >
            <p className="text-2xl mb-4 mt-3 text-center">{selectedCoin}-USDC Position Mode</p>
            <p>
                Your position on this coin is either short or long. Orders specify a size and
                direction only; there is no distinction between open and close when placing an order.
            </p>
            <button
                className="mt-5 w-full bg-white py-3 rounded-lg text-black cursor-pointer font-semibold"
                onClick={() => setTradeType(null)}
            >
                Understood
            </button>


        </Modal>
    );
};

export default PositionPopup;



