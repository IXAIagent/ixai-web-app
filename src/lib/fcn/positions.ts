import type { FcnPosition } from "@/src/types/fcn";

function monthlySchedule(startMonth: string, count: number) {
  const [year, month] = startMonth.split("-").map(Number);

  return Array.from({ length: count }, (_, index) => {
    const date = new Date(Date.UTC(year, month - 1 + index, 20));
    const isoDate = date.toISOString().slice(0, 10);
    const paymentDate = new Date(Date.UTC(year, month - 1 + index, 27))
      .toISOString()
      .slice(0, 10);

    return {
      periodLabel: `Obs ${index + 1}`,
      observationStart: isoDate,
      observationEnd: isoDate,
      couponPaymentDate: paymentDate,
    };
  });
}

export const demoFcnPositions: FcnPosition[] = [
  {
    id: "fcn219m",
    name: "FCN219M",
    owner: "Demo Pro Monitor",
    currency: "USD",
    strikePercent: 95,
    knockInPercent: 65,
    knockOutPercent: 100,
    status: "atRisk",
    underlyings: [
      {
        symbol: "MDB",
        name: "MongoDB",
        initialPrice: 406.61,
        strikePrice: 386.28,
        knockInPrice: 264.3,
        knockOutPrice: 406.61,
      },
      {
        symbol: "AFRM",
        name: "Affirm",
        initialPrice: 78,
        strikePrice: 74.1,
        knockInPrice: 50.7,
        knockOutPrice: 78,
      },
      {
        symbol: "MRVL",
        name: "Marvell",
        initialPrice: 91.2,
        strikePrice: 86.64,
        knockInPrice: 59.28,
        knockOutPrice: 91.2,
      },
      {
        symbol: "TSLA",
        name: "Tesla",
        initialPrice: 400,
        strikePrice: 380,
        knockInPrice: 260,
        knockOutPrice: 400,
      },
    ],
    observationSchedule: monthlySchedule("2026-05", 6),
  },
  {
    id: "fcn717n",
    name: "FCN717N",
    owner: "Demo Pro Monitor",
    currency: "USD",
    strikePercent: 95,
    knockInPercent: 60,
    knockOutPercent: 100,
    status: "active",
    underlyings: [
      {
        symbol: "AVGO",
        name: "Broadcom",
        initialPrice: 235,
        strikePrice: 223.25,
        knockInPrice: 141,
        knockOutPrice: 235,
      },
      {
        symbol: "PLTR",
        name: "Palantir",
        initialPrice: 128,
        strikePrice: 121.6,
        knockInPrice: 76.8,
        knockOutPrice: 128,
      },
      {
        symbol: "MSFT",
        name: "Microsoft",
        initialPrice: 512,
        strikePrice: 486.4,
        knockInPrice: 307.2,
        knockOutPrice: 512,
      },
    ],
    observationSchedule: monthlySchedule("2026-06", 6),
  },
  {
    id: "fcn715n",
    name: "FCN715N",
    owner: "Demo Pro Monitor",
    currency: "USD",
    strikePercent: 95,
    knockInPercent: 65,
    knockOutPercent: 100,
    status: "active",
    underlyings: [
      {
        symbol: "ORCL",
        name: "Oracle",
        initialPrice: 162,
        strikePrice: 153.9,
        knockInPrice: 105.3,
        knockOutPrice: 162,
      },
      {
        symbol: "AVGO",
        name: "Broadcom",
        initialPrice: 235,
        strikePrice: 223.25,
        knockInPrice: 152.75,
        knockOutPrice: 235,
      },
      {
        symbol: "PLTR",
        name: "Palantir",
        initialPrice: 128,
        strikePrice: 121.6,
        knockInPrice: 83.2,
        knockOutPrice: 128,
      },
    ],
    observationSchedule: monthlySchedule("2026-05", 6),
  },
];

export function getDemoFcnPositions() {
  return demoFcnPositions;
}
