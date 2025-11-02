import { motion } from "framer-motion";
import VerifyEmailCode from "./VerifyEmailCode";

export default function VerifyEmail() {
    return (
        <div className="container-fluid">
            <div className="row py-2">
                <motion.div
                    className="col-md d-flex justify-content-center align-items-center "
                    initial={{ opacity: 0, x: -100 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 100 }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                >
                    <VerifyEmailCode />

                </motion.div>


            </div>
        </div>
    );
}