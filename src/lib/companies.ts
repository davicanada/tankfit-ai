import registry from "../../data/companies/companies.json";

export function getCompany(id: string) {
  const company = registry.companies.find((c) => c.id === id);
  if (!company) throw new Error("Unknown fictional company.");
  return company;
}

export const tankroy = getCompany("tankroy-systems");
