'use client';

import {
  Autocomplete,
  AutocompleteItem,
  Button,
  Card,
  CardBody,
  CardHeader,
  SortDescriptor,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from '@nextui-org/react';
import { DatePickerInput } from '@mantine/dates';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { productRequests } from '../../../requests/product/productRequests';
import { datePickerInputStyles } from '../../../shared/styles/datePickerInputStyles';
import { ExcelIcon } from '../../icons';

interface ProductsSoldReportRow {
  product_name: string;
  quantity: number;
}

interface ProductOption {
  name: string;
}

const formatRequestDate = (date: Date) => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');

  return `${year}-${month}-${day}`;
};

const formatReportDate = (date: Date | null) => {
  if (!date) return '';

  return date.toLocaleDateString('es-ES').replaceAll('/', '-');
};

const getCurrentMonthRange = () => {
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  return { endDate: lastDay, startDate: firstDay };
};

const ProductsSoldReport = () => {
  const defaultRange = useMemo(() => getCurrentMonthRange(), []);
  const [startDate, setStartDate] = useState<Date | null>(defaultRange.startDate);
  const [endDate, setEndDate] = useState<Date | null>(defaultRange.endDate);
  const [rows, setRows] = useState<ProductsSoldReportRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
    column: 'quantity',
    direction: 'descending',
  });
  const [productFilterValue, setProductFilterValue] = useState('');
  const [productAutocompleteValue, setProductAutocompleteValue] = useState('');

  const productOptions = useMemo(() => {
    return [...new Set(rows.map((row) => row.product_name))]
      .sort((first, second) => first.localeCompare(second, 'es'))
      .map((name) => ({ name }));
  }, [rows]);

  const shouldShowProducts = productAutocompleteValue.trim().length >= 3;

  const filteredProductOptions = useMemo(() => {
    if (!shouldShowProducts) return [];

    const normalizedSearch = productAutocompleteValue.trim().toLowerCase();

    return productOptions.filter((product) => product.name.toLowerCase().includes(normalizedSearch));
  }, [productAutocompleteValue, productOptions, shouldShowProducts]);

  const filteredRows = useMemo(() => {
    if (!productFilterValue) return rows;

    return rows.filter((row) => row.product_name === productFilterValue);
  }, [productFilterValue, rows]);

  const sortedRows = useMemo(() => {
    return [...filteredRows].sort((first, second) => {
      const firstValue =
        sortDescriptor.column === 'quantity'
          ? Number(first.quantity)
          : first.product_name.toLowerCase();
      const secondValue =
        sortDescriptor.column === 'quantity'
          ? Number(second.quantity)
          : second.product_name.toLowerCase();
      const comparison = firstValue < secondValue ? -1 : firstValue > secondValue ? 1 : 0;

      return sortDescriptor.direction === 'descending' ? -comparison : comparison;
    });
  }, [filteredRows, sortDescriptor]);

  const exportRows = useMemo(() => {
    return [
      [`Fecha Inicio: ${formatReportDate(startDate)}`],
      [`Fecha Final: ${formatReportDate(endDate)}`],
      [],
      ['Nombre del producto', 'Cantidad'],
      ...sortedRows.map((row) => [row.product_name, row.quantity]),
    ];
  }, [endDate, sortedRows, startDate]);

  const fetchReport = useCallback(async (nextStartDate: Date | null, nextEndDate: Date | null) => {
    if (!nextStartDate || !nextEndDate) {
      toast.error('Selecciona un rango de fechas');
      return;
    }

    setIsLoading(true);

    try {
      const { getSoldProducts } = productRequests();
      const response = await getSoldProducts(formatRequestDate(nextStartDate), formatRequestDate(nextEndDate));
      setRows(response);
      setProductFilterValue('');
      setProductAutocompleteValue('');
    } catch (_error) {
      toast.error('No se ha podido generar el informe');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReport(defaultRange.startDate, defaultRange.endDate);
  }, [defaultRange.endDate, defaultRange.startDate, fetchReport]);

  const handleChange = (range: [Date | null, Date | null]) => {
    const [nextStartDate, nextEndDate] = range;
    setStartDate(nextStartDate);
    setEndDate(nextEndDate);

    if (nextStartDate && nextEndDate) {
      fetchReport(nextStartDate, nextEndDate);
    }
  };

  const onProductSelectionChange = (value: string | null) => {
    setProductFilterValue(value || '');
    setProductAutocompleteValue(value || '');
  };

  const onProductInputChange = (value?: string) => {
    setProductAutocompleteValue(value || '');
  };

  const onProductClear = () => {
    setProductFilterValue('');
    setProductAutocompleteValue('');
  };

  const onDownload = () => {
    const csvContent = exportRows
      .map((row) =>
        row
          .map((cell) => String(cell ?? '').replaceAll(';', ','))
          .join(';')
      )
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = downloadUrl;
    link.download = `products_sold_${formatReportDate(startDate) || 'sin-fecha-inicio'}_${formatReportDate(endDate) || 'sin-fecha-fin'}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(downloadUrl);
  };

  return (
    <Card className='overflow-visible'>
      <CardHeader className='text-xl font-semibold'>Venta de productos</CardHeader>
      <CardBody className='flex flex-col gap-6 overflow-visible'>
        <div className='flex flex-wrap items-end gap-4'>
          <div className='w-full md:w-[35%]'>
            <DatePickerInput
              className='w-full'
              clearable
              dropdownType='popover'
              firstDayOfWeek={1}
              locale='es'
              placeholder='Filtrar por fechas'
              popoverProps={{ zIndex: 1000 }}
              styles={datePickerInputStyles}
              type='range'
              value={[startDate ?? null, endDate ?? null]}
              valueFormat='DD/MM/YYYY'
              onChange={handleChange}
            />
          </div>
          <Autocomplete
            className='max-w-xs'
            isClearable
            classNames={{ inputWrapper: 'h-14 min-h-14' }}
            defaultItems={shouldShowProducts ? filteredProductOptions : []}
            emptyContent={shouldShowProducts ? 'No se han encontrado productos' : 'Escribe al menos 3 letras'}
            label='Buscar por nombre de producto'
            inputValue={productAutocompleteValue}
            selectedKey={productFilterValue || null}
            onSelectionChange={(key) => onProductSelectionChange(key ? String(key) : null)}
            onInputChange={onProductInputChange}
            onClear={onProductClear}
          >
            {(product: ProductOption) => <AutocompleteItem key={product.name}>{product.name}</AutocompleteItem>}
          </Autocomplete>
          <Button className='h-14 min-h-14' color='primary' endContent={<ExcelIcon className='text-small' />} onPress={onDownload}>
            Descargar
          </Button>
        </div>

        <div className='text-default-400 text-small'>{filteredRows.length} productos en total</div>

        <Table
          aria-label='Tabla de venta de productos'
          isHeaderSticky
          isStriped
          sortDescriptor={sortDescriptor}
          onSortChange={setSortDescriptor}
        >
          <TableHeader>
            <TableColumn key='product_name' allowsSorting>
              Nombre del producto
            </TableColumn>
            <TableColumn key='quantity' allowsSorting>
              Cantidad
            </TableColumn>
          </TableHeader>
          <TableBody emptyContent='No se han encontrado ventas de productos' items={sortedRows} isLoading={isLoading}>
            {(item: ProductsSoldReportRow) => (
              <TableRow key={item.product_name}>
                <TableCell>{item.product_name}</TableCell>
                <TableCell>{item.quantity}</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardBody>
    </Card>
  );
};

export default ProductsSoldReport;
