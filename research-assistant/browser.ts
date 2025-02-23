import AlexandriaResearch from './index';

declare global {
  interface Window {
    AlexandriaResearch: typeof AlexandriaResearch;
  }
}

window.AlexandriaResearch = AlexandriaResearch; 