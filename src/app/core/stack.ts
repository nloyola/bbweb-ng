// borrowed from
// https://basarat.gitbooks.io/algorithms/content/docs/datastructures/stack.html
export class Stack<T> {
  private store: T[] = [];

  push(val: T) {
    this.store.push(val);
  }

  pop(): T | undefined {
    return this.store.pop();
  }

  clear(): void {
    this.store = [];
  }

  isEmpty(): boolean {
    return this.store.length === 0;
  }
}
