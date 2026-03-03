import { describe, expect, it, vi } from "vitest";

vi.mock("./probe.js", () => ({
  probeFeishu: vi.fn(async () => ({ ok: false, error: "mocked" })),
}));

import { feishuOnboardingAdapter } from "./onboarding.js";

describe("feishuOnboardingAdapter.configure", () => {
  it("does not throw when config appId/appSecret are SecretRef objects", async () => {
    const text = vi
      .fn()
      .mockResolvedValueOnce("cli_from_prompt")
      .mockResolvedValueOnce("secret_from_prompt")
      .mockResolvedValueOnce("oc_group_1");

    const prompter = {
      note: vi.fn(async () => undefined),
      text,
      confirm: vi.fn(async () => true),
      select: vi.fn(
        async ({ initialValue }: { initialValue?: string }) => initialValue ?? "allowlist",
      ),
    } as never;

    await expect(
      feishuOnboardingAdapter.configure({
        cfg: {
          channels: {
            feishu: {
              appId: { source: "env", id: "FEISHU_APP_ID", provider: "default" },
              appSecret: { source: "env", id: "FEISHU_APP_SECRET", provider: "default" },
            },
          },
        } as never,
        prompter,
      }),
    ).resolves.toBeTruthy();
  });
});

describe("feishuOnboardingAdapter.getStatus", () => {
  it("does not fallback to top-level appId when account explicitly sets empty appId", async () => {
    const status = await feishuOnboardingAdapter.getStatus({
      cfg: {
        channels: {
          feishu: {
            appId: "top_level_app",
            accounts: {
              main: {
                appId: "",
                appSecret: "secret_123",
              },
            },
          },
        },
      } as never,
    });

    expect(status.configured).toBe(false);
  });
});
