import {
  buildStaySearchQuery,
  formatStayNightPrice,
  stayCityLabel,
  stayNightAmount,
  unwrapStayList,
  type StayListing,
} from "../../services/stayListings";

describe("stayListings", () => {
  it("formats the nightly price with the listing currency from Django", () => {
    expect(formatStayNightPrice("10125.00", "KES")).toBe("10125.00 KES / night");
    expect(formatStayNightPrice(1323, "ZMW")).toBe("1323.00 ZMW / night");
    expect(formatStayNightPrice(7500, "eur")).toBe("7500.00 EUR / night");
  });

  it("does not assume a fallback currency when Django omits one", () => {
    expect(formatStayNightPrice(35000, undefined)).toBe("35000.00 / night");
    expect(formatStayNightPrice(undefined, "KES")).toBe("");
  });

  it("reads city and nightly amount from the property serializer shape", () => {
    const listing: StayListing = {
      id: 9,
      title: "[Seed] Stay Guest_House Mombasa Old Town",
      city: "Mombasa",
      currency: "KES",
      price: "7500.00",
      stay_settings_summary: { price_per_night: "10125.00" },
    };
    expect(stayCityLabel(listing)).toBe("Mombasa");
    expect(stayNightAmount(listing)).toBe("10125.00");
  });

  it("unwraps paginated Django results", () => {
    expect(unwrapStayList({ results: [{ id: 1, title: "Stay A" }] })).toHaveLength(1);
    expect(unwrapStayList([{ id: 2, title: "Stay B" }])).toHaveLength(1);
    expect(unwrapStayList(null)).toEqual([]);
  });

  it("sends stay filters and GPS as Django query parameters", () => {
    const query = buildStaySearchQuery({
      countryCode: "KE",
      cityId: "12",
      districtId: "4",
      minPrice: "1000",
      maxPrice: "20000",
      propertyType: "guest_house",
      latitude: -4.0435,
      longitude: 39.6682,
    });
    expect(query.get("purpose")).toBe("stay");
    expect(query.get("country")).toBe("KE");
    expect(query.get("city")).toBe("12");
    expect(query.get("district")).toBe("4");
    expect(query.get("min_price")).toBe("1000");
    expect(query.get("latitude")).toBe("-4.0435");
    expect(query.get("longitude")).toBe("39.6682");
  });
});
