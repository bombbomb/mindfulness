import { LoggerInterface } from '../interfaces/logger';
import ContribLogger from './contrib_logger';
import { MindfulnessOptions } from '../interfaces/options';
/**
 * Log messages to the console.
 */
export declare class DebugLogger extends ContribLogger implements LoggerInterface {
    options: MindfulnessOptions;
    /**
     * The log message handler.
     *
     * This will debug to the namespace property or you can re-use a debug instance
     * by passing that in as an option.
     *
     * @param level The log level to use.
     * @param message The message or item to log
     * @param payload Optional additional payload to log
     * @param options Optional call-specific options for this log.
     */
    call(level: string, message: any, payload?: any, options?: MindfulnessOptions): Promise<any>;
}
