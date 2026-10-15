import {
  Content,
  ContextualHelp,
  Divider,
  Flex,
  Header,
  Heading,
  LabeledValue,
  Link,
  Text,
  Well,
} from "@adobe/react-spectrum";
import type { TranslationDictionary } from "../../shared/locales";
import type { ServerT } from "../../shared/types";

interface ServerCardProps {
  server: ServerT;
  result: string;
  t: TranslationDictionary["ui"];
}

export const ServerCard = ({ server, result, t }: ServerCardProps) => {
  const { title, server: dohEndpoint, ip, description, document } = server;

  return (
    <Well flexShrink={0} role="region" aria-labelledby={title}>
      <Header>
        <Flex justifyContent="space-between">
          <Heading level={1} id={title}>
            {title}
          </Heading>
          <ContextualHelp variant="info">
            <Heading>{title}</Heading>
            <Content>
              <Flex direction="column" gap="size-200">
                <Text>{description}</Text>
                {document !== "-" && (
                  <Link href={document} target="_blank" rel="noreferer">
                    {t.documentLink}
                  </Link>
                )}
                {ip !== "-" && <LabeledValue label={t.dnsLabel} value={ip} />}
                {dohEndpoint !== "-" && <LabeledValue label={t.dohLabel} value={dohEndpoint} />}
              </Flex>
            </Content>
          </ContextualHelp>
        </Flex>
      </Header>
      <Divider marginY="size-100" size="S" />
      <Content>
        <code className="whitespace-pre-wrap">{result}</code>
      </Content>
    </Well>
  );
};
