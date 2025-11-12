import { useEffect, useState } from "react";
import "../../components/common/LogSignImg.css";
export default function SignUpImage() {
    const [imageSrc, setImageSrc] = useState("/assets/SignUpImage.png");

    useEffect(() => {
        const updateImage = () => {
            if (window.innerWidth >= 1500) {
                setImageSrc(process.env.PUBLIC_URL + "/assets/SignUpImage2.png");
            } else {
                setImageSrc(process.env.PUBLIC_URL + "/assets/SignUpImage.png");
            }
        };

        updateImage();
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
