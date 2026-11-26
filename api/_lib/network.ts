import { BlockList, isIP } from "node:net";

/**
 * Rede da fundação: IPs ou faixas (CIDR) que entram sem senha.
 * Variável ALLOWED_IPS, separada por vírgula. Ex.: "200.100.50.10, 2804:abcd:1234::/48".
 * Vazia = ninguém entra sem senha.
 */
let cachedSource: string | null = null;
let cachedList: BlockList | null = null;

function normalizeIp(ip: string): string {
  const trimmed = ip.trim();
  // IPv4 representado como IPv6 (::ffff:1.2.3.4)
  const mapped = trimmed.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/i);
  return mapped ? mapped[1] : trimmed;
}

function buildList(source: string): BlockList {
  const list = new BlockList();
  for (const raw of source.split(",")) {
    const entry = raw.trim();
    if (!entry) continue;

    const [address, prefixRaw] = entry.split("/");
    const ip = normalizeIp(address);
    const family = isIP(ip);
    if (!family) {
      console.error(`[api] ALLOWED_IPS: entrada ignorada (não é IP): ${entry}`);
      continue;
    }
    const type = family === 4 ? "ipv4" : "ipv6";

    if (prefixRaw === undefined) {
      list.addAddress(ip, type);
      continue;
    }
    const prefix = Number(prefixRaw);
    const max = family === 4 ? 32 : 128;
    // Faixas muito largas abririam o site para meia internet; exige pelo menos /16 (IPv4) ou /32 (IPv6).
    const min = family === 4 ? 16 : 32;
    if (!Number.isInteger(prefix) || prefix < min || prefix > max) {
      console.error(`[api] ALLOWED_IPS: faixa ignorada (prefixo inválido ou largo demais): ${entry}`);
      continue;
    }
    list.addSubnet(ip, prefix, type);
  }
  return list;
}

export function isAllowedNetwork(ip: string): boolean {
  const source = process.env.ALLOWED_IPS?.trim() ?? "";
  if (!source) return false;

  if (source !== cachedSource) {
    cachedSource = source;
    cachedList = buildList(source);
  }

  const normalized = normalizeIp(ip);
  const family = isIP(normalized);
  if (!family || !cachedList) return false;
  return cachedList.check(normalized, family === 4 ? "ipv4" : "ipv6");
}
