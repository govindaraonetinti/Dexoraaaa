"use client";

import { useState } from "react";
import Modal from "../../../lib/Modal";
import { roundPriceToTickSize } from "../../../utils";
interface EditTpSlProps {
    cancelOrder: (payload: any) => void,
    editObj: any, setEditObj: (editObj: any) => void, UpdatePosition: (payload: any) => void,
    isLoading: boolean
}
export default function EditTpSlPopup({ editObj, setEditObj, UpdatePosition, cancelOrder, isLoading }: EditTpSlProps) {
    if (!editObj || !editObj.position) return null;
    const position = editObj.position;
    const entryPrice = Number(position.entryPx);
    const leverage = Number(position.leverage.value);
    const size = Number(position.szi);
    const isLong = size > 0;

    /* ---------------- INPUT STATE ---------------- */
    const [tpPrice, setTpPrice] = useState("");
    const [tpGain, setTpGain] = useState("");
    const [slPrice, setSlPrice] = useState("");
    const [slLoss, setSlLoss] = useState("");

    /* ---------------- SAFE PARSE ---------------- */
    const parse = (v: string): number | null => {
        if (v === "" || v === "." || v === "-" || v === "-.") return null;
        const n = Number(v);
        return Number.isFinite(n) ? n : null;
    };

    /* ---------------- CALCULATIONS ---------------- */
    const calcPnLPercent = (price: number) => {
        if (!entryPrice || !leverage) return "";
        const raw = isLong
            ? (price - entryPrice) / entryPrice
            : (entryPrice - price) / entryPrice;
        return (raw * 100 * leverage).toFixed(2);
    };

    const calcTpPriceFromPnL = (percent: number) => {
        const unlev = percent / leverage / 100;
        return isLong
            ? (entryPrice * (1 + unlev)).toFixed(2)
            : (entryPrice * (1 - unlev)).toFixed(2);
    };

    const calcSlPriceFromPnL = (percent: number) => {
        const unlev = percent / leverage / 100;
        return isLong
            ? (entryPrice * (1 - unlev)).toFixed(2)
            : (entryPrice * (1 + unlev)).toFixed(2);
    };

    /* ---------------- INPUT HANDLERS ---------------- */
    const onTpPriceChange = (v: string) => {
        setTpPrice(v);
        const price = parse(v);
        if (price === null) {
            setTpGain("");
            return;
        }
        setTpGain(calcPnLPercent(price));
    };

    const onTpGainChange = (v: string) => {
        setTpGain(v);
        const percent = parse(v);
        if (percent === null) {
            setTpPrice("");
            return;
        }
        setTpPrice(calcTpPriceFromPnL(percent));
    };

    const onSlPriceChange = (v: string) => {
        setSlPrice(v);
        const price = parse(v);
        if (price === null) {
            setSlLoss("");
            return;
        }
        setSlLoss(String(Number(calcPnLPercent(price)) * -1));
    };

    const onSlLossChange = (v: string) => {
        setSlLoss(v);
        const percent = parse(v);
        if (percent === null) {
            setSlPrice("");
            return;
        }
        setSlPrice(calcSlPriceFromPnL(percent));
    };

    /* ---------------- SUBMIT ---------------- */
    const handleSubmit = () => {
        const payload = {
            positionId: position.id,
            side: isLong ? "LONG" : "SHORT",
            entryPrice,
            leverage,
            takeProfit: tpPrice
                ? { price: Number(roundPriceToTickSize(tpPrice)), pnlPercent: Number(tpGain) }
                : null,
            stopLoss: slPrice
                ? { price: Number(roundPriceToTickSize(slPrice)), pnlPercent: Number(slLoss) }
                : null,
        };
        UpdatePosition({ ...editObj, payload });
    };

    /* ---------------- UI ---------------- */
    return (
        <Modal open={(!!editObj && (editObj?.type.toLowerCase() !== 'market') || (editObj?.type.toLowerCase() !== 'limit'))} onClose={() => setEditObj(null)}>
            <h2 className="text-xl font-semibold text-white mb-4">
                TP / SL ({isLong ? "LONG" : "SHORT"} · {leverage}×)
            </h2>

            <div className="space-y-2 mb-6 text-sm text-white/70">
                <Row label="Coin" value={position.coin} />
                <Row label="Position" className={editObj?.color} value={`${position.szi} USDC`} />
                <Row label="Entry Price" value={entryPrice} />
                <Row label="Mark Price" value={editObj.marketData ?? "--"} />

                {editObj.tpsl?.sl?.triggerCondition && <Row label="Stop Loss" value={editObj?.tpsl?.sl ? editObj.tpsl?.sl?.triggerCondition : "--"} CancelBtn={'sl'}
                    className={editObj?.color} cancelOrder={cancelOrder} cancelTpSL={'sl'} orderObj={editObj.tpsl?.sl ? editObj.tpsl?.sl : null} />}

                {editObj.tpsl?.tp?.triggerCondition && <Row label="Take Profit" value={editObj?.tpsl?.tp ? editObj.tpsl?.tp?.triggerCondition : "--"} CancelBtn={'tp'}
                    className={editObj?.color} cancelOrder={cancelOrder} cancelTpSL={'tp'} orderObj={editObj.tpsl?.tp ? editObj.tpsl?.tp : null} />}
            </div>

            {/* TP */}
            {!editObj?.tpsl?.tp.triggerCondition &&
                <div className="grid grid-cols-2 gap-3 mb-3">
                    <Input
                        placeholder="TP Price"
                        value={tpPrice}
                        onChange={onTpPriceChange}
                    />
                    <Input
                        placeholder="Gain %"
                        value={tpGain}
                        onChange={onTpGainChange}
                    />
                </div>}

            {/* SL */}
            {!editObj?.tpsl?.sl.triggerCondition && <div className="grid grid-cols-2 gap-3 mb-6">
                <Input
                    placeholder="SL Price"
                    value={slPrice}
                    onChange={onSlPriceChange}
                />
                <Input
                    placeholder="Loss %"
                    value={slLoss}
                    onChange={onSlLossChange}
                />
            </div>}


            {/* Button */}
            {!(editObj?.tpsl?.sl?.triggerCondition && editObj?.tpsl?.tp?.triggerCondition) &&
                <button className="w-full bg-white transition text-black font-semibold py-3 rounded-lg mb-4" disabled={isLoading} onClick={() => handleSubmit()}>
                    {isLoading ? 'Loading...' : 'Place Order'}
                </button>}

            {/* Footer Note */}
            <p className="text-xs text-white/40 leading-relaxed">
                By default take-profit and stop-loss orders apply to the entire position. Take-profit
                and stop-loss automatically cancel after closing the position. A market order is
                triggered when the stop loss or take profit price is reached.
            </p>
        </Modal>
    );
}

/* ---------------- HELPERS ---------------- */
function Row({ label, value, className, CancelBtn, cancelOrder, orderObj }: any) {
    return (
        <ul className="flex justify-between text-white/60">
            <li>{label}</li>
            <li className={`flex items-center gap-2 font-medium ${className && !CancelBtn ? className : 'text-white'}`}> {value}
                {CancelBtn && value && <button className={`${className ? className : 'text-white'}`} onClick={() => cancelOrder({ coinName: orderObj.coin, orderId: orderObj.oid })}>Cancel</button>}
            </li>
        </ul>
    );
}

export function Input({ value, onChange, placeholder }: any) {
    return (
        <input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="bg-[#27272A] text-white px-3 py-2 rounded-md text-sm focus:outline-none"
        />
    );
}
