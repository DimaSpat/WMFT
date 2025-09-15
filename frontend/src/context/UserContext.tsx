import {ContextId, createContextId} from "@builder.io/qwik"

export interface UserState {
    email: string | undefined;
    coins: number | undefined;
    resources: any[] | undefined;
}

export const UserContext: ContextId<UserState> = createContextId<UserState>('user-context');