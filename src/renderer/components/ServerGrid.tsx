import { Grid, View, minmax, repeat } from "@adobe/react-spectrum";
import type { TranslationDictionary } from "../../shared/locales";
import type { ModeT, ServerT } from "../../shared/types";
import { ServerCard } from "./ServerCard";

interface ServerGridProps {
  servers: ServerT[];
  mode: ModeT;
  ipv4Data?: string[] | undefined;
  ipv6Data?: string[] | undefined;
  t: TranslationDictionary["ui"];
}

export const ServerGrid = ({ servers, mode, ipv4Data, ipv6Data, t }: ServerGridProps) => {
  const filteredWithIndex = servers
    .map((server, originalIndex) => ({ server, originalIndex }))
    .filter(({ server }) => (mode === "dns" ? true : server.server !== "-"));

  return (
    <View paddingBottom="size-200">
      <Grid columns={repeat("auto-fill", minmax("300px", "1fr"))} gap="size-200">
        {filteredWithIndex.map(({ server, originalIndex }) => {
          const ipv4Result = ipv4Data?.[originalIndex] ?? "";
          const ipv6Result = ipv6Data?.[originalIndex] ?? "";
          const resultText = ipv4Data
            ? [ipv4Result, ipv6Result].filter((line) => line.length > 0).join("\n")
            : "";

          return <ServerCard key={server.title} server={server} result={resultText} t={t} />;
        })}
      </Grid>
    </View>
  );
};
