export const Prices = [
    {
        _id: 0,
        name: "Rs 0 to 99",
        array: [0, 99],
    },
    {
        _id: 1,
        name: "Rs 100 to 299",
        array: [100, 299],
    },
    {
        _id: 2,
        name: "Rs 300 to 599",
        array: [300, 599],
    },
    {
        _id: 3,
        name: "Rs 600 to 999",
        array: [600, 999],
    },
    {
        _id: 4,
        name: "Rs 1000 to 1599",
        array: [1000, 1599],
    },
    {
        _id: 5,                  // ✅ was 4 (duplicate) — fixed to 5
        name: "Rs 1600 or more",
        array: [1600, 9999],
    },
];