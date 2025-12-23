import { $, component$, useContext } from "@builder.io/qwik";
import { UserContext } from "~/context/UserContext";

export const ItemPayed = component$((props: any) => {
  const { email } = useContext(UserContext);

  const handleCheckout = $(async () => {
    try {
      const response = await fetch(
        "https://wmft-backend.verce.app/api/payment/create-checkout-session",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            amount: Math.round(props.price * 100),
            currency: "cad",
            name: props.name,
            description: props.description,
            userId: email?.toLowerCase(),
            resourceType: props.resourceType,
            resourceAmount: props.resourceAmount,
          }),
        },
      );

      const data = await response.json();
      console.log(data.url);

      if (data.url) {
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
    <div
      style={{
        border: "1px solid black",
        borderRadius: "1rem",
        minWidth: "20rem",
        width: "20rem",
        height: "25rem",
        padding: "1rem",
        display: "grid",
        gridTemplateRows: "5fr repeat(3, 1fr)",
      }}
    >
      <span
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100%",
          width: "100%",
          fontSize: "3rem",
          fontWeight: "bold",
          textAlign: "center",
        }}
      >
        {props.image}
      </span>
      <h2>{props.name}</h2>
      <p style={{ fontSize: "1rem", verticalAlign: "center" }}>
        {props.description}
      </p>
      <p
        style={{
          fontSize: "1rem",
          fontWeight: "bold",
          verticalAlign: "center",
        }}
      >
        Type: {props.resourceType} | Amount: {props.resourceAmount}
      </p>
      <p
        style={{
          fontSize: "1rem",
          fontWeight: "bold",
          verticalAlign: "center",
        }}
      >
        {props.price.toFixed(2)} $ CAD
      </p>
      <form preventdefault:submit onSubmit$={handleCheckout}>
        <button type="submit" style={{ cursor: "pointer", width: "100%" }}>
          Checkout
        </button>
      </form>
    </div>
  );
});

export const Item = component$((props: any) => {
  const { email, coins } = useContext(UserContext);

  const handleCheckout = $(async () => {
    try {
      // Map uppercase resource names to lowercase
      const resourceMap: { [key: string]: string } = {
        Wood: "wood",
        Wheat: "wheat",
        Mineral: "mineral",
        "Rare minerals": "mineralRare",
      };

      const resourceType =
        resourceMap[props.resourceType] || props.resourceType.toLowerCase();

      console.log(props);
      const response = await fetch(
        "https://wmft-backend.vercel.app/api/payment/coinsPayment",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            currency: "cad",
            name: props.name,
            description: props.description,
            userId: email?.toLowerCase(),
            price: props.price,
            priceType: props.priceType,
            resourceType: resourceType,
            resourceAmount: props.resourceAmount,
          }),
        },
      );

      const data = await response.json();

      if (response.ok) {
        // Update the user context with the new coins and resources
        if (data.coins !== undefined) {
          // Reload the page to refresh resources
          window.location.reload();
        } else {
          window.location.href = "/profile";
        }
      } else {
        alert(data.error || "Failed to purchase item");
      }
    } catch (e) {
      console.error("Error during checkout:", e);
      alert("An error occurred. Please try again.");
    }
  });

  return (
    <div
      style={{
        border: "1px solid black",
        borderRadius: "1rem",
        minWidth: "20rem",
        width: "20rem",
        height: "25rem",
        padding: "1rem",
        display: "grid",
        gridTemplateRows: "5fr repeat(3, 1fr)",
      }}
    >
      <span
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100%",
          width: "100%",
          fontSize: "3rem",
          fontWeight: "bold",
          textAlign: "center",
        }}
      >
        {props.image}
      </span>
      <h2>{props.name}</h2>
      <p style={{ fontSize: "1rem", verticalAlign: "center" }}>
        {props.description}
      </p>
      <p
        style={{
          fontSize: "1rem",
          fontWeight: "bold",
          verticalAlign: "center",
        }}
      >
        Type: {props.resourceType} | Amount: {props.resourceAmount}
      </p>
      <p
        style={{
          fontSize: "1rem",
          fontWeight: "bold",
          verticalAlign: "center",
        }}
      >
        {props.price} {props.priceType}
      </p>
      <form preventdefault:submit onSubmit$={handleCheckout}>
        <button
          disabled={coins ? coins < props.price : false}
          type="submit"
          style={{ cursor: "pointer", width: "100%" }}
        >
          Buy
        </button>
      </form>
    </div>
  );
});
