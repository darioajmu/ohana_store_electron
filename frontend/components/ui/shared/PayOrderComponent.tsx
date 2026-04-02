import { Checkbox, Input } from '@nextui-org/react';
import { FC, useState } from 'react';
import currencyFormat from '../../../shared/formats/currencies/currency.format';
import { useAppContext } from '../../../contexts/AppContext';

interface PayOrderComponentProps {
  showPayWithTikis: boolean;
  totalValue: any;
}

const PayOrderComponent: FC<PayOrderComponentProps> = (props: PayOrderComponentProps) => {
  const {
    setTotalValue,
    memberValue,
    payWithValue,
    setPayWithValue,
    calculateTotal,
    payWithTikisValue,
    setPayWithTikisValue,
    calculateRest,
    onPaidChange,
  } = useAppContext();
  const [exactPayValue, setExactPayValue] = useState(false);
  const onExactPayCheckboxChange = (value: any) => {
    setExactPayValue(value.target.checked);
    setPayWithValue(props.totalValue);
  };

  const onPayWithTikisCheckboxChange = (value: any): void => {
    if (value.target.checked) {
      setTotalValue(0);
    } else {
      calculateTotal(memberValue);
    }
    setPayWithTikisValue(value.target.checked);
    setExactPayValue(false);
    setPayWithValue(0);
  };

  return (
    <>
      <div>
        <p className='pt-2 pb-2'>Paga con:</p>
        <div style={{ width: '40%', float: 'right', position: 'relative' }}>
          {props.showPayWithTikis ? (
            <>
            <Checkbox
              defaultSelected={false}
              onChange={onPayWithTikisCheckboxChange}
              isSelected={payWithTikisValue}
              value={payWithTikisValue ? 'true' : 'false'}
            >
              <p>Tikis</p>
            </Checkbox>
            <br />
            </>
          ) : ('')
        }
          <Checkbox
            defaultSelected={false}
            onChange={onExactPayCheckboxChange}
            isSelected={exactPayValue}
            isDisabled={payWithTikisValue}
          >
            Importe Exacto
          </Checkbox>
          <Input
            type='number'
            step='0.1'
            endContent={'€'}
            onChange={onPaidChange}
            variant={'underlined'}
            min={0}
            disabled={exactPayValue || payWithTikisValue}
            value={String(payWithValue)}
          />
        </div>
      </div>
      <p className={'text-right pt-3 pb-3'}>Vuelta: {currencyFormat(calculateRest(payWithValue))}</p>
    </>
  );
};

export default PayOrderComponent;
