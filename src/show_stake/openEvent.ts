import { log } from '@kot-shrodingera-team/germes-utils';
import {
  JsFailError,
  NewUrlError,
} from '@kot-shrodingera-team/germes-utils/errors';

const openEvent = async (): Promise<void> => {
  /* ======================================================================== */
  /*             Если не было попытки перехода на страницу события            */
  /* ======================================================================== */

  if (
    worker.GetSessionData(
      `${window.germesData.bookmakerName}.TransitionToEventPage`
    ) === '0'
  ) {
    if (window.location.href === worker.EventUrl) {
      log('Уже открыто нужное событие', 'steelblue');
      return;
    }
    log(`${window.location.href} !== ${worker.EventUrl}`, 'white', true);
    worker.SetSessionData(
      `${window.germesData.bookmakerName}.TransitionToEventPage`,
      '1'
    );
    window.location.href = worker.EventUrl;
    throw new NewUrlError('Переходим на событие');
  }

  /* ======================================================================== */
  /*              Если была попытка перехода на страницу события              */
  /* ======================================================================== */

  if (window.location.href === worker.EventUrl) {
    log('Открыли нужное событие', 'steelblue');
    return;
  }
  log(`${window.location.href} !== ${worker.EventUrl}`, 'crimson');
  throw new JsFailError('Не удалось перейти на нужное событие');
};

export default openEvent;
