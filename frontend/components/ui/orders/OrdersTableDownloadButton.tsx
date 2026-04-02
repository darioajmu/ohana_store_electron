import { Button } from '@nextui-org/button';
import { CSVLink } from 'react-csv';
import { ExcelIcon } from '../../icons';
import dateFormat from '../../../shared/formats/dates/date.format';
import { useAppContext } from '../../../contexts/AppContext';

const OrdersTableDownloadButton = () => {
  const { filteredItems } = useAppContext();

  const exportOrders = [
    ...filteredItems.map((item: any) => {
      return [item.date, item.debtor_name, item.total, item.paid];
    }),
  ];

  return (
    <CSVLink
      data={exportOrders}
      filename={`ohana_compras_${dateFormat(new Date())}.csv`}
      headers={['Fecha', 'Nombre', 'Total', 'Pagado']}
      separator={';'}
    >
      <Button color='primary' endContent={<ExcelIcon className='text-small' />} size='lg'>
        Descargar
      </Button>
    </CSVLink>
  );
};

export default OrdersTableDownloadButton;
