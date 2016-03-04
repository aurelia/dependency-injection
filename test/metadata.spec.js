import './setup';
import {Parent} from '../src/resolvers';
import {Container} from '../src/container';

describe('Parent', () => {
  it('should return the key from the parent container when present', () => {
    let sut = new Parent('test');
    let parent = new Container();
    let childContainer = parent.createChild();
    let instance = {};
    let wrongInstance = {};

    parent.registerInstance('test', instance);
    childContainer.registerInstance('test', wrongInstance);

    let result = sut.get(childContainer);

    expect(result).toBe(instance);
    expect(result).not.toBe(wrongInstance);
  });

  it('should return null when the parent container is not present', () => {
    let sut = new Parent('test');
    let childContainer = new Container();
    let instance = {};

    childContainer.registerInstance('test', instance);
    expect(sut.get(childContainer)).toBe(null);
  });
});
