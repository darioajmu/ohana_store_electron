import { Button } from '@nextui-org/button';
import { CSVLink } from 'react-csv';
import { ExcelIcon } from '../../icons';
import dateFormat from '../../../shared/formats/dates/date.format';
import { useAppContext } from '../../../contexts/AppContext';

const OrdersTableDownloadButton = () => {
  const { filteredItems, startDate, endDate } = useAppContext();
  const totalSum = filteredItems.reduce((sum: number, item: any) => sum + Number(item.total ?? 0), 0);

  const formatReportDate = (value: Date | string | null | undefined) => {
    if (!value) return '';

    return new Date(value).toLocaleDateString('es-ES').replaceAll('/', '-');
  };

  const exportOrders = [
    [`Fecha Inicio: ${formatReportDate(startDate)}`],
    [`Fecha Final: ${formatReportDate(endDate)}`],
    [],
    ['Fecha', 'Nombre', 'Nombre (Nuevo)', 'Pagado', 'Total'],
    ...filteredItems.map((item: any) => {
      return [item.date, item.debtor_name, item.user_name, item.paid, item.total];
    }),
    ['', '', '', 'Total', totalSum],
  ];

  const filenameStartDate = startDate ? formatReportDate(startDate) : 'sin-fecha-inicio';
  const filenameEndDate = endDate ? formatReportDate(endDate) : 'sin-fecha-fin';

  return (
    <CSVLink
      data={exportOrders}
      filename={`ohana_ventas_${filenameStartDate}_${filenameEndDate}.csv`}
      separator={';'}
    >
      <Button className='h-14 min-h-14' color='primary' endContent={<ExcelIcon className='text-small' />}>
        Descargar
      </Button>
    </CSVLink>
  );
};

export default OrdersTableDownloadButton;
