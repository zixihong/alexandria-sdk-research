export interface KeybindManager {
  register(combo: string, callback: (e: KeyboardEvent) => void): void;
}

export default class DefaultKeybindManager implements KeybindManager {
  #keybinds: Map<string, (e: KeyboardEvent) => void> = new Map();

  register(combo: string, callback: (e: KeyboardEvent) => void): void {
    if (this.#keybinds.has(combo)) {
      throw new Error(`${combo} already registered`);
    }
    this.#keybinds.set(combo, callback);
    
    document.addEventListener('keydown', (e) => {
      const pressedCombo = [
        e.shiftKey ? 'shift' : '',
        e.key.toLowerCase()
      ].filter(Boolean).join('+');
      
      if (pressedCombo === combo.toLowerCase()) {
        callback(e);
      }
    });
  }
} 