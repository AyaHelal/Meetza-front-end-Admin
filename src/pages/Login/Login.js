
import { motion } from "framer-motion";
import LoginImage from "./LoginImage";
import LoginForm from "./LoginForm";

export default function Login() {
    return (
        <div className="container-fluid">
            <div className="row py-2">
                <motion.div
                    className="col-12 col-md-6 d-flex justify-content-center"
                    initial={{ opacity: 0, x: -100 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 100 }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                >
                    <LoginForm />
                </motion.div>

                <motion.div
                    className="col-md-6 d-none d-md-flex justify-content-center"
                    initial={{ opacity: 0, x: 100 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                >
                    <LoginImage />
                </motion.div>
            </div>
        </div>
    );
}
