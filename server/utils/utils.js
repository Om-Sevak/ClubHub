
exports.getRandomElements = (list, number) => {
    const shuffled = list.sort(() => 0.5 - Math.random());
    return selected = shuffled.slice(0, number);
}