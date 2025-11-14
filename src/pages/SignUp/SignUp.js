import { motion } from "framer-motion";
import SignUpForm from "./SignUpForm";
import SignUpImage from "./SignUpImage";

export default function SignUp() {
    return (
        <div className="container-fluid">
            <div className="row py-2">
                <motion.div
                    className="col-md-6 d-none d-md-flex justify-content-center align-items-center"
                    initial={{ opacity: 0, x: -100 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 100 }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                >
                    <SignUpImage />
                </motion.div>

                <motion.div
                    className="col-12 col-md-6 d-flex justify-content-center"
                    initial={{ opacity: 0, x: 100 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                >
                    <SignUpForm />
                </motion.div>
            </div>
        </div>
    );
}