import {
  checkLogin,
  getStakeCount,
  checkStakeEnebled,
  getSumFromCoupon,
  getMinStake,
  getMaxStake,
  getParameterFromCoupon,
} from './getStakeInfo';
import * as selectors from '../selectors';

const HWL = worker.Helper.WriteLine;

const doStake = (): boolean => {
  HWL('Проверка перед ставкой');
  worker.Islogin = checkLogin();
  if (!worker.Islogin) {
    HWL('Ошибка ставки: Нет авторизации');
    worker.JSLogined();
    return false;
  }
  if (getStakeCount() !== 1) {
    HWL('Ошибка ставки: Количество ставок в купоне не равно 1');
    return false;
  }
  if (!checkStakeEnebled()) {
    HWL('Ставка не доступна');
    return false;
  }
  const currentSum = getSumFromCoupon();
  if (worker.StakeInfo.Summ !== currentSum) {
    HWL('Ошибка ставки: Введённая сумма ставки не равна расчитанной в боте');
    return false;
  }
  if (currentSum < getMinStake()) {
    HWL('Ошибка ставки: Введённая сумма ставки ниже минимальной');
    return false;
  }
  if (currentSum > getMaxStake()) {
    HWL('Ошибка ставки: Введённая сумма ставки выше максимальной');
    return false;
  }
  if (worker.StakeInfo.Parametr !== getParameterFromCoupon()) {
    HWL('Ошибка ставки: Параметр изменился');
    return false;
  }
  const [acceptButton] = document.queryClassTemplateSelector(
    selectors.betslipSubmitButtonClass
  ) as HTMLButtonElement[];
  if (!acceptButton) {
    HWL('Ошибка ставки: Не найдена кнопка принятия ставки');
    return false;
  }
  HWL('Нажимаем кнопку ставки');
  acceptButton.click();
  return true;
};

export default doStake;
