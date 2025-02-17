import KeybindManager from './keybinds';

interface Config {
  aiApiKey: string;
  analyticsEndpoint: string;
}

export default class ResearchAssistant {
  private config: Config;
  private keybindManager: KeybindManager;
  private authorCommunicator: AuthorCommunicator;
  private analyticsService: AnalyticsService;

  constructor(config: Partial<Config> = {}) {
    this.config = {
      aiApiKey: '',
      analyticsEndpoint: '',
      ...config
    };
    
    this.keybindManager = new KeybindManager();
    this.authorCommunicator = new AuthorCommunicator();
    this.analyticsService = new AnalyticsService(this.config.analyticsEndpoint);
    
    this.initializeKeybinds();
    this.scanForAuthorEmails();
  }

  private initializeKeybinds(): void {
    this.keybindManager.register('shift+a', (e: KeyboardEvent) => {
      const selection = window.getSelection()!.toString();
      const context = this.getPageContext();
      this.showAIPopup(selection, context);
    });
    
    this.keybindManager.register('shift+e', (e: KeyboardEvent) => {
      const highlightedText = window.getSelection()!.toString();
      this.authorCommunicator.showEmailComposer(highlightedText);
    });
  }

  private getPageContext(): AIContext {
    return {
      title: document.title,
      abstract: document.querySelector('.abstract')?.textContent || '',
      sections: Array.from(document.querySelectorAll('section')).map(section => ({
        heading: section.querySelector('h2')?.textContent || '',
        content: section.textContent || ''
      }))
    };
  }

  private showAIPopup(selection: string, context: AIContext): void {
    const popup = new AIPopup(selection, context);
    document.body.appendChild(popup.render());
  }

  private scanForAuthorEmails(): void {
    const emailPattern = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
    const emails = Array.from(document.body.textContent?.matchAll(emailPattern) || []);
    this.authorCommunicator.storeEmails(emails);
  }
} 