import {
  checkBookerHost,
  getElement,
  log,
} from '@kot-shrodingera-team/germes-utils';
import {
  NewUrlError,
  JsFailError,
} from '@kot-shrodingera-team/germes-utils/errors';
import checkAuth, { authStateReady } from '../stake_info/checkAuth';
import { balanceReady, updateBalance } from '../stake_info/getBalance';

const preOpenEvent = async (): Promise<void> => {
  if (!checkBookerHost()) {
    log('Открыта не страница конторы (или зеркала)', 'crimson');
    window.location.href = new URL(worker.BookmakerMainUrl).href;
    throw new NewUrlError('Открываем страницу БК');
  }

  await authStateReady();
  worker.Islogin = checkAuth();
  worker.JSLogined();
  if (!worker.Islogin) {
    throw new JsFailError('Нет авторизации');
  }
  log('Есть авторизация', 'steelblue');
  await balanceReady();
  updateBalance();

  if (!/^\/bets\/live/i.test(window.location.pathname)) {
    log('Открыт не Live', 'crimson');
    const liveButton = await getElement<HTMLElement>('[href="/bets/live"]');
    if (!liveButton) {
      throw new JsFailError('Не найдена кнопка перехода на Live');
    }
    log('Переходим на Live', 'orange');
    liveButton.click();
  }
};

export default preOpenEvent;
