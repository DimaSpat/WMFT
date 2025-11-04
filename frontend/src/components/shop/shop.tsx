import {$, component$} from "@builder.io/qwik";

export const Item = component$((props: any) => {
    const handleCheckout = $(async () => {
        try {
            const response = await fetch("/api/payment/create-checkout-session", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    amount: Math.round(props.price * 100), // Convert to cents
                    currency: "cad",
                    name: props.name,
                    description: props.description,
                }),
            });

            const data = await response.json();

            if (data.success && data.url) {
                // Redirect to Stripe Checkout
                window.location.href = data.url;
            } else {
                alert("Failed to start checkout. Please try again.");
            }
        } catch (error) {
            console.error("Error during checkout:", error);
            alert("An error occurred. Please try again.");
        }
    });

    return (
        <div style={{
            border: "1px solid black",
            borderRadius: "1rem",
            minWidth: "20rem",
            width: "20rem",
            height: "25rem",
            padding: "1rem",
            display: "grid",
            gridTemplateRows: "5fr repeat(3, 1fr)",
        }}>
            <span style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100%",
                width: "100%",
                fontSize: "3rem",
                fontWeight: "bold",
                textAlign: "center",
            }}>
                {props.image}
            </span>
            <h2>{props.name}</h2>
            <p style={{fontSize:"1rem", verticalAlign: "center"}}>
                {props.description}
            </p>
            <p style={{fontSize:"1rem", fontWeight: "bold", verticalAlign: "center"}}>
                {(props.price).toFixed(2)} $ CAD
            </p>
            <form preventdefault:submit onSubmit$={handleCheckout}>
                <button type="submit" style={{cursor: "pointer", width: "100%"}}>
                    Checkout
                </button>
            </form>
        </div>
    );
});