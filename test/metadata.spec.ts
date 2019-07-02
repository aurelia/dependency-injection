import './setup';
import { Container } from '../src/container';
import { Parent } from '../src/resolvers';

describe('Parent', () => {
  it('should return the key from the parent container when present', () => {
    const sut = new Parent('test');
    const parent = new Container();
    const childContainer = parent.createChild();
    const instance = {};
    const wrongInstance = {};

    parent.registerInstance('test', instance);
    childContainer.registerInstance('test', wrongInstance);

    const result = sut.get(childContainer);

    expect(result).toBe(instance);
    expect(result).not.toBe(wrongInstance);
  });

  it('should return null when the parent container is not present', () => {
    const sut = new Parent('test');
    const childContainer = new Container();
    const instance = {};

    childContainer.registerInstance('test', instance);
    expect(sut.get(childContainer)).toBe(null);
  });
});
