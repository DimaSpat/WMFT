import {ContextId, createContextId} from "@builder.io/qwik"

export interface UserState {
    email: string | undefined;
    coins: number | undefined;
    resources: {
        wheat: number,
        wood: number,
        mineral: number,
        mineralRare: number,
        energyCrystals: number,
    } | undefined;
}

export const UserContext: ContextId<UserState> = createContextId<UserState>('user-context');