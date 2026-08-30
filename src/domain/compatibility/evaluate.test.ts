import { describe, expect, it } from "vitest";
import { catalog } from "@/lib/catalog";
import { evaluateCompatibility } from "./evaluate";
import { scenarioPresets } from "./presets";

const airFlame = scenarioPresets[0].requirements;

describe("evaluateCompatibility", () => {
  it("recommends FL-100 for the default AirFlame requirements", () => {
    const result = evaluateCompatibility(catalog.products, airFlame);

    expect(result.status).toBe("compatible");
    expect(result.primaryRecommendation?.product.id).toBe("TR-FL100");
  });

  it("returns the same recommendation for equivalent custom requirements", () => {
    const customRequirements = { ...airFlame };
    const result = evaluateCompatibility(catalog.products, customRequirements);

    expect(result.primaryRecommendation?.product.id).toBe("TR-FL100");
  });

  it("requires review when an underground tank has no complete match", () => {
    const result = evaluateCompatibility(catalog.products, {
      ...airFlame,
      tankType: "underground_vented",
    });

    expect(result.status).toBe("technical_review_required");
    expect(result.primaryRecommendation).toBeNull();
  });

  it("does not recommend a direct cellular product without connectivity", () => {
    const result = evaluateCompatibility(catalog.products, {
      ...airFlame,
      connectivity: "unavailable",
    });

    expect(result.status).toBe("technical_review_required");
    expect(result.primaryRecommendation).toBeNull();
  });

  it("requires review for an unknown float-gauge interface", () => {
    const result = evaluateCompatibility(catalog.products, {
      ...airFlame,
      gaugeInterface: "unknown",
    });

    expect(result.status).toBe("technical_review_required");
    expect(result.reasons).toContain("gauge_interface_confirmation_required");
  });

  it("returns out of scope for an unsupported material", () => {
    const result = evaluateCompatibility(catalog.products, {
      ...airFlame,
      material: "unsupported",
    });

    expect(result.status).toBe("out_of_scope");
  });

  it.each([
    ["AgricuFlow Cooperative", "TR-RS200"],
    ["Boreal Beverage Group", "TR-GW420"],
  ])("evaluates the %s preset through the same rules", (company, productId) => {
    const preset = scenarioPresets.find((item) => item.company === company);
    const result = evaluateCompatibility(catalog.products, preset!.requirements);

    expect(result.status).toBe("compatible");
    expect(result.primaryRecommendation?.product.id).toBe(productId);
  });

  it.each([
    ["propane", "above_ground_pressurized_horizontal", "supported_remote_ready_propane_gauge", "existing_propane_gauge_interface", "TR-PL500", "technical_review_required"],
    ["heating_oil", "above_ground_horizontal", "mechanical_float_gauge", "existing_float_gauge_interface", "TR-FL100", "compatible"],
    ["refined_fuels", "above_ground_vertical", "none_required", "non_contact_radar", "TR-RS200", "compatible"],
    ["lubricants", "above_ground_vertical", "none_required", "non_contact_radar", "TR-RS200", "compatible"],
    ["water", "above_ground_vertical", "none_required", "hydrostatic_pressure", "TR-HS300", "compatible"],
    ["industrial_gases", "upright_cylinder", "none_required", "load_cell_weight", "TR-GW400", "compatible"],
  ] as const)(
    "covers the %s material and its expected measurement method",
    (material, tankType, instrumentation, measurementPreference, productId, status) => {
      const result = evaluateCompatibility(catalog.products, {
        material,
        tankType,
        existingInstrumentation: instrumentation,
        gaugeInterface:
          measurementPreference === "existing_float_gauge_interface"
            ? "confirmed_compatible"
            : "not_applicable",
        connectivity: "lte_m",
        siteDistribution: "single_site",
        measurementPreference,
        regulatedLocation: false,
      });

      expect(result.status).toBe(status);
      expect(result.primaryRecommendation?.product.id).toBe(productId);
    },
  );
});
