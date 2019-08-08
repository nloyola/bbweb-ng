export interface SearchState<T, S> {
  readonly lastSearch?: S;
  readonly searchActive?: boolean;
  readonly replies?: T;
}
