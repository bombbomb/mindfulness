import Mindfulness from './mindfulness';
import { MindfulnessOptions } from '../interfaces/options';
import { MetricsBeforeResult } from '../interfaces/metrics';

export default abstract class ContribMetrics extends Mindfulness<MetricsBeforeResult> {
  active = false;

  options: MindfulnessOptions;

  type = 'metrics';
}
