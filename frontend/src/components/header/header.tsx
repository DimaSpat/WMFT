import {Component, component$, JSXOutput} from "@builder.io/qwik";
import {Link} from "@builder.io/qwik-city";

interface HeaderProps {
    user?: {
        email: string;
        coins: number;
    } | null;
}

export const Header: Component<HeaderProps> = component$((props): JSXOutput => {
    return (
        <header style={{
            display: 'flex',
            justifyContent: 'space-between',
            padding: '1rem',
            backgroundColor: '#f5f5f5',
        }}>
            <div>
                <h1>WMFT</h1>
            </div>
            <div>
                {props.user ? (
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <p>Welcome, {props.user.email}</p>
                        <p>Coins: {props.user.coins}</p>
                    </div>
                ) : (
                    <Link href="/auth">Login</Link>
                )}
            </div>
        </header>
    );
});
