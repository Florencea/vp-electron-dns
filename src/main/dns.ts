import { Resolver } from "node:dns/promises";
import { isIPv4, isIPv6 } from "node:net";
import { URL } from "node:url";
import { z } from "zod";
import { SERVERS } from "../shared/servers";
import type { DnsQueryT, ServerT } from "../shared/types";
import { DnsQuerySchema, ServerSchema } from "../shared/types";

export type { DnsQueryT };

const AnsSchema = z.object({
  Status: z.number().optional(),
  Answer: z
    .array(z.object({ type: z.number(), data: z.string(), TTL: z.number().optional() }))
    .optional(),
  Comment: z.string().optional(),
  nameServer: z.string().optional(),
});

const resolverPool = new Map<string, Resolver>();

function getResolver(ip: string): Resolver {
  const cached = resolverPool.get(ip);
  if (cached !== undefined) {
    return cached;
  }
  const resolver = new Resolver({ timeout: 2500, tries: 1 });
  if (ip !== "-") {
    try {
      resolver.setServers([ip]);
    } catch {
      // Gracefully ignore invalid IP formats and keep system resolver
    }
  }
  resolverPool.set(ip, resolver);
  return resolver;
}

export const fetchDns = async (query: DnsQueryT): Promise<string> => {
  try {
    const valid = DnsQuerySchema.safeParse(query);
    if (!valid.success || valid.data.server === "-") {
      return "";
    }
    const { server, name, type } = valid.data;
    const url = new URL(server);
    url.searchParams.set("name", name);
    url.searchParams.set("type", type);

    const t0 = performance.now();
    const res = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/dns-json",
      },
      signal: AbortSignal.timeout(3000),
    });
    const t1 = performance.now();

    if (!res.ok) {
      return "";
    }
    const json: unknown = await res.json();
    const parsed = AnsSchema.safeParse(json);
    if (!parsed.success) {
      return "";
    }
    const answer = parsed.data.Answer;
    if (answer === undefined) {
      return "";
    }
    const data = [
      `${type === "A" ? "ipv4: " : "\nipv6: "}${(t1 - t0).toFixed(2)}ms`,
      ...answer.map((d) => d.data).filter((ip) => (type === "A" ? isIPv4(ip) : isIPv6(ip))),
    ].join("\n");
    return data;
  } catch {
    return "";
  }
};

export const resolveDns = async (query: DnsQueryT): Promise<string> => {
  try {
    const valid = DnsQuerySchema.safeParse(query);
    if (!valid.success) {
      return "";
    }
    const { ip, name, type } = valid.data;
    const resolver = getResolver(ip);

    if (type === "A") {
      const t0 = performance.now();
      const address = await resolver.resolve4(name);
      const t1 = performance.now();
      return [`ipv4: ${(t1 - t0).toFixed(2)}ms`, ...address].join("\n");
    } else {
      const t0 = performance.now();
      const address = await resolver.resolve6(name);
      const t1 = performance.now();
      return [`\nipv6: ${(t1 - t0).toFixed(2)}ms`, ...address].join("\n");
    }
  } catch {
    return "";
  }
};

const HostQuerySchema = z.object({
  type: z.enum(["A", "AAAA"]),
  name: z.string().trim().min(1),
  servers: z.array(ServerSchema).default(SERVERS),
});

export const fetchHost = (
  _event: unknown,
  rawType: unknown,
  rawName: unknown,
  rawServers: unknown = SERVERS,
): Promise<string[]> => {
  const parsed = HostQuerySchema.safeParse({ type: rawType, name: rawName, servers: rawServers });
  if (!parsed.success) {
    return Promise.resolve([]);
  }
  const { type, name, servers } = parsed.data;
  return Promise.all(
    servers.map(({ server, ip }: ServerT) => fetchDns({ server, name, type, ip })),
  );
};

export const resolveHost = (
  _event: unknown,
  rawType: unknown,
  rawName: unknown,
  rawServers: unknown = SERVERS,
): Promise<string[]> => {
  const parsed = HostQuerySchema.safeParse({ type: rawType, name: rawName, servers: rawServers });
  if (!parsed.success) {
    return Promise.resolve([]);
  }
  const { type, name, servers } = parsed.data;
  return Promise.all(
    servers.map(({ server, ip }: ServerT) => resolveDns({ server, name, type, ip })),
  );
};
