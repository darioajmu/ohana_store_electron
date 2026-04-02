import { Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from '@nextui-org/table';
import { useEffect, useState } from 'react';
import { stockRequests } from '../../../requests/stock/stockRequest';
import { Button } from '@nextui-org/button';
import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, useDisclosure } from '@nextui-org/modal';
import { Input } from '@nextui-org/input';
import { toast } from 'react-toastify';

const StockTable = () => {
  const [stock, setStock] = useState<any[]>([]);
  const [quantityValue, setQuantityValue] = useState('');
  const [entry, setEntry] = useState('');
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
  const { getStock, editStock } = stockRequests();

  useEffect(() => {
    const fetchData = async () => {
      const response = await getStock();

      setStock(response);
    };
    fetchData();
  }, [setStock]);

  const columns = [
    { name: 'Producto', uid: 'product_name', sortable: true },
    { name: 'Cantidad', uid: 'quantity', sortable: true },
    { name: 'Acciones', uid: 'actions' },
  ];

  const onRowOpen = async (id: any) => {
    setEntry(id);
    onOpen();
  };
  const onSubmit = async () => {
    const response = await editStock(entry, quantityValue);

    if (response.status === 200) {
      setStock(await getStock());
      toast.success('Cantidad modificada correctamente');
    } else {
      toast.error('Algo ha ido mal. Vuelve a probar en unos minutos');
    }
    onClose();
  };
  const quantityOnChange = (value: any) => {
    setQuantityValue(value.target.value);
  };

  return (
    <>
      <Table>
        <TableHeader columns={columns}>
          {(column: any) => (
            <TableColumn key={column.uid} allowsSorting={column.sortable}>
              {column.name}
            </TableColumn>
          )}
        </TableHeader>
        <TableBody emptyContent={'No se han encontrado productos con stock'} items={stock}>
          {(item: any) => (
            <TableRow key={item.id}>
              <TableCell>{item.product_name}</TableCell>
              <TableCell>{item.quantity}</TableCell>
              <TableCell>
                <Button color='primary' onPress={() => onRowOpen(item.id)} className='mr-2'>
                  Modificar
                </Button>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          <ModalHeader className='flex flex-col gap-1'>Modificar Cantidad</ModalHeader>
          <ModalBody>
            <div>
              <div style={{ position: 'absolute' }}>Modificar Cantidad</div>
              <Input type='number' label='Cantidad' step='1' min='0' value={quantityValue} onChange={quantityOnChange}/>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button color='primary' onPress={onSubmit}>
              Pagar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );

};

export default StockTable;
