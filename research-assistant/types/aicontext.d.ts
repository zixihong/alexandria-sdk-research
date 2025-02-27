export default interface AIContext {
    title: string;
    abstract: string;
    sections: Array<{
        heading: string;
        content: string;
    }>;
    context: string;
}