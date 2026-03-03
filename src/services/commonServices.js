const get_so_financial_year = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + 1;
    let first_year, second_year;

    if (month <= 3) {
        first_year = String(year - 1).slice(-2);
        second_year = String(year).slice(-2);
    } else {
        first_year = String(year).slice(-2);
        second_year = String(year + 1).slice(-2);
    }
    return `${first_year}-${second_year}`;
};

module.exports = {
    get_so_financial_year
};
