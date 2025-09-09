import {component$} from "@builder.io/qwik";
import {Item} from "~/components/shop/shop";

export default component$(() => {
    return (
        <div>
            <h1 style={{textAlign: "center", fontSize: "4rem"}}>Shop</h1>
            <h2 style={{textAlign: "center", fontSize: "3rem"}}>Buy coins</h2>
            <Item image={"Bucket of Coins"} price={200} description={"Lorem ipsum dolor sit amet, consectetur adipisicing elit. this is a test this is a test"}></Item>
            <h2 style={{textAlign: "center", fontSize: "3rem"}}>Buy resources</h2>
        </div>
    )
});
