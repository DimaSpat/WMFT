import {component$, useContext} from "@builder.io/qwik";
import {UserContext} from "~/context/UserContext";

export default component$(() => {
    const { email, coins, resources } = useContext(UserContext);

    return (
        <div>
            <h1>Profile</h1>
            <p>email: {email}</p>
            <p>coins: {coins}</p>
            <div>
                <p>Resources:</p>
                {resources && Object.keys(resources).length > 0 ? (
                    <ul>
                        {Object.entries(resources)
                            .filter(([resourceType]) =>
                                ['wheat', 'wood', 'mineral', 'mineralRare', 'energyCrystals'].includes(resourceType)
                            )
                            .map(([resourceType, amount]) => (
                                <li key={resourceType}>
                                    {resourceType}: {Math.round(Number(amount))}
                                </li>
                            ))}
                    </ul>
                ) : (
                    <p>No resources</p>
                )}
            </div>
        </div>
    )
});
