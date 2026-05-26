export type LineConfigState = {
  channelAccessTokenConfigured: boolean;
  channelIdConfigured: boolean;
  channelSecretConfigured: boolean;
  connectReady: boolean;
  fullyConfigured: boolean;
  linkSecretConfigured: boolean;
  messagingReady: boolean;
  officialAccountUrl: string | null;
  officialAccountUrlConfigured: boolean;
};

function clean(value: string | undefined) {
  const trimmed = value?.trim();
  return trimmed || null;
}

export function getLineConfigState(): LineConfigState {
  const channelId = clean(process.env.LINE_CHANNEL_ID);
  const channelSecret = clean(process.env.LINE_CHANNEL_SECRET);
  const channelAccessToken = clean(process.env.LINE_CHANNEL_ACCESS_TOKEN);
  const officialAccountUrl = clean(process.env.NEXT_PUBLIC_LINE_OA_URL);
  const linkSecret = clean(process.env.IXAI_LINE_LINK_SECRET);
  const messagingReady = Boolean(channelAccessToken);
  const oauthReady = Boolean(channelId && channelSecret);
  const connectReady = Boolean(linkSecret || officialAccountUrl || oauthReady);

  return {
    channelAccessTokenConfigured: Boolean(channelAccessToken),
    channelIdConfigured: Boolean(channelId),
    channelSecretConfigured: Boolean(channelSecret),
    connectReady,
    fullyConfigured: Boolean(oauthReady && channelAccessToken && officialAccountUrl && linkSecret),
    linkSecretConfigured: Boolean(linkSecret),
    messagingReady,
    officialAccountUrl,
    officialAccountUrlConfigured: Boolean(officialAccountUrl),
  };
}

export function isLineConfigured() {
  return getLineConfigState().connectReady;
}

export function getLineLinkSecret() {
  return clean(process.env.IXAI_LINE_LINK_SECRET);
}
