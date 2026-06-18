import { AsyncLocalStorage } from 'async_hooks';

export const userContextStorage = new AsyncLocalStorage();

export const getContextUser = () => {
    return userContextStorage.getStore()?.userId || 'SYSTEM_AUTOMATION';
};