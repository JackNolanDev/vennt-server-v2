interface CampaignSubscription {
  connectionId: string;
  accountId: string;
  sendMsg: (msg: string) => void;
}

const campaignSubscriptions: Record<string, CampaignSubscription[]> = {};

export const subscribeToCampaign = (
  params: CampaignSubscription & { campaignId: string }
) => {
  const { campaignId, ...subscription } = params;
  const foundList = campaignSubscriptions[campaignId];
  if (foundList) {
    foundList.push(subscription);
  } else {
    campaignSubscriptions[campaignId] = [subscription];
  }
};

export const unsubscribeFromCampaign = (
  campaignId: string,
  connectionId: string
) => {
  const foundList = campaignSubscriptions[campaignId];
  if (!foundList) {
    return;
  }
  if (foundList.length <= 1) {
    delete campaignSubscriptions[campaignId];
  } else {
    campaignSubscriptions[campaignId] = foundList.filter(
      (subscription) => subscription.connectionId !== connectionId
    );
  }
};

export const broadcastToCampaign = (campaignId: string, msg: string) => {
  campaignSubscriptions[campaignId]?.forEach(({ sendMsg }) => sendMsg(msg));
};

export const broadcastToCampaignAccounts = (
  campaignId: string,
  msg: string,
  accounts: string[]
) => {
  campaignSubscriptions[campaignId]
    ?.filter(({ accountId }) => accounts.includes(accountId))
    .forEach(({ sendMsg }) => sendMsg(msg));
};
