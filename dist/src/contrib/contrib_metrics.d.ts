import Mindfulness from './mindfulness';
import { MindfulnessOptions } from '../interfaces/options';
export default abstract class ContribMetrics extends Mindfulness {
    options: MindfulnessOptions;
    type: string;
}
