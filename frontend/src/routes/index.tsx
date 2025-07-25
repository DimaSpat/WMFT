import { component$, useVisibleTask$, useSignal } from "@builder.io/qwik";
import { DocumentHead } from "@builder.io/qwik-city";
import { Header } from "~/components/header/header";

export default component$(() => {
    const userInfo = useSignal<any>(undefined);

    useVisibleTask$(() => {
        const params = new URLSearchParams(window.location.search);
        const user = params.get("user");
        if (user) {
            const userData = JSON.parse(decodeURIComponent(user));
            window.history.replaceState({}, document.title, window.location.pathname);
            userInfo.value = userData;
        }
    });

    return (
        <>
            <h1>Home</h1>
            {userInfo.value && (
                <div>
                    <p>Welcome, {userInfo.value.email}</p>
                    <p>Coins: {userInfo.value.coins}</p>
                </div>
            )}
        </>
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