import process from 'node:process';
import colors from 'picocolors';
import { SnapshotSummary, SnapshotUpdateState } from '@vitest/snapshot';
import { Suite, Test } from 'mocha';

export function getTestStack(test: Test | Suite): (Test | Suite)[] {
  const stack: (Test | Suite)[] = [test];
  while (test.parent) {
    test = test.parent!;
    stack.unshift(test);
  }
  return stack;
}

export function getNames(test: Test | Suite): string[] {
  return getTestStack(test).map((test) => test.title);
}

export function getTestName(task: Test | Suite, separator = ' > '): string {
  return getNames(task).slice(1).join(separator);
}

export const getUpdateSnapshotStatus = (): SnapshotUpdateState =>
  process.argv.includes('--updateSnapshot') || process.argv.includes('--update-snapshot')
    ? 'all'
    : ((process.env['UPDATE_SNAPSHOT'] || 'none') as SnapshotUpdateState);

export function printSummary(snapshotSummary: SnapshotSummary, title?: string) {
  const { added, updated, total } = snapshotSummary;
  const removed = updated - added;
  const summary: string[] = [];
  if (added > 0) {
    summary.push(`${colors.green(`  > ${added} snapshot written`)} from ${total} test suite`);
  }
  if (updated > 0) {
    summary.push(`${colors.green(`  > ${updated} snapshot updated`)} from ${total} test suite`);
  }
  if (removed > 0) {
    summary.push(`${colors.green(`  > ${removed} snapshot removed`)} from ${total} test suite`);
  }

  /* istanbul ignore next, depends on mocha parallel mode */
  if (title) {
    summary.unshift(`  ${title} snapshot summary`);
  } else {
    summary.unshift(`  Suite snapshot summary`);
  }
  console.log(summary.join('\n'));
}
