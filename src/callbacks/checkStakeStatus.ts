import * as selectors from '../selectors';

const HWL = worker.Helper.WriteLine;

const checkStakeStatus = (): boolean => {
  const betServiceMessages = document.queryClassTemplateSelector(
    selectors.betslipServiceMessageClass
  );
  if (!betServiceMessages) {
    HWL('Ошибка проверки результата ставки: Не найдены служебные сообщения');
    return false;
  }
  const isStakeAccepted = betServiceMessages.some(
    (message) => message.textContent.trim() === 'Пари приняты'
  );
  if (!isStakeAccepted) {
    HWL('Пари не принято');
    return false;
  }
  HWL('Пари принято');
  // worker.Helper.LoadUrl(worker.EventUrl);
  return true;
};

export default checkStakeStatus;
