export default class KeybindManager {
  private keybinds: Map<string, (e: KeyboardEvent) => void> = new Map();

  register(combo: string, callback: (e: KeyboardEvent) => void): void {
    document.addEventListener('keydown', (e) => {
      const pressedCombo = [
        e.ctrlKey ? 'ctrl' : '',
        e.shiftKey ? 'shift' : '',
        e.key.toLowerCase()
      ].filter(Boolean).join('+');
      
      if (pressedCombo === combo.toLowerCase()) {
        callback(e);
      }
    });
  }
} 