import { component$, $, JSXOutput, Signal, useSignal } from "@builder.io/qwik";
import { DocumentHead } from "@builder.io/qwik-city";

export const head: DocumentHead = {
    title: "Authentication",
    meta: [
        {
            name: "description",
            content: "Authentication description",
        }
    ]
}

export default component$(():JSXOutput => {
    const isSigning:Signal<boolean> = useSignal(true);
    const isLoading:Signal<boolean> = useSignal(false);
    const formRef:Signal<HTMLFormElement | undefined> = useSignal<HTMLFormElement>();
    const result:Signal = useSignal<any>(null);

    const changeAuthState = $(():void => {
        isSigning.value = !isSigning.value;
        console.log(formRef);
    });

    const submitForm:any = $(async ():Promise<any> => {
        isLoading.value = true;
        result.value = null;

        if (isSigning.value) {
            if (formRef.value?.password.value !== formRef.value?.passwordCheck.value) {
                result.value = { error: "Passwords do not match." };
                isLoading.value = false;
                return;
            }
        }

        try {
            const formData:FormData = new FormData(formRef.value);
            const data = Object.fromEntries(formData);

            if ('passwordCheck' in data) {
                delete data.passwordCheck;
            }

            const response = await fetch(`http://localhost:5000/auth/${isSigning.value ? 'register' : 'login'}`, {
                method: "POST",
                body: JSON.stringify(data),
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
            });

            result.value = await response.json();
        } catch (error) {
            result.value = { error: 'An error occurred while processing your request.' };
        } finally {
            isLoading.value = false;
            result.value = null;
        }
    });

    return (
        <div style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh",
        }}>
            <div style={{
                borderRadius: "1rem",
                border: "1px solid black",
                overflow: "hidden",
                width: "25%",
            }}>
                <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(2, 1fr)",
                    height: "4rem",
                }}>
                    <button
                        onClick$={changeAuthState}
                        disabled={isSigning.value}
                        style={{
                            background: isSigning.value ? 'green' : 'red',
                            border: "none",
                            cursor: !isSigning.value ? "pointer" : "not-allowed",
                        }}
                    >Sign In</button>
                    <button
                        onClick$={changeAuthState}
                        disabled={!isSigning.value}
                        style={{
                            background: !isSigning.value ? 'green' : 'red',
                            border: "none",
                            cursor: isSigning.value ? "pointer" : "not-allowed",
                        }}
                    >Log In</button>
                </div>
                <div style={{
                    padding: "2rem",
                }}>
                    <div style={{
                        borderBottom: "2px dotted black",
                    }}>
                        {isSigning.value ?
                            (
                                <>
                                    <p>Register to start playing</p>
                                    <form ref={formRef} onSubmit$={submitForm} preventdefault:submit={true}>
                                        <input type="email" name="email" required={true}/>
                                        <input type="password" name="password" required={true}/>
                                        <input type="password" name="passwordCheck" required={true}/>
                                        <button type="submit" disabled={isLoading.value}>
                                            {isLoading.value ? "Loading..." : "Create Account"}
                                        </button>
                                    </form>
                                    {result.value && (
                                        <div>
                                            <p style={{
                                                color: result.value?.error ? "red" : result.value?.success ? "green" : "black",
                                            }}>
                                                {String(Object.values(result.value)[Object.values(result.value).length-1])}
                                            </p>
                                        </div>
                                    )}
                                </>
                            )
                            :
                            (
                                <>
                                    <p>Log back to your progress</p>
                                    <form ref={formRef} onSubmit$={submitForm} preventdefault:submit={true}>
                                        <input type="email" name="email" required={true}/>
                                        <input type="password" name="password" required={true}/>
                                        <button type="submit" disabled={isLoading.value}>
                                            {isLoading.value ? "Loading..." : "Create Account"}
                                        </button>
                                    </form>
                                    {result.value && (
                                        <div>
                                            <p style={{
                                                color: result.value?.error ? "red" : result.value?.success ? "green" : "black",
                                            }}>
                                                {String(Object.values(result.value)[Object.values(result.value).length-1])}
                                            </p>
                                        </div>
                                    )}
                                </>
                            )
                        }
                    </div>
                    <div>
                        <a href="http://localhost:5000/auth/google">
                            <button style={{
                                background: "#4285F4",
                                color: "white",
                                border: "none",
                                padding: "0.5rem 1rem",
                                borderRadius: "0.5rem",
                                cursor: "pointer",
                                marginTop: "0.5rem",
                            }}>
                                Continue with Google
                            </button>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
});