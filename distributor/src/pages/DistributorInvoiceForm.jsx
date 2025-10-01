// components/DistributorInvoiceForm.jsx
import { useState } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { useGetOrderDetailsQuery } from '../services/distributorOrdersApi';
import { useCreateInvoiceFromOrderMutation } from '../services/distributorOrdersApi';

export default function DistributorInvoiceForm({ orderId, onClose }) {
  const { data } = useGetOrderDetailsQuery(orderId);
  const [createInvoice] = useCreateInvoiceFromOrderMutation();
  const [items, setItems] = useState([]);

  const order = data?.data;

  const handleSubmit = async () => {
    await createInvoice({ orderId, items });
    onClose();
  };

  if (!order) return <div>Loading...</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Invoice for {order.order_number}</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Batch</TableHead>
              <TableHead>Qty</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {order.items.map((item, idx) => (
              <TableRow key={item.item_id}>
                <TableCell>{item.Product.generic_name}</TableCell>
                <TableCell>
                  <Input
                    placeholder="Enter batch"
                    onChange={(e) => {
                      const newItems = [...items];
                      newItems[idx] = { ...item, batch_number: e.target.value, product_code: item.product_code };
                      setItems(newItems);
                    }}
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    defaultValue={item.quantity}
                    onChange={(e) => {
                      const newItems = [...items];
                      newItems[idx] = { ...item, quantity: parseInt(e.target.value), product_code: item.product_code };
                      setItems(newItems);
                    }}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className="flex gap-2 mt-4">
          <Button onClick={onClose} variant="outline">Cancel</Button>
          <Button onClick={handleSubmit}>Send Invoice</Button>
        </div>
      </CardContent>
    </Card>
  );
}