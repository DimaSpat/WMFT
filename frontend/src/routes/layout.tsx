import {routeLoader$} from "@builder.io/qwik-city";
import {component$, Slot} from "@builder.io/qwik";

export const useUserLoader = routeLoader$(async ({ cookie }) => {
    const response = await fetch('http://localhost:5000/auth/user', {
        credentials: "include",
    });

    if (!response.ok) {
        return null;
    }

    return await response.json();
});

export default component$(() => {
    const user = useUserLoader();

    return (
        <div>
            {user.value && (
                <>
                    hello, {user.value.name}!
                </>
            )}
            <main>
                <Slot></Slot>
            </main>
        </div>
    )
})