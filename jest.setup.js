jest.setTimeout(10000); // 2 minutes

beforeEach(() => {
  jest.useFakeTimers();
});

afterEach(() => {
  jest.useRealTimers();
});

afterAll(done => {
  jest.useRealTimers();
  done();
});