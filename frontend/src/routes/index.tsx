import { component$, useVisibleTask$, useSignal } from "@builder.io/qwik";
import {DocumentHead, Link, useLocation} from "@builder.io/qwik-city";

export default component$(() => {
    const loc = useLocation();
    useVisibleTask$(() => {
        const success = loc.url.searchParams.get("success");
        const canceled = loc.url.searchParams.get("canceled");

        let message = "";

        if (success === "true") {
            message = "Order placed! You will receive an email confirmation.";
        }

        if (canceled === "true") {
            message = "Order canceled -- continue to shop around and checkout when you're ready.";
        }
        alert(message)
    })

    return (
        <div style={{
            minHeight: "250vh",
            background: "beige",
            paddingTop: "6rem",
        }}>
            <div style={{
                height: "85vh",
                display: "flex",
                justifyContent: "flex-start",
                alignItems: "center",
                flexDirection: "column",
            }}>
                <div style={{
                    height: "45vh",

                    display: "flex",
                    justifyContent: "flex-end",
                    alignItems: "center",
                    flexDirection: "column",
                    gap: "0.5rem",

                    paddingBottom: "4rem",
                }}>
                    <span style={{
                        fontSize: "4rem",
                        fontWeight: "bold",
                        color: "black",
                        marginBottom: "9rem",
                    }}><span style={{color: "#966F33"}}>W</span> | <span style={{color: "gray"}}>M</span> | <span style={{color: "#BA8E23"}}>F</span> | <span>T</span></span>
                    <h1>Welcome to Wood Cutting Mining Farming Trading</h1>
                    <h4>This is a new game, it's point is to become the richest player on the planet by trading for coins.</h4>
                    <Link style={{
                        background: "#966F33",
                        marginTop: "1rem",
                        padding: "1rem 2rem",
                        borderRadius: "0.5rem",
                        fontWeight: "bold",
                    }}>Start playing</Link>
                </div>
            </div>
            <div style={{
                width: "75dvh",
                justifySelf: "center",
                height: "150vh",
                background: "black",
                position: "absolute",
                top: "75vh",

                borderRadius: "2rem",
                overflow: "hidden",
                color: "white",
                padding: "2rem",

                display: "flex",
            }}>
            </div>
            <div style={{
                position: "absolute",
                top: "200vh",
                paddingTop: "4rem",

                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "1rem",

                textAlign: "center",
            }}>
                <h2>Why is this game good?</h2>
            </div>
        </div>
    );
});


export const head: DocumentHead = {
    title: "Home",
    meta: [
        {
            name: "description",
            content: "Wood cutting Mining Farming Trading",
        }
    ]
}