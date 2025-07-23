import {routeLoader$} from "@builder.io/qwik-city";
import {component$, Slot} from "@builder.io/qwik";

export default component$(() => {
    const user = {
        value: {
            name: 1,
        }
    }

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