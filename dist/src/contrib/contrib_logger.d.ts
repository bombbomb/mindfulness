import Mindfulness from './mindfulness';
import { MindfulnessOptions } from '../interfaces/options';
export default abstract class ContribLogger extends Mindfulness {
    type: string;
    constructor(options?: MindfulnessOptions);
    abstract call(level: string, message: any, payload?: any, options?: MindfulnessOptions): Promise<any>;
    /**
     * Log a message to console.log
     * @param message Message or item to log
     * @param payload Additional payload to log
     * @param options Optional call-specific options
     */
    log(message: any, payload?: object, options?: MindfulnessOptions): Promise<any>;
    /**
     * Log a message to console.error
     * @param message Message or item to log
     * @param payload Additional payload to log
     * @param options Optional call-specific options
     */
    logError(message: any, payload?: object, options?: MindfulnessOptions): Promise<any>;
    /**
     * Log a message to console.info
     * @param message Message or item to log
     * @param payload Additional payload to log
     * @param options Optional call-specific options
     */
    logInfo(message: any, payload?: object, options?: MindfulnessOptions): Promise<any>;
    /**
     * Log a message to console.warn
     * @param message Message or item to log
     * @param payload Additional payload to log
     * @param options Optional call-specific options
     */
    logWarn(message: any, payload?: object): Promise<any>;
}
