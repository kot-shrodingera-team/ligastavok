// Ищутся все элементы (тег указывается опционально), список классов которых содержит className в любом месте
// Далее проверяются конкретно классы, а именно чтобы был класс вида "className-<hex число из 6 цифр>""

interface Document {
  queryClassTemplateSelector: (className: string, tag?: string) => Element[];
}
interface Element {
  queryClassTemplateSelector: (className: string, tag?: string) => Element[];
}

type querySelectorFunction = (className: string, tag?: string) => Element[];

const queryClassTemplateSelectorGenerator = (): querySelectorFunction => {
  return function queryClassTemplateSelector(
    className: string,
    tag = ''
  ): Element[] {
    const query = `${tag}[class*="${className}"]`;
    const re = new RegExp(`^${className}(-[0-9a-f]{6})?$`);
    return [...(this as Document | Element).querySelectorAll(query)].filter(
      (element) => {
        return [...element.classList].some((elementClass) => {
          return re.test(elementClass);
        });
      }
    );
  };
};

Document.prototype.queryClassTemplateSelector = queryClassTemplateSelectorGenerator();
Element.prototype.queryClassTemplateSelector = queryClassTemplateSelectorGenerator();
