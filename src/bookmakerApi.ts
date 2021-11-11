declare global {
  // interface GermesData {}

  interface Bet {
    id: string;
    eventId: string;
  }

  interface BetslipProps {
    bets: Bet[];
  }

  interface BetslipReactInstanse {
    return: {
      memoizedProps: BetslipProps;
    };
  }

  interface RootReactInstanse {
    return: {
      pendingProps: {
        value: {
          store: {
            dispatch: (data: Record<string, unknown>) => unknown;
          };
        };
      };
    };
  }

  interface BetObject {
    eventComment: string;
    eventId: string;
    eventType: string;
    facId: string;
    eventGameId: string;
    partTitle: string;
    id: string;
    locked: string;
    marketId: string;
    marketType: string;
    title: string;
    value: string;
    outcomeKey: string;
    partName: string;
    eventTeam: string;
    topicId: string;
    marketTitle: string;
    adValue: string;
  }

  // interface EventData {
  //   outcomesTypes: string[];
  //   // eslint-disable-next-line @typescript-eslint/no-explicit-any
  //   [key: string]: // outcomeType
  //   | Array<{
  //         [key: string]: Array<{
  //           // outcomesTypeMarket
  //           [key: string]: Array<{
  //             id: string;
  //           }>;
  //         }>;
  //       }>
  //     | string[];
  // }
}

export const clearGermesData = (): void => {
  window.germesData = {
    bookmakerName: 'Liga Stavok',
    minimumStake: undefined,
    maximumStake: undefined,
    doStakeTime: undefined,
    betProcessingStep: undefined,
    betProcessingAdditionalInfo: undefined,
    betProcessingTimeout: 50000,
    stakeDisabled: undefined,
    stopBetProcessing: () => {
      window.germesData.betProcessingStep = 'error';
      window.germesData.stakeDisabled = true;
    },
    updateManualDataIntervalId: undefined,
    stopUpdateManualData: undefined,
    manualMaximumStake: undefined,
    manualCoefficient: undefined,
    manualParameter: undefined,
    manualStakeEnabled: undefined,
  };
};

export default {};
