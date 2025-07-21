import {Component, component$, JSXOutput} from "@builder.io/qwik";
import {Link} from "@builder.io/qwik-city";

export const Header:Component<any> = component$(():JSXOutput => {
    const data = true;

    return (
        <header>
            <div>
                <h1>WMFT</h1>
            </div>
            <div>
                <p>Server: {data ? ("Active") : ("Inactive")}</p>
                <Link href={"/auth"}>Authenticate</Link>
            </div>
        </header>
    );
});