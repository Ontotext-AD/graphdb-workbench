/**
 * Stubs the global ResizeObserver for the current spec file, since jsdom doesn't implement it
 * unlike real browsers. Call this inside a `describe` block for any component that (directly or
 * through a child component) observes an element with ResizeObserver.
 *
 * Combine with `triggerResize` to simulate a resize of an observed element.
 *
 * @example
 * describe('MyComponent', () => {
 *   mockResizeObserverForTesting();
 *
 *   it('reacts to a resize', () => {
 *     fixture.detectChanges(); // runs the code that calls resizeObserver.observe(el)
 *
 *     const el = fixture.nativeElement.querySelector('.observed-target');
 *     triggerResize(el, {width: 300, height: 120});
 *
 *     fixture.detectChanges();
 *     // assert the component reacted to the resize
 *   });
 * });
 */

interface ObservedTarget {
  callback: ResizeObserverCallback;
  observer: ResizeObserver;
}

let observedTargets = new Map<Element, ObservedTarget[]>();

export function mockResizeObserverForTesting(): void {
  let originalResizeObserver: typeof ResizeObserver | undefined;

  beforeEach(() => {
    originalResizeObserver = globalThis.ResizeObserver;
    observedTargets = new Map();

    globalThis.ResizeObserver = class implements ResizeObserver {
      constructor(private readonly callback: ResizeObserverCallback) {
      }

      observe(target: Element): void {
        const targets = observedTargets.get(target) ?? [];
        targets.push({callback: this.callback, observer: this});
        observedTargets.set(target, targets);
      }

      unobserve(target: Element): void {
        const targets = observedTargets.get(target);
        if (targets) {
          observedTargets.set(target, targets.filter((entry) => entry.callback !== this.callback));
        }
      }

      disconnect(): void {
        observedTargets.forEach((targets, target) => {
          observedTargets.set(target, targets.filter((entry) => entry.callback !== this.callback));
        });
      }
    };
  });

  afterEach(() => {
    globalThis.ResizeObserver = originalResizeObserver as typeof ResizeObserver;
    observedTargets.clear();
  });
}

/**
 * Simulates a resize of `target` by invoking the callback of every ResizeObserver currently
 * observing it, as registered by the stub installed via `mockResizeObserverForTesting`.
 */
export function triggerResize(target: Element, contentRect: Partial<DOMRectReadOnly> = {}): void {
  const targets = observedTargets.get(target);
  if (!targets || targets.length === 0) {
    throw new Error('triggerResize: no ResizeObserver is currently observing the given element');
  }

  const entry = {
    target,
    contentRect: {
      x: 0, y: 0, top: 0, left: 0, bottom: 0, right: 0, width: 0, height: 0,
      ...contentRect
    },
    borderBoxSize: [],
    contentBoxSize: [],
    devicePixelContentBoxSize: []
  } as unknown as ResizeObserverEntry;

  targets.forEach(({callback, observer}) => callback([entry], observer));
}
