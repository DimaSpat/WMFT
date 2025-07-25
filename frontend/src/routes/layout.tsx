
import {component$, Slot, useStore, useVisibleTask$} from "@builder.io/qwik";
import {useNavigate} from "@builder.io/qwik-city";
import {Header} from "~/components/header/header";

interface UserState {
    user: {
        email: string;
        coins: number;
        resources: any[];
    } | null;
    isLoading: boolean;
}

export default component$(() => {
    const store = useStore<UserState>({
        user: null,
        isLoading: true,
    });
    const nav = useNavigate();

    // Add trackBy to ensure the task runs when auth state changes
    useVisibleTask$(async ({ track }) => {
        track(() => window.location.pathname);

        try {
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/auth/me`, {
                credentials: 'include',
            });
            const data = await response.json();

            if (data.success) {
                store.user = data.user;
            } else {
                store.user = null;
                if (window.location.pathname !== '/auth') {
                    await nav('/auth');
                }
            }
        } catch (error) {
            console.error("Error fetching user data:", error);
            store.user = null;
            if (window.location.pathname !== '/auth') {
                await nav('/auth');
            }
        } finally {
            store.isLoading = false;
        }
    });

    return (
        <div>
            {store.isLoading ? (
                <div>Loading...</div>
            ) : (
                <>
                    <Header user={store.user} />
                    <main>
                        <Slot></Slot>
                    </main>
                </>
            )}
        </div>
    )
});