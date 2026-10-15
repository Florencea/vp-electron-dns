import { Flex, Heading, Item, Picker, View } from "@adobe/react-spectrum";
import type { SupportedLocale, TranslationDictionary } from "../../shared/locales";
import { SupportedLocaleSchema } from "../../shared/locales";

interface HeaderBarProps {
  locale: SupportedLocale;
  onLocaleChange: (locale: SupportedLocale) => void;
  t: TranslationDictionary["ui"];
}

export const HeaderBar = ({ locale, onLocaleChange, t }: HeaderBarProps) => {
  return (
    <View paddingBottom="size-100">
      <Flex justifyContent="space-between" alignItems="center">
        <Heading level={2} margin={0}>
          {t.title}
        </Heading>
        <Picker
          aria-label={t.languageLabel}
          selectedKey={locale}
          onSelectionChange={(key) => {
            const parsed = SupportedLocaleSchema.safeParse(key);
            if (parsed.success) {
              onLocaleChange(parsed.data);
            }
          }}
        >
          <Item key="zh-TW">繁體中文</Item>
          <Item key="en-US">English</Item>
        </Picker>
      </Flex>
    </View>
  );
};
