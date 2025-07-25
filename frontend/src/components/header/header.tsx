import {$, Component, component$, JSXOutput} from "@builder.io/qwik";
import {Link, useNavigate} from "@builder.io/qwik-city";

interface HeaderProps {
    user?: {
        email: string;
        coins: number;
    } | null;
}

export const Header: Component<HeaderProps> = component$((props): JSXOutput => {
    const nav = useNavigate();

    const logout = $(async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/auth/logout`, {
                method: 'POST',
                credentials: 'include',
            });

            if (response.ok) {
                window.location.href = '/auth';
            }
        } catch (error) {
            console.error('Logout error:', error);
        }
    });



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
                        <button
                            onClick$={logout}
                            style={{
                                background: '#ff4444',
                                color: 'white',
                                border: 'none',
                                padding: '0.5rem 1rem',
                                borderRadius: '0.25rem',
                                cursor: 'pointer'
                            }}
                        >
                            Logout
                        </button>

                    </div>
                ) : (
                    <Link href="/auth">Login</Link>
                )}
            </div>
        </header>
    );
});
