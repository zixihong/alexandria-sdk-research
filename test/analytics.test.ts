import AnalyticsService from '../research-assistant/analytics';

describe('AnalyticsService', () => {
  it('should track annotation events', () => {
    const mockSend = jest.fn();
    navigator.sendBeacon = mockSend;
    
    const service = new AnalyticsService('http://test.endpoint');
    const mockNode = document.createElement('div');
    document.body.appendChild(mockNode);
    
    // Create a real selection
    const range = document.createRange();
    range.selectNode(mockNode);
    const selection = window.getSelection()!;
    selection.removeAllRanges();
    selection.addRange(range);
    
    service.trackAnnotationEvent(selection);
    
    expect(mockSend).toHaveBeenCalled();
    document.body.removeChild(mockNode);
  });
}); 