import { ethers } from "ethers";
import toast from "react-hot-toast";
import { Lifi_APIKey, swapOptions } from "../../../utils";

export const handleRoutesSubmit = async ({
    address,
    isUserAuthenticated,
    navigate,
    fromCurrency,
    toCurrency,
    fromAmount,
    setRoutesData, setQuotes,
    setSwapData
}: any) => {
    if (!address && !isUserAuthenticated) {
        // toast.error('Please connect the wallet');
        return
    }
    if (Number(fromAmount) * Number(fromCurrency?.priceUSD) <= 5) {
        toast.error('Amount must be grater than or equal to 5$')
        return
    }
    const payload = {
        fromChainId: fromCurrency.chainId,
        toChainId: toCurrency.chainId,
        fromTokenAddress: fromCurrency.address,
        toTokenAddress: toCurrency.address,
        fromAmount: ethers
            .parseUnits(fromAmount.toString(), fromCurrency.decimals)
            .toString(), // 👈 MUST be string
        fromAddress: address,
        toAddress: address,
        options: swapOptions
    };

    navigate(`/swap?fromChainId=${payload.fromChainId}&toChainId=${payload.toChainId}&fromTokenAddress=${payload.fromTokenAddress}&toTokenAddress=${payload.toTokenAddress}&fromAmount=${fromAmount}`)
    // return
    try {
        setQuotes(true);
        const response = await fetch(
            "https://li.quest/v1/advanced/routes",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-lifi-api-key": Lifi_APIKey
                },
                body: JSON.stringify(payload)
            }
        );

        const data = await response.json();
        console.log("routes response", data);

        if (!response.ok || data.code) {
            toast.error(data.message || "Failed to fetch routes");
            return;
        }
        if (data.routes.length != 0) {
            setRoutesData(data.routes); // 👈 routes array
        } else {
            setRoutesData(null)
            toast.error('No Quotes are available to complete the swap')
        }
        setSwapData(null)
    } catch (err) {
        console.error("error", err);
        toast.error("Something went wrong");
        navigate(`/swap`)
        setQuotes(false);
    } finally {
        setQuotes(false);
    }
};
