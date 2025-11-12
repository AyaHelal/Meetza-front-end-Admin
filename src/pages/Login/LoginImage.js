import { useEffect, useState } from "react";
import "../../components/common/LogSignImg.css";

export default function LoginImage() {
    const [imageSrc, setImageSrc] = useState("/assets/LoginImage.png");

    useEffect(() => {
        const updateImage = () => {
            if (window.innerWidth >= 1500) {
                setImageSrc(process.env.PUBLIC_URL + "/assets/LoginImage2.png");
            } else {
                setImageSrc(process.env.PUBLIC_URL + "/assets/LoginImage.png");
            }
        };

        updateImage(); // شغّليه أول مرة
        window.addEventListener("resize", updateImage);

        return () => window.removeEventListener("resize", updateImage);
    }, []);

    return (
        <img
            className="image-section"
            src={imageSrc}
            alt="Login Illustration"

        />
    );
}
