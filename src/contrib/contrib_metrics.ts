import { M, MetricInterface } from '../interfaces/metrics';
import Mindfulness from './mindfulness';
import { MindfulnessOptions } from '../interfaces/options';

export default class ContribMetrics extends Mindfulness {
  options: MindfulnessOptions;

  type = 'metrics';
}
