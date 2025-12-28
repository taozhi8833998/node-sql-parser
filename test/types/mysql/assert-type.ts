import util from 'node:util';
import assert from 'node:assert';

export function assertType(func: any, ast: any, reason?: string) {
  const ok = func(ast);
  if (!ok) {
    console.log(util.formatWithOptions({ depth: 99 }, "checker:", func, 'fails for ast:', ast));
  }
  assert.ok(ok, reason);
}
