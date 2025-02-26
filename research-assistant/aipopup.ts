import AIContext from './types/aicontext';

export default interface AIPopup {
  show(selection: string, context: AIContext): void;
  hide(): void;
}