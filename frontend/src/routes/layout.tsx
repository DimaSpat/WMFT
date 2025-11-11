import {$, component$, Slot, useContextProvider, useSignal, useStore, useVisibleTask$} from "@builder.io/qwik";
import {useNavigate} from "@builder.io/qwik-city";
import {Header} from "~/components/header/header";
import {UserContext, UserState} from "~/context/UserContext";

export default component$(() => {
    const storeUser = useStore<UserState>({
        email: undefined,
        coins: undefined,
        resources: undefined
    });
    const signalLoading = useSignal(true);
    const nav = useNavigate();

    useContextProvider(UserContext, storeUser);

    const setStoreUserUndefined = $(() => {
        storeUser.email = undefined;
        storeUser.coins = undefined;
        storeUser.resources = undefined;
        console.log(1);
    })

    const setStoreUserData = $((data:any) => {
        storeUser.email = data.email;
        storeUser.coins = data.coins;
        storeUser.resources = data.resources;
    });

    useVisibleTask$(async ({ track }) => {
        track(() => window.location.pathname);

        try {
            const localToken = localStorage.getItem('auth_token');

            if (localToken) {
                localStorage.removeItem('auth_token');

                const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/auth/telegram/set-cookie`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                    body: JSON.stringify({ token: localToken }),
                });

                if (!response.ok) {
                    throw new Error('Failed to set cookie');
                }
            }

            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/auth/me`, {
                credentials: 'include',
            });
            const data = await response.json();

            if (data.success) {
                await setStoreUserData(data.user as UserState);
            } else {
                await setStoreUserUndefined();
                if (window.location.pathname !== '/auth') {
                    await nav('/auth');
                }
            }
        } catch (error) {
            console.error("Error fetching user data:", error);
            await setStoreUserUndefined();
            if (window.location.pathname !== '/auth') {
                await nav('/auth');
            }
        } finally {
            signalLoading.value = false;
        }
    });

    return (
        <div>
            {signalLoading.value ? (
                <div>Loading...</div>
            ) : (
                <>
                    <Header />
                    <main>
                        <Slot></Slot>
                    </main>
                </>
            )}
        </div>
    )
});