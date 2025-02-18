import KeybindManager from './types/keybinds';
import Config from './types/config';
import AIContext from './types/aicontext';
import AuthorCommunicator from './types/author-communicator';
import AnalyticsService from './types/analytics-service';
import AIPopup from './types/aipopup';

export default class AlexandriaResearch {
  #config: Config;
  #keybindManager: KeybindManager;
  #authorCommunicator: AuthorCommunicator;
  #analyticsService: AnalyticsService;

  constructor(config: Partial<Config> = {}) {
    this.#config = {
      aiApiKey: '',
      analyticsEndpoint: '',
      ...config
    };
    
    this.#keybindManager = new KeybindManager();
    this.#authorCommunicator = new AuthorCommunicator();
    this.#analyticsService = new AnalyticsService(this.#config.analyticsEndpoint);
    this.#initializeKeybinds();
  }

  #initializeKeybinds(): void {
    this.#keybindManager.register('shift+a', (e: KeyboardEvent) => {
      const selection = window.getSelection()!.toString();
      const context = this.#getPageContext();
      this.#showAIPopup(selection, context);
    });
    
    this.#keybindManager.register('shift+e', (e: KeyboardEvent) => {
      const highlightedText = window.getSelection()!.toString();
      this.#authorCommunicator.showEmailComposer(highlightedText);
    });
  }

  
  #getPageContext(): AIContext {
    return {
      title: document.title,
      abstract: document.querySelector('.abstract')?.textContent || '',
      sections: Array.from(document.querySelectorAll('section')).map(section => ({
        heading: section.querySelector('h2')?.textContent || '',
        content: section.textContent || ''
      }))
    };
  }

  #showAIPopup(selection: string, context: AIContext): void {
    const popup = new AIPopup(selection, context);
    document.body.appendChild(popup.render());
  }


} 