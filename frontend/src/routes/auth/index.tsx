import { component$, $, JSXOutput, Signal, useSignal } from "@builder.io/qwik";
import {DocumentHead, useNavigate} from "@builder.io/qwik-city";

export const head: DocumentHead = {
    title: "Authentication",
    meta: [
        {
            name: "description",
            content: "Authentication description",
        }
    ]
}

interface AuthResult {
    success: boolean;
    message: string;
    user?: {
        email: string;
        coins: number;
        resources: any[];
    };
    payload?: object;
    token?: string;
}

interface FormDataInput {
    email: string;
    password: string;
    passwordCheck?: string;
}

const API_ENDPOINTS = {
    BASE_AUTH: `${import.meta.env.VITE_API_BASE_URL}/api/auth`,
    get REGISTER() { return `${this.BASE_AUTH}/register` },
    get LOGIN() { return `${this.BASE_AUTH}/login` },
    get GOOGLE() { return `${this.BASE_AUTH}/google` }
} as const;


const HTTP_HEADERS = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
} as const;

const validateForm:any = (form:HTMLFormElement|undefined, isSigning:boolean):AuthResult|null => {
    if (isSigning && form?.password.value !== form?.passwordCheck.value) {
        return {
            success: false,
            message: "Passwords do not match",
        };
    }

    return null;
};

const handleAuthError:any = (error: unknown): AuthResult => ({
    success: false,
    message: "An error occurred while processing your request."
});


export default component$(():JSXOutput => {
    const isSigning:Signal<boolean> = useSignal(true);
    const isLoading:Signal<boolean> = useSignal(false);
    const formRef:Signal<HTMLFormElement | undefined> = useSignal<HTMLFormElement>();
    const result:Signal = useSignal<any>(null);
    const nav = useNavigate();

    const changeAuthState:any = $(():void => {
        isSigning.value = !isSigning.value;
        formRef.value?.reset();
        result.value = null;
    });

    const submitForm:any = $(async (e:any): Promise<void> => {
        e.preventDefault();
        isLoading.value = true;
        result.value = null;

        const validationError:AuthResult|null = validateForm(formRef.value, isSigning.value);
        if (validationError) {
            result.value = validationError;
            isLoading.value = false;
            return;
        }

        try {
            const data = Object.fromEntries(new FormData(formRef.value)) as unknown as FormDataInput;

            if ('passwordCheck' in data) {
                delete data.passwordCheck;
            }

            const endpoint = isSigning.value ? API_ENDPOINTS.REGISTER : API_ENDPOINTS.LOGIN;
            const response = await fetch(endpoint, {
                method: "POST",
                credentials: 'include',
                body: JSON.stringify(data),
                headers: HTTP_HEADERS,
            });

            const responseData = await response.json();

            if (responseData.success) {
                if (isSigning.value) {
                    window.location.href = '/';
                } else {
                    changeAuthState();
                    result.value = responseData;
                }
            } else {
                result.value = responseData;
            }
        } catch (error) {
            result.value = handleAuthError(error);
        } finally {
            isLoading.value = false;
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
                                                color: !result.value?.success ? "red" : result.value?.success ? "green" : "black",
                                            }}>
                                                {result.value?.message}
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
                                                color: !result.value?.success ? "red" : result.value?.success ? "green" : "black",
                                            }}>
                                                {result.value?.message}
                                            </p>
                                        </div>
                                    )}
                                </>
                            )
                        }
                    </div>
                    <div>
                        <a href={API_ENDPOINTS.GOOGLE}>
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