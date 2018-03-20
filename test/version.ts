import getMindfulnessVersion from '../src/util/version';

test('getMindfulnessVersion returns version', async (done) => {
  const version = await getMindfulnessVersion();
  expect(version).not.toBe('');
  done();
});
