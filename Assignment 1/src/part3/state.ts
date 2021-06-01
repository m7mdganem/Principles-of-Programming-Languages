export type State<S, A> = (initialState: S) => [S, A];

export const bind = <S, A, B>(state: State<S, A>, f: (x: A) => State<S, B>): State<S, B> => {
    return (initialState: S) => f(state(initialState)[1])(state(initialState)[0]);
}