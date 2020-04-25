import { setReactInputValue } from '@kot-shrodingera-team/config/reactUtils';

const HWL = worker.Helper.WriteLine;

const setStakeSum = (stakeSum: number): boolean => {
  HWL(`Вводим сумму ставки - ${stakeSum}`);
  const inputElement = document.queryClassTemplateSelector('betslip__input')[0];
  if (inputElement) {
    setReactInputValue(inputElement, stakeSum);
    return true;
  }

  HWL('Не найдено поле ввода суммы ставки');
  return false;
};

export default setStakeSum;
