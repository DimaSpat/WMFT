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
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            display: 'flex',
            justifyContent: 'space-between',
            padding: '1rem',
            backgroundColor: 'rgba(245, 245, 245, 0)',
        }}>
            <div style={{
                display: 'grid',
                // gridAutoColumns: '1fr',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gridTemplateRows: '1fr',
                width: '100vw',
                height: '100%',
            }}>
                <div><h1>WMFT</h1></div>
                {props.user ? (
                    <>
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', justifyContent: 'space-evenly' }}>
                            |
                            <Link href="/">Home</Link>
                            |
                            <Link href="/profile">Profile</Link>
                            |
                            <Link href="/shop">Shop</Link>
                            |
                        </div>
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', justifyContent: 'flex-end' }}>
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
                    </>
                ) : (
                    <>
                        <div></div>
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', justifyContent: 'flex-end' }}>
                            <Link href="/auth">Login</Link>
                        </div>
                    </>
                )}
            </div>
        </header>
    );
});
