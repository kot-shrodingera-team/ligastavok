import { getReactInstance } from '@kot-shrodingera-team/germes-utils/reactUtils';

const getDispatch: () => (data: Record<string, unknown>) => unknown = () => {
  const reactRootElement = document.querySelector('#app > div');
  if (!reactRootElement) {
    return null;
  }
  const reactRootInstance = getReactInstance(
    reactRootElement
  ) as RootReactInstanse;
  if (
    !reactRootInstance.return ||
    !reactRootInstance.return.pendingProps ||
    !reactRootInstance.return.pendingProps.value ||
    !reactRootInstance.return.pendingProps.value.store ||
    !reactRootInstance.return.pendingProps.value.store.dispatch
  ) {
    return null;
  }
  return reactRootInstance.return.pendingProps.value.store.dispatch;
};

export default getDispatch;
