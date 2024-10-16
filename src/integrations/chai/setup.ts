// https://raw.githubusercontent.com/vitest-dev/vitest/main/packages/vitest/src/integrations/chai/setup.ts
import * as chai from 'chai';
import { JestAsymmetricMatchers, JestChaiExpect, JestExtend } from '@vitest/expect';
import { SnapshotPlugin } from '../snapshot/chai.js';

chai.use(JestExtend);
chai.use(JestChaiExpect);
chai.use(SnapshotPlugin);
chai.use(JestAsymmetricMatchers);
