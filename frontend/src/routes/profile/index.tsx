import {component$, useContext, useVisibleTask$} from "@builder.io/qwik";
import {UserContext} from "~/context/UserContext";

export default component$((props) => {
    const { email, coins, resources } = useContext(UserContext);

    return (
        <div>
            <h1>Profile</h1>
            <p>email: {email}</p>
            <p>coins: {coins}</p>
            <p>resouces: {resources}</p>
        </div>
    )
});
