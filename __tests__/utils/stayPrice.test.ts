import { formatStayNightPrice, stayCityName } from "../../utils/stayPrice";

describe("formatStayNightPrice", () => {
  it("uses the backend currency code instead of a hardcoded KES", () => {
    expect(formatStayNightPrice("10125.00", "KES")).toBe("10125.00 KES / night");
    expect(formatStayNightPrice(1323, "zmw")).toBe("1323.00 ZMW / night");
    expect(formatStayNightPrice("7500", "AOA", "night")).toBe("7500.00 AOA / night");
  });

  it("omits currency when Django does not send one", () => {
    expect(formatStayNightPrice(95, "")).toBe("95.00 / night");
  });
});

describe("stayCityName", () => {
  it("prefers the Django city string", () => {
    expect(stayCityName({ city: "Mombasa" })).toBe("Mombasa");
    expect(stayCityName({ city: { name: "Lusaka" } })).toBe("Lusaka");
    expect(stayCityName({ location: { city: { name: "Lisbon" } } })).toBe("Lisbon");
  });
});
