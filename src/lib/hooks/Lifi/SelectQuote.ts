import toast from "react-hot-toast";

export const handleSubmit = async ({ address, isUserAuthenticated, route, setSwapData, setIsLoading }: any) => {
    setSwapData(null);
    if (!address && !isUserAuthenticated) {
        toast.error('Please connect the wallet');
        return
    }
    if (!route) {
        toast.error("Missing data");
        return;
    }
    try {
        setIsLoading(true);
        setSwapData(route);
        // for (let i = 0; i < route.steps.length; i++) {
        //     const step = route.steps[i];

        //     // 1️⃣ Fetch executable tx for THIS step
        //     const res = await fetch("https://li.quest/v1/advanced/stepTransaction", {
        //         method: "POST",
        //         headers: {
        //             "Content-Type": "application/json",
        //             "x-lifi-api-key": Lifi_APIKey
        //         },
        //         body: JSON.stringify({
        //             id: step.id,
        //             type: step.type,
        //             route: route,
        //             stepIndex: i,
        //             tool: step.tool,
        //             toolDetails: step.toolDetails,
        //             action: {
        //                 ...step.action,
        //                 fromAddress: address,
        //                 toAddress: address,
        //             },
        //             estimate: step.estimate,
        //             fromAddress: address,
        //             integrator: integrationKey,
        //             toAddress: address,
        //             includedSteps: step.includedSteps
        //         }),
        //     });

        //     if (!res.ok) {
        //         const errorData = await res.json().catch(() => ({}));
        //         console.error('❌ LiFi API Error:', errorData);
        //         throw new Error(
        //             errorData.message || `Failed to fetch tx for step ${step.id}`
        //         );
        //     }

        //     const data = await res.json();
        //     console.log('datadatadata',data)
        // }
    } catch (err) {
        console.log("error", err);
    } finally {
        setIsLoading(false);

    }
};