interface AnalyticsData {
  type: string;
  content: string;
  position: DOMRect;
  timestamp: number;
  viewport: { width: number; height: number };
}


export default class AnalyticsService implements AnalyticsService {
  constructor(private endpoint: string) {
    this.#initHeatmapTracking();
  }

  #initHeatmapTracking(): void {
    document.addEventListener('click', (e: MouseEvent) => {
      this.#trackInteraction('click', e.target as HTMLElement);
    });

    document.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key === 'a' && e.shiftKey) {
        this.#trackAnnotationEvent(window.getSelection()!);
      }
    });
  }

  #trackAnnotationEvent(selection: Selection): void {
    const position = this.#getElementPosition(selection.focusNode?.parentElement!);
    const data: AnalyticsData = {
      type: 'annotation',
      content: selection.toString(),
      position,
      timestamp: Date.now(),
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      }
    };
    this.#sendToBackend(data);
  }

  #getElementPosition(element: HTMLElement): DOMRect {
    return element.getBoundingClientRect();
  }

  #sendToBackend(data: AnalyticsData): void {
    navigator.sendBeacon(this.endpoint, JSON.stringify(data));
  }

  #trackInteraction(eventType: string, element: HTMLElement): void {
    const data: AnalyticsData = {
      type: eventType,
      content: element.textContent || '',
      position: this.#getElementPosition(element),
      timestamp: Date.now(),
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      }
    };
    this.#sendToBackend(data);
  }
} 