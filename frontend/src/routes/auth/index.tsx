import {
  component$,
  $,
  JSXOutput,
  Signal,
  useSignal,
  isBrowser,
} from "@builder.io/qwik";
import { DocumentHead } from "@builder.io/qwik-city";

export const head: DocumentHead = {
  title: "Authentication",
  meta: [
    {
      name: "description",
      content: "Authentication description",
    },
  ],
};

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
  get REGISTER() {
    return `${this.BASE_AUTH}/register`;
  },
  get LOGIN() {
    return `${this.BASE_AUTH}/login`;
  },
  get GOOGLE() {
    return `${this.BASE_AUTH}/google`;
  },
  get TELEGRAM() {
    return `${this.BASE_AUTH}/telegram`;
  },
} as const;

const HTTP_HEADERS = {
  Accept: "application/json",
  "Content-Type": "application/json",
} as const;

const validateForm: any = (
  form: HTMLFormElement | undefined,
  isSigning: boolean,
): AuthResult | null => {
  if (isSigning && form?.password.value !== form?.passwordCheck.value) {
    return {
      success: false,
      message: "Passwords do not match",
    };
  }

  return null;
};

const handleAuthError: any = (): AuthResult => ({
  success: false,
  message: "An error occurred while processing your request.",
});

export default component$((): JSXOutput => {
  const isSigning: Signal<boolean> = useSignal(true);
  const isLoading: Signal<boolean> = useSignal(false);
  const formRef: Signal<HTMLFormElement | undefined> =
    useSignal<HTMLFormElement>();
  const result: Signal = useSignal<any>(null);

  const changeAuthState: any = $((): void => {
    isSigning.value = !isSigning.value;
    formRef.value?.reset();
    result.value = null;
  });

  const submitForm: any = $(async (e: any): Promise<void> => {
    e.preventDefault();
    isLoading.value = true;
    result.value = null;

    const validationError: AuthResult | null = validateForm(
      formRef.value,
      isSigning.value,
    );
    if (validationError) {
      result.value = validationError;
      isLoading.value = false;
      return;
    }

    try {
      const data = Object.fromEntries(
        new FormData(formRef.value),
      ) as unknown as FormDataInput;

      if ("passwordCheck" in data) {
        delete data.passwordCheck;
      }

      const endpoint = isSigning.value
        ? API_ENDPOINTS.REGISTER
        : API_ENDPOINTS.LOGIN;
      const response = await fetch(endpoint, {
        method: "POST",
        credentials: "include",
        body: JSON.stringify(data),
        headers: HTTP_HEADERS,
      });

      const responseData = await response.json();

      if (responseData.success && isBrowser) {
        if (isSigning.value) {
          window.location.href = "/";
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
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#f5f5f5",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "2rem",
      }}
    >
      {/* Card container */}
      <div
        style={{
          width: "100%",
          maxWidth: "400px",
          backgroundColor: "white",
          borderRadius: "10px",
          boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
          overflow: "hidden",
        }}
      >
        {/* Header tabs – Sign Up / Log In */}
        <div
          style={{
            display: "flex",
            backgroundColor: "#4a6fa5",
            color: "white",
          }}
        >
          <button
            onClick$={changeAuthState}
            disabled={isSigning.value}
            style={{
              flex: 1,
              padding: "1rem",
              border: "none",
              color: "white",
              backgroundColor: isSigning.value ? "#3a5a8f" : "#4a6fa5",
              cursor: !isSigning.value ? "pointer" : "not-allowed",
            }}
          >
            Sign Up
          </button>
          <button
            onClick$={changeAuthState}
            disabled={!isSigning.value}
            style={{
              flex: 1,
              padding: "1rem",
              border: "none",
              color: "white",
              backgroundColor: !isSigning.value ? "#3a5a8f" : "#4a6fa5",
              cursor: isSigning.value ? "pointer" : "not-allowed",
            }}
          >
            Log In
          </button>
        </div>

        {/* Form body */}
        <div style={{ padding: "2rem" }}>
          {isSigning.value ? (
            <>
              <h2
                style={{
                  textAlign: "center",
                  marginBottom: "1rem",
                  color: "#333",
                }}
              >
                Create Account
              </h2>
              <p
                style={{
                  textAlign: "center",
                  marginBottom: "1.5rem",
                  color: "#666",
                }}
              >
                Join WMFT and start your adventure
              </p>
              <form
                ref={formRef}
                onSubmit$={submitForm}
                preventdefault:submit={true}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "1rem",
                }}
              >
                <label style={{ fontWeight: "bold", color: "#333" }}>
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  style={{
                    padding: "0.75rem",
                    border: "1px solid #ddd",
                    borderRadius: "5px",
                  }}
                />
                <label style={{ fontWeight: "bold", color: "#333" }}>
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  required
                  style={{
                    padding: "0.75rem",
                    border: "1px solid #ddd",
                    borderRadius: "5px",
                  }}
                />
                <label style={{ fontWeight: "bold", color: "#333" }}>
                  Confirm Password
                </label>
                <input
                  type="password"
                  name="passwordCheck"
                  required
                  style={{
                    padding: "0.75rem",
                    border: "1px solid #ddd",
                    borderRadius: "5px",
                  }}
                />
                <button
                  type="submit"
                  disabled={isLoading.value}
                  style={{
                    padding: "0.75rem",
                    backgroundColor: "#4a6fa5",
                    color: "white",
                    border: "none",
                    borderRadius: "5px",
                    fontWeight: "bold",
                    cursor: "pointer",
                  }}
                >
                  {isLoading.value ? "Processing…" : "Create Account"}
                </button>
              </form>
            </>
          ) : (
            <>
              <h2
                style={{
                  textAlign: "center",
                  marginBottom: "1rem",
                  color: "#333",
                }}
              >
                Welcome Back
              </h2>
              <p
                style={{
                  textAlign: "center",
                  marginBottom: "1.5rem",
                  color: "#666",
                }}
              >
                Log in to continue your adventure
              </p>
              <form
                ref={formRef}
                onSubmit$={submitForm}
                preventdefault:submit={true}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "1rem",
                }}
              >
                <label style={{ fontWeight: "bold", color: "#333" }}>
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  style={{
                    padding: "0.75rem",
                    border: "1px solid #ddd",
                    borderRadius: "5px",
                  }}
                />
                <label style={{ fontWeight: "bold", color: "#333" }}>
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  required
                  style={{
                    padding: "0.75rem",
                    border: "1px solid #ddd",
                    borderRadius: "5px",
                  }}
                />
                <button
                  type="submit"
                  disabled={isLoading.value}
                  style={{
                    padding: "0.75rem",
                    backgroundColor: "#4a6fa5",
                    color: "white",
                    border: "none",
                    borderRadius: "5px",
                    fontWeight: "bold",
                    cursor: "pointer",
                  }}
                >
                  {isLoading.value ? "Logging in…" : "Log In"}
                </button>
              </form>
            </>
          )}

          {/* Result message */}
          {result.value && (
            <div
              style={{
                marginTop: "1rem",
                padding: "0.75rem",
                backgroundColor: result.value.success ? "#d4edda" : "#f8d7da",
                borderRadius: "5px",
              }}
            >
              <p
                style={{
                  margin: 0,
                  color: result.value.success ? "#155724" : "#721c24",
                  textAlign: "center",
                }}
              >
                {result.value.message}
              </p>
            </div>
          )}

          {/* Social login */}
          <div style={{ marginTop: "2rem", textAlign: "center" }}>
            <p style={{ marginBottom: "0.5rem", color: "#666" }}>
              Or continue with
            </p>
            <div
              style={{ display: "flex", gap: "1rem", justifyContent: "center" }}
            >
              <a href={API_ENDPOINTS.GOOGLE} style={{ textDecoration: "none" }}>
                <button
                  style={{
                    background: "#4285F4",
                    color: "white",
                    border: "none",
                    padding: "0.5rem 1rem",
                    borderRadius: "5px",
                    cursor: "pointer",
                  }}
                >
                  Google
                </button>
              </a>
              <a
                href={API_ENDPOINTS.TELEGRAM}
                style={{ textDecoration: "none" }}
              >
                <button
                  style={{
                    background: "#0088cc",
                    color: "white",
                    border: "none",
                    padding: "0.5rem 1rem",
                    borderRadius: "5px",
                    cursor: "pointer",
                  }}
                >
                  Telegram
                </button>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});
