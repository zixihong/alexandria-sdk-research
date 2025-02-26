declare module 'llamaai' {
  export default class LlamaAI {
    constructor(apiToken: string);
    run(requestData: any): Promise<Response>;
  }
} 