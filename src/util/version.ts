import { join } from 'path';
import { readFile } from 'fs';

export default function getMindfulnessVersion(): Promise<string> {
  return new Promise((resolve) => {
    readFile(join(__dirname, '../../package.json'), 'utf8', (err, data) => {
      let version = '';
      if (!err) {
        try {
          const config = JSON.parse(data);
          /* eslint-disable */
          version = config.version;
          /* eslint-enable */
        }
        catch (parseErr) {
          console.error('Could not parse package.json for mindfulness version');
        }
      }
      resolve(version);
    });
  });
}
