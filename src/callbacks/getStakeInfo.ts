import * as selectors from '../selectors';

const HWL = worker.Helper.WriteLine;

export const checkLogin = (): boolean => {
  return (
    [document.queryClassTemplateSelector(selectors.authPanelClass)] !==
    undefined
  );
};

export const getStakeCount = (): number => {
  const bets = document.queryClassTemplateSelector(selectors.betslipBetClass);
  return bets.length;

  // Ещё вариант из localStorage
  // JSON.parse(localStorage.betslip).bets.length;
};

export const getBalance = (): number => {
  const [balanceElement] = document.queryClassTemplateSelector(
    selectors.balanceClass
  );
  if (!balanceElement) {
    HWL(`Ошибка получения баланса: Баланс не найден`);
    return -1;
  }
  // Убираем пробелы по краям и внутри суммы, заменяем запятую на точку
  const balance = balanceElement.textContent
    .trim()
    .replace(/ /g, '')
    .replace(',', '.');
  const balanceRegex = /^\d+\.\d+₽$/;
  if (!balanceRegex.test(balance)) {
    HWL(`Ошибка получения баланса: Некорректный формат баланса - '${balance}'`);
    return -1;
  }
  return parseFloat(balance);
};

export const getMinStake = (): number => {
  // Если не находит минимальную ставку, делает её равной 0
  const [minimumStakeElement] = document.queryClassTemplateSelector(
    selectors.betslipBetLimitClass
  );
  if (!minimumStakeElement) {
    HWL(`Ошибка получения минимальной ставки: Минимальная ставка не найдена`);
    return 0;
  }
  const minimumStake = minimumStakeElement.textContent.replace(/ /g, '');
  const limitRegex = /^\d+$/;
  if (!limitRegex.test(minimumStake)) {
    HWL(
      `Ошибка получения минимальной ставки: Некорректный формат - '${minimumStake}'`
    );
    return 0;
  }
  return parseFloat(minimumStake);
};

export const getMaxStake = (): number => {
  const [, maximumStakeElement] = document.queryClassTemplateSelector(
    selectors.betslipBetLimitClass
  );
  if (!maximumStakeElement) {
    HWL(`Ошибка получения максимальной ставки: Максимальная ставка не найдена`);
    return NaN;
  }
  const maximumStake = maximumStakeElement.textContent.replace(/ /g, '');
  const limitRegex = /^\d+$/;
  if (!limitRegex.test(maximumStake)) {
    HWL(
      `Ошибка получения максимальной ставки: Некорректный формат - '${maximumStake}'`
    );
    return NaN;
  }
  return parseFloat(maximumStake);
};

export const getSumFromCoupon = (): number => {
  const [betInput] = document.queryClassTemplateSelector(
    selectors.betslipBetInputClass
  ) as HTMLInputElement[];
  if (!betInput) {
    HWL(
      'Ошибка получения текущей суммы ставки в купоне: Поле ввода суммы ставки не найдено'
    );
    return 0;
  }
  const currentSum = betInput.value.replace(',', '.');
  if (currentSum === '') {
    return NaN;
  }
  const limitRegex = /^\d+(?:\.\d+)?$/;
  if (!limitRegex.test(currentSum)) {
    HWL(
      `Ошибка получения текущей суммы ставки в купоне: Некорректный формат - '${currentSum}'`
    );
    return NaN;
  }
  return parseFloat(currentSum);
};

export const checkStakeEnebled = (): boolean => {
  const betServiceMessages = document.queryClassTemplateSelector(
    selectors.betslipServiceMessageClass
  );
  if (
    betServiceMessages.some(
      (message) =>
        message.textContent.trim() === 'Заключение пари приостановлено'
    )
  ) {
    HWL('Заключение пари приостановлено');
    return false;
  }
  return true;
};

export const getCoefficientFromCoupon = (): number => {
  const [betCoefficientElement] = document.queryClassTemplateSelector(
    selectors.betslitCoefficientClass
  );
  if (!betCoefficientElement) {
    HWL('Ошибка получения коеффициента: Коеффициент не найден');
    return 0;
  }
  const [
    initialCoefficient,
    actualCoefficient,
  ] = betCoefficientElement.childNodes;
  if (!initialCoefficient) {
    HWL('Ошибка получения коеффициента: Изначальный коеффициент не найден');
    return 0;
  }
  if (actualCoefficient) {
    return parseFloat(actualCoefficient.textContent.trim().replace(',', '.'));
  }
  return parseFloat(initialCoefficient.textContent.trim().replace(',', '.'));
};

export const getParameterFromCoupon = (): number => {
  const [outcomeElement] = document.queryClassTemplateSelector(
    selectors.betslipOutcomeTitleClass
  );
  if (!outcomeElement) {
    HWL('Ошибка получения параметра: Не найдена роспись ставки');
    return NaN;
  }
  const outcome = outcomeElement.textContent.trim().replace(',', '.');
  if (outcome === 'К1' || outcome === 'К2') {
    // Фора 0
    HWL('Параметр ставки - 0 (Фора)');
    return 0;
  }
  const parameterRegex = /^.*\(([-+]?\d+(?:\.\d+)?)\)$/;
  const matches = outcome.match(parameterRegex);
  if (matches) {
    const parameter = parseFloat(matches[1]);
    HWL(`Параметр ставки - ${parameter}`);
    return parameter;
  }
  HWL(`Ставка без параметра (${outcome})`);
  return -6666;
};

export const getStakeInfo = (): string => {
  HWL('Получение инофрмации о ставке');
  worker.StakeInfo.Auth = checkLogin();
  worker.StakeInfo.StakeCount = getStakeCount();
  worker.StakeInfo.Balance = getBalance();
  worker.StakeInfo.MinSumm = getMinStake();
  worker.StakeInfo.MaxSumm = getMaxStake();
  worker.StakeInfo.Summ = getSumFromCoupon();
  if (worker.StakeInfo.StakeCount === 1) {
    worker.StakeInfo.IsEnebled = checkStakeEnebled();
    worker.StakeInfo.Coef = getCoefficientFromCoupon();
    worker.StakeInfo.Parametr = getParameterFromCoupon();
  }
  return JSON.stringify(worker.StakeInfo);
};
