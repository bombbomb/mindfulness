import getMindfulnessVersion from './version';

test('getMindfulnessVersion returns version', async () => {
  const version = await getMindfulnessVersion();
  expect(version).not.toBe('');
});
