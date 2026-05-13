import { useState, useEffect } from "react";
import { BiLogoTelegram } from "react-icons/bi";
import { BsDiscord, BsMedium, BsTwitterX } from "react-icons/bs";
import { StartEarning } from "../components/StartAbcDex";


interface FormType {
    name: string;
    email: string;
    mobile: string;
    message: string;
}

interface ErrorType {
    name: string;
    email: string;
    mobile: string;
    message: string;
}

export default function ContactForm() {
    const [form, setForm] = useState<FormType>({
        name: "",
        email: "",
        mobile: "",
        message: ""
    });

    const [errors, setErrors] = useState<ErrorType>({
        name: "",
        email: "",
        mobile: "",
        message: ""
    });

    const [isValid, setIsValid] = useState<boolean>(false);

    // ----------------------------
    // VALIDATION RULES
    // ----------------------------
    const validate = (name: string, value: string): string => {
        switch (name) {
            case "name":
                return value.trim().length < 3
                    ? "Name must be at least 3 characters"
                    : "";
            case "email":
                return !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
                    ? "Invalid email address"
                    : "";
            case "mobile":
                return !/^\d{10}$/.test(value)
                    ? "Mobile number must be 10 digits"
                    : "";
            case "message":
                return value.trim().length < 10
                    ? "Message must be at least 10 characters"
                    : "";
            default:
                return "";
        }
    };

    // ----------------------------
    // HANDLE INPUT CHANGE
    // ----------------------------
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;

        setForm(prev => ({
            ...prev,
            [name]: value
        }));

        setErrors(prev => ({
            ...prev,
            [name]: validate(name, value)
        }));
    };

    // ----------------------------
    // CHECK IF FORM IS VALID
    // ----------------------------
    useEffect(() => {
        const noErrors =
            errors.name === "" &&
            errors.email === "" &&
            errors.mobile === "" &&
            errors.message === "";

        const allFilled =
            form.name.trim() !== "" &&
            form.email.trim() !== "" &&
            form.mobile.trim() !== "" &&
            form.message.trim() !== "";

        setIsValid(noErrors && allFilled);
    }, [errors, form]);

    // ----------------------------
    // SUBMIT
    // ----------------------------
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!isValid) return;

        alert("Message sent successfully!");
        // console.log("Form Submitted:", form);
    };

    return (
        <section className="py-36">
            <div className="site-width-sm">

                <ContactIntro />

                <form onSubmit={handleSubmit} className="space-y-6 pb-24">

                    {/* Name / Email / Mobile */}
                    <div className="grid xl:grid-cols-3 grid-cols-1 gap-4">

                        {/* Name */}
                        <div>
                            <input
                                name="name"
                                value={form.name}
                                onChange={handleChange}
                                className="w-full py-3 pr-4 text-white border-b border-[#CACACA]/40 focus:outline-none focus:border-white"
                                placeholder="Enter your name"
                            />
                            {errors.name && (
                                <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                            )}
                        </div>

                        {/* Email */}
                        <div>
                            <input
                                type="email"
                                name="email"
                                value={form.email}
                                onChange={handleChange}
                                className="w-full py-3 pr-4 text-white border-b border-[#CACACA]/40 focus:outline-none focus:border-white"
                                placeholder="Enter your email"
                            />
                            {errors.email && (
                                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                            )}
                        </div>

                        {/* Mobile */}
                        <div>
                            <input
                                type="tel"
                                name="mobile"
                                value={form.mobile}
                                onChange={handleChange}
                                className="w-full py-3 pr-4 text-white border-b border-[#CACACA]/40 focus:outline-none focus:border-white"
                                placeholder="Enter your mobile number"
                            />
                            {errors.mobile && (
                                <p className="text-red-500 text-sm mt-1">{errors.mobile}</p>
                            )}
                        </div>

                    </div>

                    {/* Message */}
                    <div>
                        <textarea
                            name="message"
                            rows={4}
                            value={form.message}
                            onChange={handleChange}
                            className="w-full py-3 pr-4 text-white border-b border-[#CACACA]/40 focus:outline-none focus:border-white"
                            placeholder="Type your message..."
                        ></textarea>
                        {errors.message && (
                            <p className="text-red-500 text-sm mt-1">{errors.message}</p>
                        )}
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={!isValid}
                        className={`cursor-pointer bg-white px-4.5 py-2.5 text-black font-bold rounded-full 
                            ${!isValid && "opacity-50 cursor-not-allowed"}`}
                    >
                        Send Message
                    </button>

                </form>

            </div>
            <StartEarning btnText="Connect Wallet" title=" Start Trading on ABCDEX" content="Your capital. Your wallet. Your rules. " className="" />
        </section>
    );
}


function ContactIntro() {
    return (
        <section className="pb-28 relative">
            <div className="">
                <div className="grid 2xl:grid-cols-[800px_1fr] xl:grid-cols-[600px_1fr] mg:grid-cols-[400px_1fr] gap-6">
                    <div >
                        <h1 className="h2-tag md:text-4xl font-bold text-white">
                            Get in touch with us. We're here to assist you.
                        </h1>

                        <p className="mt-4 p-tag">
                            We're here to help you trade. Have a question about the platform, interested in a partnership,
                            or want to join our community? Find the right channel below to connect with the ABCDEX team.
                        </p>
                    </div>
                    <div className="flex items-center gap-5 text-white text-xl justify-end">
                        <BsTwitterX className="cursor-pointer hover:text-gray-300 border-2 border-[#2A2A32] rounded-full p-3.5 text-6xl" />
                        <BiLogoTelegram className="cursor-pointer hover:text-gray-300 border-2 border-[#2A2A32] rounded-full p-3.5 text-6xl" />
                        <BsDiscord className="cursor-pointer hover:text-gray-300 border-2 border-[#2A2A32] rounded-full p-3.5 text-6xl" />
                        <BsMedium className="cursor-pointer hover:text-gray-300 border-2 border-[#2A2A32] rounded-full p-3.5 text-6xl" />
                    </div>
                </div>
            </div>

        </section>
    );
}