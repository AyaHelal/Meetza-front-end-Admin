import { motion } from "framer-motion";
import ForgotPasswordForm from "./ForgotPasswordForm";

export default function ForgotPassword() {
    return (
        <div className="container-fluid">
            <div className="row py-2">


                <motion.div
                    className="col d-none d-md-flex justify-content-center"
                    initial={{ opacity: 0, x: 100 }}   // جاي من اليمين
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -100 }}     // رايح للشمال
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                >
                    <ForgotPasswordForm />
                </motion.div>
            </div>
        </div>
    );
}
