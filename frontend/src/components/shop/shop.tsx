import {$, component$} from "@builder.io/qwik";

export const Item = component$((props: any) => {
    const buyItem = $(() => {
        console.log(props.price);
    })

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
            }}>{props.image}</span>
            <p style={{fontSize:"1rem", verticalAlign: "center"}}>{props.description}</p>
            <p style={{fontSize:"1rem", fontWeight: "bold", verticalAlign: "center"}}>{props.price} $</p>
            <button style={{cursor: "pointer"}} onClick$={buyItem}>Buy</button>
        </div>
    )
});