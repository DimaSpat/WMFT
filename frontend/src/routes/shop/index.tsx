import { component$ } from "@builder.io/qwik";
import { ItemPayed, Item } from "~/components/shop/shop";

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
                <ItemPayed
                    image={"🪙"} 
                    name={"Bucket of coins"} 
                    price={200} 
                    description={"Lorem ipsum dolor sit amet, consectetur adipisicing elit."}
                    resourceType={"coins"}
                    resourceAmount={2000}
                />
                <ItemPayed
                    image={"💰"} 
                    name={"Bag of coins"} 
                    price={500} 
                    description={"Get more coins for your adventures!"}
                    resourceType={"coins"}
                    resourceAmount={5000}
                />
            </div>
            <h2 style={{ textAlign: "center", fontSize: "3rem" }}>Buy resources</h2>
            <div style={{ display: "flex", justifyContent: "center", padding: "2rem", gap: "2rem", flexWrap: "wrap" }}>
                <Item
                    image={"🪵"}
                    name={"Wood forest"}
                    price={200}
                    priceType={"coins"}
                    description={"Lorem ipsum dolor sit amet, consectetur adipisicing elit."}
                    resourceType={"Wood"}
                    resourceAmount={1000000}
                />
                <Item
                    image={"🌲"}
                    name={"Forest planet"}
                    price={10000}
                    priceType={"coins"}
                    description={"Lorem ipsum dolor sit amet, consectetur adipisicing elit."}
                    resourceType={"Wood"}
                    resourceAmount={1000000000}
                />
                <Item
                    image={"🌾"}
                    name={"Wheat field"}
                    price={200}
                    priceType={"coins"}
                    description={"Lorem ipsum dolor sit amet, consectetur adipisicing elit."}
                    resourceType={"Wheat"}
                    resourceAmount={100000}
                />
                <Item
                    image={"🧺"}
                    name={"Wheat planet"}
                    price={6000}
                    priceType={"coins"}
                    description={"Lorem ipsum dolor sit amet, consectetur adipisicing elit."}
                    resourceType={"Wheat"}
                    resourceAmount={1000000000}
                />
                <Item
                    image={"🪨"}
                    name={"Mineral underworld"}
                    price={650}
                    priceType={"coins"}
                    description={"Lorem ipsum dolor sit amet, consectetur adipisicing elit."}
                    resourceType={"Mineral"}
                    resourceAmount={6500}
                />
                <Item
                    image={"☢️"}
                    name={"Mineral planet"}
                    price={10000}
                    priceType={"coins"}
                    description={"Lorem ipsum dolor sit amet, consectetur adipisicing elit."}
                    resourceType={"Mineral"}
                    resourceAmount={125000}
                />
                <Item
                    image={"💎"}
                    name={"Rare mineral bucket"}
                    price={10000}
                    priceType={"coins"}
                    description={"Lorem ipsum dolor sit amet, consectetur adipisicing elit."}
                    resourceType={"Rare minerals"}
                    resourceAmount={10}
                />
            </div>
        </div>
    );
});

export default component$(() => {
    return (
        <ProductDisplay />
    );
});
