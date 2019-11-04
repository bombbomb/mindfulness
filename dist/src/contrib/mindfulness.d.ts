import { MindfulnessOptions, DetailsInterface } from '../interfaces/options';
/**
 * Parent Mindfulness class.
 *
 * Contains some shared functionality used by contrib modules.
 */
export default abstract class Mindfulness {
    options: MindfulnessOptions;
    type: string;
    constructor(options?: MindfulnessOptions);
    /**
     * Handle a "before" function.
     *
     * These functions can be used to modify for a specific request. Before functions
     *
     * @param message The message being logged
     * @param payload The payload being logged
     * @param options The settings for this call
     */
    before(details: DetailsInterface, options?: object): Promise<any>;
    debug(...args: any[]): void;
    /**
     * Get the options for a specific call.
     *
     * Basically will return an options object for a specific call merged with the logger's
     * default options.
     *
     * @param options Call specific options
     */
    getCallOptions(options?: MindfulnessOptions): MindfulnessOptions;
    getEnvironment(): string;
}
