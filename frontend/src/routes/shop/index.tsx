import { component$ } from "@builder.io/qwik";
import { useLocation } from "@builder.io/qwik-city";
import { Item } from "~/components/shop/shop";

const Message = component$<{ message: string }>((props) => {
    return (
        <section style={{
            textAlign: "center",
            padding: "2rem",
            margin: "2rem auto",
            maxWidth: "600px",
            background: "#f0f0f0",
            borderRadius: "1rem",
        }}>
            <p style={{ fontSize: "1.2rem" }}>{props.message}</p>
            <a 
                href="/" 
                style={{
                    display: "inline-block",
                    marginTop: "1rem",
                    padding: "0.75rem 1.5rem",
                    background: "#000",
                    color: "#fff",
                    textDecoration: "none",
                    borderRadius: "0.5rem",
                }}
            >
                Continue Shopping
            </a>
        </section>
    );
});

const ProductDisplay = component$(() => {
    return (
        <div>
            <h1 style={{ textAlign: "center", fontSize: "4rem" }}>Shop</h1>
            <h2 style={{ textAlign: "center", fontSize: "3rem" }}>Buy coins</h2>
            <div style={{ 
                display: "flex", 
                justifyContent: "center", 
                padding: "2rem",
                gap: "2rem",
                flexWrap: "wrap"
            }}>
                <Item 
                    image={"🪙"} 
                    name={"Bucket of coins"} 
                    price={200} 
                    description={"Lorem ipsum dolor sit amet, consectetur adipisicing elit."}
                />
                <Item 
                    image={"💰"} 
                    name={"Bag of coins"} 
                    price={500} 
                    description={"Get more coins for your adventures!"}
                />
            </div>
            <h2 style={{ textAlign: "center", fontSize: "3rem" }}>Buy resources</h2>
        </div>
    );
});

export default component$(() => {
    const loc = useLocation();
    
    // Check if this is a redirect back from Checkout
    const success = loc.url.searchParams.get("success");
    const canceled = loc.url.searchParams.get("canceled");
    
    let message = "";
    
    if (success === "true") {
        message = "Order placed! You will receive an email confirmation.";
    }
    
    if (canceled === "true") {
        message = "Order canceled -- continue to shop around and checkout when you're ready.";
    }

    return message ? (
        <Message message={message} />
    ) : (
        <ProductDisplay />
    );
});
