interface AnalyticsData {
  type: string;
  content: string;
  position: DOMRect;
  timestamp: number;
  viewport: { width: number; height: number };
}

export default class AnalyticsService {
  constructor(private endpoint: string) {
    this.initHeatmapTracking();
  }

  private initHeatmapTracking(): void {
    document.addEventListener('click', (e: MouseEvent) => {
      this.trackInteraction('click', e.target as HTMLElement);
    });

    document.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key === 'a' && e.shiftKey) {
        this.trackAnnotationEvent(window.getSelection()!);
      }
    });
  }

  trackAnnotationEvent(selection: Selection): void {
    const position = this.getElementPosition(selection.focusNode?.parentElement!);
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
    this.sendToBackend(data);
  }

  private getElementPosition(element: HTMLElement): DOMRect {
    return element.getBoundingClientRect();
  }

  private sendToBackend(data: AnalyticsData): void {
    navigator.sendBeacon(this.endpoint, JSON.stringify(data));
  }
} 