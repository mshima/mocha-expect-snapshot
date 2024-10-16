let postTests = [];

/** @type {import("mocha").RootHookObject} */
const mochaHooks = {
  async beforeAll() {
    this.postTests = postTests;
  },
  async beforeEach() {
    this.postTests = postTests;
  },
  async afterAll() {
    for (const postTest of postTests) {
      await postTest?.(this.summary);
    }
    postTests = [];
  },
};

export default { mochaHooks };
