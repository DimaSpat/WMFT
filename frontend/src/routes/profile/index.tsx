import {component$, useVisibleTask$} from "@builder.io/qwik";

export default component$((props) => {
    useVisibleTask$(() => {
        console.log(props.test);
    });

    return (
        <div>
            <h1>Profile</h1>
        </div>
    )
});
