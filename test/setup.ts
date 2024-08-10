import { afterEach, beforeAll } from 'bun:test';
import 'aurelia-polyfills';
import { Container } from '../src/container';

beforeAll(() => {
  function clearScreen() {
    try { process.stdout.write('\x1Bc'); } catch {}
  }

  clearScreen();
});

afterEach(() => {
  // changing the type of `Container.instance` to `Container | null` could break apps
  // better not to collect angry energy from users
  Container.instance = null!;
});
