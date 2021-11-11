const findOutcome = (eventData: Record<string, unknown>): BetObject => {
  const outcomesTypes = Object.entries(eventData)
    .filter(([key]) => (eventData.outcomesTypes as string[]).includes(key))
    .map(([, value]) => value);

  const outcomesTypeMarkets = outcomesTypes
    .map((market) => {
      return Object.values(market);
    })
    .flat(1);

  const outcomes = outcomesTypeMarkets.reduce(
    (accumulator: [], market: { outcomes: Record<string, never> }) => {
      return accumulator.concat(Object.values(market.outcomes));
    },
    []
  ) as BetObject[];

  const outcome = outcomes.find(
    (element) => String(element.id) === worker.BetId
  );
  return outcome;
};

export default findOutcome;
