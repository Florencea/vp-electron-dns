import { Flex, Provider, View, defaultTheme } from "@adobe/react-spectrum";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { getTranslations } from "../shared/locales";
import type { ModeT } from "../shared/types";
import { HeaderBar } from "./components/HeaderBar";
import { QueryForm } from "./components/QueryForm";
import { ServerGrid } from "./components/ServerGrid";
import { useLocale } from "./hooks/useLocale";

export const App = () => {
  const [mode, setMode] = useState<ModeT>("dns");
  const [locale, handleLocaleChange] = useLocale();

  const ipv4 = useMutation({
    mutationFn: async (name: string) => window.api.queryIpv4(mode, name),
  });

  const ipv6 = useMutation({
    mutationFn: async (name: string) => window.api.queryIpv6(mode, name),
  });

  const isLoading = ipv4.isPending || ipv6.isPending;
  const t = getTranslations(locale);

  const handleSubmit = async (host: string) => {
    await ipv4.mutateAsync(host);
    await ipv6.mutateAsync(host);
  };

  const handleReset = async () => {
    await ipv4.mutateAsync("");
    await ipv6.mutateAsync("");
  };

  const handleModeChange = async (newMode: ModeT) => {
    setMode(newMode);
    await ipv4.mutateAsync("");
    await ipv6.mutateAsync("");
  };

  return (
    <Provider locale={locale} theme={defaultTheme} UNSAFE_className="h-svh overflow-y-scroll">
      <View padding="size-200" paddingTop="size-200">
        <Flex direction="column" gap="size-100">
          <HeaderBar locale={locale} onLocaleChange={handleLocaleChange} t={t.ui} />
          <QueryForm
            mode={mode}
            onModeChange={handleModeChange}
            onSubmit={handleSubmit}
            onReset={handleReset}
            isLoading={isLoading}
            t={t.ui}
          />
          <ServerGrid
            servers={window.api?.servers ?? []}
            mode={mode}
            ipv4Data={ipv4.data}
            ipv6Data={ipv6.data}
            t={t.ui}
          />
        </Flex>
      </View>
    </Provider>
  );
};
