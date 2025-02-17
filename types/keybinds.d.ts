declare module './keybinds' {
  export default class KeybindManager {
    register(combo: string, callback: (e: KeyboardEvent) => void): void;
  }
} 