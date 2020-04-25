import * as selectors from '../selectors';

const HWL = worker.Helper.WriteLine;

const checkCuponLoading = (): boolean => {
  const betServiceMessages = document.queryClassTemplateSelector(
    selectors.betslipServiceMessageClass
  );
  if (!betServiceMessages) {
    HWL(
      'Ошибка проверки статуса обработки купона: Не найдены служебные сообщения'
    );
    return true;
  }
  const isCouponLoading = betServiceMessages.some(
    (message) => message.textContent.trim() === 'Обработка пари'
  );
  if (isCouponLoading) {
    HWL('Обработка пари');
    return true;
  }
  HWL('Обработка пари закончена');
  return false;
};

export default checkCuponLoading;
