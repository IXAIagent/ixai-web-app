export type LineConfigState = {
  channelAccessTokenConfigured: boolean;
  channelIdConfigured: boolean;
  channelSecretConfigured: boolean;
  connectReady: boolean;
  fullyConfigured: boolean;
  linkSecretConfigured: boolean;
  liffId: string | null;
  liffReady: boolean;
  loginChannelIdConfigured: boolean;
  loginChannelSecretConfigured: boolean;
  loginReady: boolean;
  loginRedirectUri: string;
  loginRedirectUriConfigured: boolean;
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
  const liffId = clean(process.env.NEXT_PUBLIC_LINE_LIFF_ID);
  const loginChannelId = clean(process.env.LINE_LOGIN_CHANNEL_ID) ?? channelId;
  const loginChannelSecret = clean(process.env.LINE_LOGIN_CHANNEL_SECRET) ?? channelSecret;
  const siteUrl =
    clean(process.env.NEXT_PUBLIC_SITE_URL)?.replace(/\/$/, "") ?? "https://app.ixuan.ai";
  const loginRedirectUri =
    clean(process.env.LINE_LOGIN_REDIRECT_URI) ?? `${siteUrl}/api/line/callback`;
  const messagingReady = Boolean(channelAccessToken);
  const oauthReady = Boolean(channelId && channelSecret);
  const loginReady = Boolean(loginChannelId && loginChannelSecret && loginRedirectUri);
  const connectReady = Boolean(linkSecret || officialAccountUrl || oauthReady);

  return {
    channelAccessTokenConfigured: Boolean(channelAccessToken),
    channelIdConfigured: Boolean(channelId),
    channelSecretConfigured: Boolean(channelSecret),
    connectReady,
    fullyConfigured: Boolean(
      oauthReady && loginReady && channelAccessToken && officialAccountUrl && linkSecret && liffId,
    ),
    linkSecretConfigured: Boolean(linkSecret),
    liffId,
    liffReady: Boolean(liffId),
    loginChannelIdConfigured: Boolean(loginChannelId),
    loginChannelSecretConfigured: Boolean(loginChannelSecret),
    loginReady,
    loginRedirectUri,
    loginRedirectUriConfigured: Boolean(clean(process.env.LINE_LOGIN_REDIRECT_URI)),
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

export function getLineLoginSecrets() {
  const channelId = clean(process.env.LINE_LOGIN_CHANNEL_ID) ?? clean(process.env.LINE_CHANNEL_ID);
  const channelSecret =
    clean(process.env.LINE_LOGIN_CHANNEL_SECRET) ?? clean(process.env.LINE_CHANNEL_SECRET);
  return {
    channelId,
    channelSecret,
    redirectUri: getLineConfigState().loginRedirectUri,
  };
}
