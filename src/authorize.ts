import { setReactInputValue } from '@kot-shrodingera-team/config/reactUtils';
import { getElement, awaiter, sleep } from '@kot-shrodingera-team/config//util';
import { checkLogin, getBalance } from './callbacks/getStakeInfo';
import * as selectors from './selectors';

const HWL = worker.Helper.WriteLine;

const updateBalance = (): void => worker.JSBalanceChange(getBalance());

const authorize = async (): Promise<void> => {
  HWL('Проверка авторизации');
  worker.Islogin = checkLogin();
  worker.JSLogined();
  if (worker.Islogin) {
    updateBalance();
    HWL('Есть авторизация');
    return;
  }

  const authFormButton = (await getElement(
    selectors.authFormButtonSelector
  )) as HTMLElement;
  if (!authFormButton) {
    HWL('Ошибка авторизации: Не найдена кнопка открытия формы авторизации');
    return;
  }

  HWL('Нажимаем на кнопку входа');
  authFormButton.click();

  const authForm = await getElement(selectors.authFormSelector);
  if (!authForm) {
    HWL('Ошибка авторизации: Не найдена форма авторизации');
    return;
  }

  if (!worker.Login.includes('@')) {
    HWL('Переключаем на авторизацию по телефону');
    const authFormTabs = [
      ...document.querySelectorAll(selectors.authFormTabSelector),
    ];
    if (!authFormTabs) {
      HWL('Ошибка авторизации: Не найдены кнопки переключения типа логина');
      return;
    }
    const phoneTab = authFormTabs.find(
      (tab) => tab.textContent.trim() === 'Номер телефона'
    ) as HTMLElement;
    if (!phoneTab) {
      HWL(
        'Ошибка авторизации: Не найдена кнопка переключения на авторизацию по телефону'
      );
      return;
    }
    const phoneTabActive = [...phoneTab.classList].some((className) =>
      className.startsWith(selectors.authFormActiveTabSelector)
    );
    if (!phoneTabActive) {
      HWL('Уже переключено на авторизацию по телефону');
    } else {
      phoneTab.click();
      const loginInput = document.querySelector(
        selectors.authFormPhoneInputSelector
      );
      if (!loginInput) {
        HWL('Ошибка авторизации: Не найдено поле ввода телефона');
        return;
      }
      const phoneRegex = /^(?:\+|\+7)?(\d{10})$/;
      const match = worker.Login.match(phoneRegex);
      if (!match) {
        HWL(`Ошибка авторизации: Неверный формат телефона - ${worker.Login}`);
        return;
      }
      setReactInputValue(loginInput, match[1]);
    }
  } else {
    // Нет проверки вкладки, при переоткрытии всегда открывается вход по email
    const loginInput = document.querySelector(
      selectors.authFormEmailInputSelector
    );
    if (!loginInput) {
      HWL('Ошибка авторизации: Не найдено поле ввода почты');
      return;
    }
    setReactInputValue(loginInput, worker.Login);
  }

  const passwordInput = document.querySelector(
    selectors.authFormPasswordInputSelector
  );
  setReactInputValue(passwordInput, worker.Password);

  const submitButton = document.querySelector(
    selectors.authFormSubmitButtonSelector
  ) as HTMLButtonElement;
  if (!submitButton) {
    HWL('Ошибка авторизации: Не найдена кнопка входа');
    return;
  }
  if (submitButton.disabled) {
    HWL('Ошибка авторизации: Кнопка входа недоступна');
    return;
  }
  submitButton.click();

  const authorizing = (): boolean => {
    // eslint-disable-next-line no-shadow
    const submitButton = document.querySelector(
      selectors.authFormSubmitButtonSelector
    ) as HTMLButtonElement;
    if (!submitButton) {
      return false;
    }
    return Boolean(
      submitButton.querySelector(
        selectors.authFormSubmitButtonSircleLoaderSelector
      )
    );
  };

  // Нажимаем кнопку авторизации до пяти раз с интервалом в 3 секунды
  const authTryInterval = 3000;

  const successfulAuth = (): void => {
    HWL('Успешно авторизовались');
    worker.Islogin = true;
    worker.JSLogined();
    updateBalance();
  };

  /* eslint-disable no-await-in-loop */
  for (let i = 0; i < 5; i += 1) {
    submitButton.click();

    // Если уже есть авторизация или кнопка в состоянии "обработки"
    await awaiter(() => checkLogin() || authorizing(), 3000, 50);

    if (checkLogin()) {
      successfulAuth();
      return;
    }

    if (authorizing()) {
      const authTimeout = 10;
      HWL('Авторизация в процессе');
      await awaiter(checkLogin, authTimeout * 1000, 50);

      if (checkLogin()) {
        successfulAuth();
        return;
      }
      if (authorizing()) {
        HWL(
          `Ошибка авторизации: Авторизация длится более ${authTimeout} секунд`
        );
        return;
      }
      HWL('Ошибка авторизации: Не удалось авторизоваться');
      return;
    }
    HWL('Ошибка авторизации: Не удалось авторизоваться');

    await sleep(authTryInterval);
  }
};

export default authorize;
