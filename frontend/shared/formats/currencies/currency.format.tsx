import { NumericFormat } from "react-number-format";

const currencyFormat = (price: number) => {
  return (
    <NumericFormat
      value={price}
      displayType={"text"}
      suffix={"€"}
      decimalScale={2}
      decimalSeparator={","}
    />
  );
};

export default currencyFormat;
