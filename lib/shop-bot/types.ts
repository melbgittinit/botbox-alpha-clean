export type ShopBotSpecialist =
  | "FIND_IT_BOT"
  | "COMPARE_BOT"
  | "DEAL_BOT"
  | "GIFT_BOT"
  | "BUSINESS_BUYER_BOT";

export type ShopBotMissionResult = {
  missionId: string;
  createdAt: string;
  request: string;
  specialist: ShopBotSpecialist;
  specialistLabel: string;
  reason: string;
  budget?: number;
  nextQuestion: string;
  authority: {
    level: "LEVEL_1_RECOMMEND";
    humanApprovalRequired: true;
    paymentAuthority: false;
    delegatedSpendingAuthority: false;
    voiceAgentEnabled: false;
  };
  returnPreventionChecks: string[];
  fraudAndTrustChecks: string[];
  safety: {
    safeToProceed: boolean;
    flags: string[];
  };
  trustReceipt: {
    affiliateStatus: "NOT_EVALUATED";
    sponsoredStatus: "NONE";
    transactionStatus: "NO_TRANSACTION";
    preventableReturnGoal: "ZERO_PREVENTABLE_RETURNS";
  };
};
