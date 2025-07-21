import { component$, useVisibleTask$, useSignal } from "@builder.io/qwik";
import { DocumentHead } from "@builder.io/qwik-city";
import { Header } from "~/components/header/header";

export default component$(() => {
    const userInfo = useSignal<any>(undefined);

    useVisibleTask$(() => {
        const params = new URLSearchParams(window.location.search);
        const user = params.get("user");
        if (user) {
            const userData = JSON.parse(user);

            // localStorage.setItem('user', JSON.stringify(userData));
            window.history.replaceState({}, document.title, window.location.pathname);

            userInfo.value = userData;
        }
    });

    return (
        <>
            <Header />
            <h1>Home</h1>
            { userInfo.value !== undefined ?
                (
                    <>
                        <h2>Welcome, {userInfo.value.given_name}!</h2>
                        <h3>User Info:</h3>
                        <p>Name: {userInfo.value.name}</p>
                        <p>Email: {userInfo.value.email}</p>
                        <p>Family name: {userInfo.value.family_name}</p>
                        <img src={userInfo.value.picture} alt="User picture"/>
                    </>
                )
                :
                (
                    <>
                        <h2>Welcome to the home page!</h2>
                    </>
                )
            }
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