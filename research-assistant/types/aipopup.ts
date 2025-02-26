import AIContext from './aicontext';

export default class AIPopup {
  constructor(
    private selection: string,
    private context: AIContext
  ) {}

  render(): HTMLElement {
    const popup = document.createElement('div');
    popup.innerHTML = `<div class="ai-popup">${this.selection}</div>`;
    return popup;
  }
} 