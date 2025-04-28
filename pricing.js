// pricing.js
export const pricingData = [
  {
    garment: "T-shirt G6400",
    basePrice: 5.3,
    design: {
      "Single Press": {
        "1-11": 6,
        "12-24": 5,
        "25-48": 4,
        "49+": 3.5
      }
    },
    transfer: {
      "12x5.4": 0.6875
    }
  },
  {
    garment: "Pocket Tee G230",
    basePrice: 7.2,
    design: {
      "Double Side": {
        "1-11": 7,
        "12-24": 5.5,
        "25-48": 4.5,
        "49+": 3.75
      }
    },
    transfer: {
      "12x22": 2.75
    }
  }
  // …add any other garments here in the same format…
];
