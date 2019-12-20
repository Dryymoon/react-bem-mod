/**
 * Created by dryymoon on 23.01.17.
 */

import React from 'react';

export default function cloneReferencedElement(element, config, ...children) {
  const cloneRef = config.ref;
  const originalRef = element.ref;
  if (originalRef == null || cloneRef == null) {
    return React.cloneElement(element, config, ...children);
  }

  if (typeof originalRef !== 'function') {
    if (__DEVELOPMENT__) {
      // eslint-disable-next-line
      console.warn(
        `${'Cloning an element with a ref that will be overwritten because it ' +
        'is not a function. Use a composable callback-style ref instead. ' +
        'Ignoring ref: '}${originalRef}`);
    }
    return cloneElement(element, config, ...children);
  }

  return React.cloneElement(element, {
    ...config,
    ref(component) {
      cloneRef(component);
      originalRef(component);
    },
  }, ...children);
}
